const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const clipsRouter = require('./routes/clips');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173').split(',');
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman/curl) in development only
    if (!origin && process.env.NODE_ENV !== 'production') return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Delete-Token'],
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const isDev = process.env.NODE_ENV === 'development';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 1000 : 30,    // max 1000 in dev, 30 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again in an hour.' },
});

// Stricter limit for clip creation
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 500 : 20,     // max 500 in dev, 20 in prod
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Clip creation limit reached. Please try again later.' },
});

app.use(express.json({ limit: '512kb' }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/clips', limiter);          // broad limit: all methods
app.post('/api/clips', createLimiter);   // stricter limit: POST only (must come BEFORE router)
app.use('/api/clips', clipsRouter);

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const msg = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  console.error('[ERROR]', err.message);
  res.status(status).json({ error: msg });
});

// ── MongoDB + Server start ────────────────────────────────────────────────────
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'clipo',
    });
    console.log('✅ MongoDB Atlas connected');

    app.listen(PORT, () => {
      console.log(`🚀 Clipo API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

start();
