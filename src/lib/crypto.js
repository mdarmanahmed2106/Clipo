/**
 * Clipo — Client-Side AES-256-GCM Encryption
 *
 * Uses the native Web Crypto API (zero npm dependencies).
 * The decryption key is NEVER sent to the server — it lives
 * only in the URL fragment (#KEY), which browsers never include
 * in HTTP requests.
 */

const ALGO = 'AES-GCM';
const KEY_LENGTH = 256;

/**
 * Generate a new random AES-GCM CryptoKey.
 * @returns {Promise<CryptoKey>}
 */
export async function generateKey() {
  return window.crypto.subtle.generateKey(
    { name: ALGO, length: KEY_LENGTH },
    true,          // extractable = we need to export it to share
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a URL-safe base64 string.
 * @param {CryptoKey} key
 * @returns {Promise<string>}
 */
export async function exportKey(key) {
  const raw = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64Url(raw);
}

/**
 * Import a URL-safe base64 string back into a CryptoKey.
 * @param {string} b64url
 * @returns {Promise<CryptoKey>}
 */
export async function importKey(b64url) {
  const raw = base64UrlToArrayBuffer(b64url);
  return window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: ALGO, length: KEY_LENGTH },
    false,
    ['decrypt']
  );
}

/**
 * Encrypt plaintext with a CryptoKey.
 * @param {string} plaintext
 * @param {CryptoKey} key
 * @returns {Promise<{ ciphertext: string, iv: string }>} base64-encoded values
 */
export async function encrypt(plaintext, key) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertextBuffer),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * Decrypt ciphertext with a CryptoKey.
 * @param {string} ciphertextB64 - base64 encoded ciphertext
 * @param {string} ivB64 - base64 encoded IV
 * @param {CryptoKey} key
 * @returns {Promise<string>} plaintext
 */
export async function decrypt(ciphertextB64, ivB64, key) {
  const ciphertextBuffer = base64ToArrayBuffer(ciphertextB64);
  const ivBuffer = base64ToArrayBuffer(ivB64);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: ALGO, iv: new Uint8Array(ivBuffer) },
    key,
    ciphertextBuffer
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Check if Web Crypto API is available.
 * @returns {boolean}
 */
export function isCryptoAvailable() {
  return typeof window !== 'undefined' &&
    typeof window.crypto !== 'undefined' &&
    typeof window.crypto.subtle !== 'undefined';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// URL-safe base64 (no +/= that would break URL fragments)
function arrayBufferToBase64Url(buffer) {
  return arrayBufferToBase64(buffer)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64UrlToArrayBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
  return base64ToArrayBuffer(padded);
}
