# Clipo — Private & Secure Clipboard Sharing

Clipo is an anonymous, zero-knowledge clipboard for sharing text and code snippets across devices securely. It uses client-side encryption to ensure that your data is never readable by the server.

## ✨ Key Features

- **🔒 Zero-Knowledge Security**: Your data is encrypted in your browser before it ever reaches the server.
- **🔑 Client-Side Encryption**: Uses AES-256-GCM (Web Crypto API). The decryption key is stored in the URL fragment (`#KEY`), which is never sent to the server.
- **⏱️ Auto-Expiry**: Clips are automatically deleted after they are retrieved or after a set period.
- **📱 Cross-Platform**: Share content seamlessly between your laptop, phone, and tablet.
- **⚡ Fast & Minimal**: No accounts, no tracking, just secure sharing.
- **🗑️ Secure Deletion**: Unique `deleteToken` for manual deletion via the API.

## 🛡️ Security Architecture

Clipo follows a strict privacy-first architecture:
1. **Encryption**: When you create a clip, a random AES-256 key is generated in your browser.
2. **Storage**: The encrypted ciphertext is sent to the backend, but the **key stays in your browser**.
3. **Retrieval**: The decryption key is appended to the URL as a hash fragment (e.g., `clipo.app/v/ID#KEY`). Browsers do not include the hash fragment in HTTP requests, so the server never sees the key.
4. **Decryption**: Only the recipient with the full link can decrypt the content locally.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (Vanilla CSS with Tailwind-like utilities), Lucide React.
- **Backend**: Node.js, Express, MongoDB.
- **Security**: Native Web Crypto API (AES-GCM).
- **Deployment**: Vercel (Frontend), Render/Railway (Backend).

## 🚀 Local Development

1. **Clone the repo**:
   ```bash
   git clone https://github.com/mdarmanahmed2106/Clipo.git
   cd Clipo
   ```

2. **Install Dependencies**:
   ```bash
   # Root (Frontend)
   npm install
   # Server (Backend)
   cd server && npm install && cd ..
   ```

3. **Configure Environment**:
   - Create a `.env` file in the `server` directory based on `.env.example`.
   - Create a `.env` file in the root directory for Vite variables.

4. **Run Locally**:
   ```bash
   npm run dev:all
   ```

## 🚀 Deployment Guide

### 1. Backend (Render/Railway)
1. Set **Root Directory** to `server`.
2. **Build Command**: `npm install`.
3. **Start Command**: `node index.js`.
4. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `ALLOWED_ORIGIN`: Your frontend URL.
   - `NODE_ENV`: `production`.

### 2. Frontend (Vercel)
1. Connect the repository.
2. Vercel will automatically detect the Vite setup.
3. **Environment Variable**:
   - `VITE_API_URL`: Your backend API URL.

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
