import { useState, useCallback } from 'react';
import { generateKey, exportKey, importKey, encrypt, decrypt, isCryptoAvailable } from '../lib/crypto';
import { createClip, fetchClip, destroyClip } from '../lib/api';

// ── History helpers (localStorage) ──────────────────────────────────────────
const HISTORY_KEY = 'clipo_history';

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveToHistory(entry) {
  try {
    const history = loadHistory();
    // Prepend new entry, keep last 50
    const updated = [entry, ...history].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

// ── useSendClip ───────────────────────────────────────────────────────────────
export function useSendClip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = useCallback(async ({ content, retentionMinutes, burnOnRead }) => {
    if (!isCryptoAvailable()) {
      throw new Error('Your browser does not support Web Crypto API. Please upgrade your browser.');
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Generate a fresh AES-256-GCM key
      const key = await generateKey();
      // 2. Encrypt the content in the browser
      const { ciphertext, iv } = await encrypt(content, key);
      // 3. Export the key to URL-safe base64
      const exportedKey = await exportKey(key);
      // 4. Send encrypted data + key to the server (allows code-only retrieval)
      const result = await createClip({ ciphertext, iv, encryptionKey: exportedKey, retentionMinutes, burnOnRead });
      // 5. Build the share link — key goes in the fragment, never to the server
      const fullCode = `${result.code}:${exportedKey}`;
      const shareLink = `${window.location.origin}/retrieved#${fullCode}`;

      // 6. Persist to local history
      saveToHistory({
        code: result.code,
        fullCode,
        shareLink,
        retentionMinutes,
        burnOnRead,
        deleteToken: result.deleteToken, // Fix #3: Store delete token
        createdAt: new Date().toISOString(),
        expiresAt: result.expiresAt,
      });

      return { code: result.code, fullCode, shareLink, expiresAt: result.expiresAt };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { send, loading, error, clearError: () => setError(null) };
}

// ── useRetrieveClip ───────────────────────────────────────────────────────────
export function useRetrieveClip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Retrieve a clip using either:
   * (a) A code + key from the URL fragment (format: CODE:KEY)
   * (b) Just a code (if the key is embedded in the URL hash already)
   */
  const retrieve = useCallback(async (codeOrHash) => {
    if (!isCryptoAvailable()) {
      throw new Error('Your browser does not support Web Crypto API.');
    }
    setLoading(true);
    setError(null);
    try {
      // Parse "CODE:KEY" or just "CODE" (fallback: key must be in hash)
      let code, keyB64;

      // Handle cases where the input might contain the # fragment or a full URL
      let cleanInput = codeOrHash.trim();
      if (cleanInput.includes('#')) {
        cleanInput = cleanInput.split('#')[1];
      }

      if (cleanInput.includes(':')) {
        [code, keyB64] = cleanInput.split(':');
      } else {
        code = cleanInput;
        keyB64 = null;
      }

      if (!code) throw new Error('Invalid code provided.');
      code = code.toUpperCase().trim();

      // 1. Fetch encrypted payload from server
      const clip = await fetchClip(code);

      // 2. If no key was provided in the input, check the current URL hash as fallback
      if (!keyB64) {
        const hash = window.location.hash.slice(1);
        if (hash.includes(':') && hash.split(':')[0].toUpperCase() === code) {
          keyB64 = hash.split(':')[1];
        }
      }

      // If no key was found, try to recover from localStorage history (sender's device)
      if (!keyB64 || keyB64.length < 20) {
        const history = loadHistory();
        const entry = history.find(h => h.code?.toUpperCase() === code);
        if (entry?.fullCode) {
          const parts = entry.fullCode.split(':');
          if (parts.length === 2) {
            keyB64 = parts[1];
          }
        }
      }

      // If still no key, check if the server provided one (Code-Only Cross-Device Retrieval)
      if (!keyB64 || keyB64.length < 20) {
        if (clip.encryptionKey) {
          keyB64 = clip.encryptionKey;
        }
      }

      if (!keyB64 || keyB64.length < 20) {
        throw new Error('Decryption key not found. Please paste the full share link (including the #fragment) — the key is required to decrypt your content.');
      }

      // 3. Import the key
      const key = await importKey(keyB64);

      // 4. Decrypt locally
      const plaintext = await decrypt(clip.ciphertext, clip.iv, key);

      return {
        code: clip.code,
        content: plaintext,
        expiresAt: clip.expiresAt,
        burnOnRead: clip.burnOnRead,
        createdAt: clip.createdAt,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { retrieve, loading, error, clearError: () => setError(null) };
}

// ── useDestroyClip ────────────────────────────────────────────────────────────
export function useDestroyClip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const destroy = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    const upperCode = code.toUpperCase().trim();
    try {
      // Find token in history — use case-insensitive compare to match server behaviour
      const history = loadHistory();
      const entry = history.find(h => h.code?.toUpperCase() === upperCode);
      const token = entry?.deleteToken;

      await destroyClip(upperCode, token);

      // Remove from local history
      const updated = history.filter(h => h.code?.toUpperCase() !== upperCode);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { destroy, loading, error, clearError: () => setError(null) };
}

// ── useHistory ────────────────────────────────────────────────────────────────
export function useHistory() {
  const [history, setHistory] = useState(loadHistory);

  const refresh = useCallback(() => setHistory(loadHistory()), []);

  const remove = useCallback((code) => {
    const updated = loadHistory().filter(h => h.code !== code);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    setHistory(updated);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, refresh, remove, clear };
}
