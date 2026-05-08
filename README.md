# Clipo — Private & Secure Clipboard Sharing

Clipo is an anonymous, zero-knowledge clipboard for sharing text and code snippets across devices securely.

## 🚀 Deployment Checklist

Before deploying to production, ensure the following are configured on your hosting platform (Render, Railway, Netlify, Vercel, etc.):

### 1. Server Environment Variables
Set these on your backend host:
- `MONGO_URI`: Your production MongoDB Atlas connection string.
- `PORT`: Usually set automatically by the host, or default to `5000`.
- `ALLOWED_ORIGIN`: Set this to your **frontend** URL (e.g., `https://clipo.app`).
- `NODE_ENV`: Set to `production`. This prevents internal stack traces from leaking to users.

### 2. Frontend Environment Variables
Set these in your CI/CD settings:
- `VITE_API_URL`: Set this to your **backend** API URL (e.g., `https://api.clipo.app/api`).

### 3. Deletion Security
The system now generates a unique `deleteToken` for every clip. Manual deletion via the API requires this token in the `X-Delete-Token` header.

### 4. SPA Fallback
The project includes `public/_redirects` and `vercel.json` to ensure direct-linking to sub-pages works correctly on Netlify and Vercel.

## 🛠️ Local Development

1. `npm install` in both root and `server` directories.
2. Create `.env` files based on `.env.example`.
3. `npm run dev:all` to start both frontend and backend.

## 🚀 Deployment Guide

### 1. Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect this GitHub repository.
3. Set **Root Directory** to `server`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node index.js`.
6. Add the following **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `ALLOWED_ORIGIN`: Your Vercel frontend URL (e.g., `https://clipo-app.vercel.app`).
   - `NODE_ENV`: `production`.

### 2. Frontend (Vercel)
1. Create a new project on [Vercel](https://vercel.com).
2. Connect this GitHub repository.
3. Vercel will automatically detect the Vite setup.
4. Add the following **Environment Variable**:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://clipo-api.onrender.com/api`).
5. Click **Deploy**.
