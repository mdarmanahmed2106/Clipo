/**
 * Clipo API client
 * All fetch() calls centralized here. Base URL from VITE_API_URL env var.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/**
 * Create a new clip on the server.
 * @param {{ ciphertext: string, iv: string, retentionMinutes: number, burnOnRead: boolean }} payload
 * @returns {Promise<{ code: string, expiresAt: string, burnOnRead: boolean }>}
 */
export async function createClip(payload) {
  const res = await fetch(`${BASE_URL}/clips`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Retrieve an encrypted clip by code.
 * @param {string} code
 * @returns {Promise<{ code: string, ciphertext: string, iv: string, expiresAt: string, burnOnRead: boolean, createdAt: string }>}
 */
export async function fetchClip(code) {
  const res = await fetch(`${BASE_URL}/clips/${encodeURIComponent(code)}`);
  return handleResponse(res);
}

/**
 * Manually destroy a clip before it expires.
 * @param {string} code
 * @param {string} deleteToken  — returned by createClip, stored in history
 * @returns {Promise<{ message: string }>}
 */
export async function destroyClip(code, deleteToken) {
  const res = await fetch(`${BASE_URL}/clips/${encodeURIComponent(code)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Delete-Token': deleteToken || '',
    },
  });
  return handleResponse(res);
}

/**
 * Check API health.
 * @returns {Promise<{ status: string, uptime: number, db: string }>}
 */
export async function checkHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  return handleResponse(res);
}
