import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { memoryStore } from '../store/memoryStore.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'medicart_jwt_secret_key_2026_super_secure', {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone: phone || '8328579509',
        password,
        role: role === 'admin' ? 'admin' : 'customer',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    // In-memory fallback
    const memExists = memoryStore.findUserByEmail(email);
    if (memExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const newUser = await memoryStore.createUser({ name, email, phone, password, role });
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Server error during signup' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        return res.json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
        });
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // In-memory fallback
    const memUser = memoryStore.findUserByEmail(email);
    if (memUser && (await memoryStore.verifyUserPassword(memUser, password))) {
      const token = generateToken(memUser._id);
      return res.json({
        success: true,
        token,
        user: {
          id: memUser._id,
          name: memUser.name,
          email: memUser.email,
          phone: memUser.phone,
          role: memUser.role,
        },
      });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
