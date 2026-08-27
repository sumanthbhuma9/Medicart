import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes, { seedMedicinesIfEmpty } from './routes/medicineRoutes.js';
import orderRoutes, { seedOrdersIfEmpty } from './routes/orderRoutes.js';
import userRoutes, { seedUsersIfEmpty } from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB Atlas
connectDB().then(async () => {
  // Seed initial data if collections are empty
  await seedUsersIfEmpty();
  await seedMedicinesIfEmpty();
  await seedOrdersIfEmpty();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route check
app.get('/', (req, res) => {
  res.json({ message: 'Medicart API server is running smoothly.' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', medicineRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
