import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both server/ and project root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes, { seedMedicinesIfEmpty } from './routes/medicineRoutes.js';
import orderRoutes, { seedOrdersIfEmpty } from './routes/orderRoutes.js';
import userRoutes, { seedUsersIfEmpty } from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Connect to MongoDB Atlas (graceful fallback to memory store if unavailable)
connectDB().then(async (connected) => {
  if (connected) {
    await seedUsersIfEmpty();
    await seedMedicinesIfEmpty();
    await seedOrdersIfEmpty();
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Medicart API server is running smoothly.',
    status: 'online',
    port: process.env.PORT || 5001,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// In production (Render, Docker, Railway, VPS), serve Vite frontend build statically
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath) && !process.env.VERCEL) {
  app.use(express.static(distPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
} else {
  // Root check when frontend is run separately in dev
  app.get('/', (req, res) => {
    res.json({
      message: 'Medicart API server is running smoothly.',
      status: 'online',
      port: process.env.PORT || 5001,
    });
  });
}

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ message: `API Endpoint Not Found: ${req.originalUrl}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;

if (!process.env.VERCEL) {
  // Use port 5001 by default to avoid macOS AirPlay Receiver conflict on 5000
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Medicart Backend running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
}
