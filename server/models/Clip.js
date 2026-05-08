const mongoose = require('mongoose');

const ClipSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    // AES-GCM ciphertext (base64 encoded) — server never sees plaintext
    ciphertext: {
      type: String,
      required: true,
    },
    // AES-GCM initialization vector (base64 encoded)
    iv: {
      type: String,
      required: true,
    },
    // TTL field — MongoDB auto-deletes documents after this date
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: document deleted at expiresAt
    },
    burnOnRead: {
      type: Boolean,
      default: false,
    },
    // Deletion token — returned only at creation, required to manually delete
    deleteToken: {
      type: String,
      required: true,
      select: false, // never returned in GET queries by default
    },
    // Metadata (no PII)
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model('Clip', ClipSchema);
