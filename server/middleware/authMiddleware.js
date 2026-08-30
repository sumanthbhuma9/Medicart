import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { memoryStore } from '../store/memoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medicart_jwt_secret_key_2026_super_secure');

      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const memUser = memoryStore.findUserById(decoded.id);
        if (memUser) {
          const { password, ...safeUser } = memUser;
          req.user = safeUser;
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User account not found' });
      }
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no auth token provided' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};
