const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { customAlphabet } = require('nanoid');
const Clip = require('../models/Clip');

// Fix #7: customAlphabet guarantees exactly 6 alphanumeric chars, no filtering needed
const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
// Fix #3: 32-char hex token used to authorise deletions
const generateDeleteToken = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32);

// ── Validation schemas ──────────────────────────────────────────────────────
const CreateClipSchema = z.object({
  ciphertext: z.string().min(1).max(500_000), // max ~375 KB base64 (= 100 KB plaintext * ~3.75x)
  iv: z.string().min(1).max(64),
  retentionMinutes: z.number().int().min(1).max(1440).default(60),
  burnOnRead: z.boolean().default(false),
});

const CodeSchema = z.string().length(6).regex(/^[A-Z0-9]+$/);

// ── POST /api/clips ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const parsed = CreateClipSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { ciphertext, iv, retentionMinutes, burnOnRead } = parsed.data;

    // Generate a unique 6-char code (retry on collision)
    let code;
    let attempts = 0;
    do {
      code = generateCode(); // always exactly 6 A-Z0-9 chars
      attempts++;
      if (attempts > 10) return res.status(500).json({ error: 'Could not generate unique code' });
    } while (await Clip.exists({ code }));

    const expiresAt = new Date(Date.now() + retentionMinutes * 60 * 1000);
    const deleteToken = generateDeleteToken();

    await Clip.create({ code, ciphertext, iv, expiresAt, burnOnRead, deleteToken });

    return res.status(201).json({
      code,
      expiresAt,
      burnOnRead,
      deleteToken, // caller must store this to perform manual deletion
    });
  } catch (err) {
    console.error('POST /api/clips error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/clips/:code ─────────────────────────────────────────────────────
router.get('/:code', async (req, res) => {
  try {
    const codeParam = req.params.code.toUpperCase().trim();
    const parseResult = CodeSchema.safeParse(codeParam);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    const clip = await Clip.findOne({ code: codeParam });
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found or has expired' });
    }

    // Respond with encrypted payload
    const payload = {
      code: clip.code,
      ciphertext: clip.ciphertext,
      iv: clip.iv,
      expiresAt: clip.expiresAt,
      burnOnRead: clip.burnOnRead,
      createdAt: clip.createdAt,
    };

    // Burn on read: delete before responding
    if (clip.burnOnRead) {
      await Clip.deleteOne({ code: codeParam });
    }

    return res.status(200).json(payload);
  } catch (err) {
    console.error('GET /api/clips/:code error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── DELETE /api/clips/:code (manual destroy) ─────────────────────────────────
router.delete('/:code', async (req, res) => {
  try {
    const codeParam = req.params.code.toUpperCase().trim();
    const parseResult = CodeSchema.safeParse(codeParam);
    if (!parseResult.success) {
      return res.status(400).json({ error: 'Invalid code format' });
    }

    // Fix #3: Require delete token — only the creator holds this
    const token = req.headers['x-delete-token'];
    if (!token) {
      return res.status(401).json({ error: 'Missing X-Delete-Token header' });
    }

    const clip = await Clip.findOne({ code: codeParam }).select('+deleteToken');
    if (!clip) {
      return res.status(404).json({ error: 'Clip not found' });
    }
    if (clip.deleteToken !== token) {
      return res.status(403).json({ error: 'Invalid delete token' });
    }

    await Clip.deleteOne({ code: codeParam });
    return res.status(200).json({ message: 'Clip destroyed successfully' });
  } catch (err) {
    console.error('DELETE /api/clips/:code error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
