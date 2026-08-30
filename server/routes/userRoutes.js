import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { memoryStore, INITIAL_USERS } from '../store/memoryStore.js';

const router = express.Router();

export const seedUsersIfEmpty = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('Seeding initial users into MongoDB Atlas...');
      for (const u of INITIAL_USERS) {
        await User.create(u);
      }
      console.log('Users seeded successfully!');
    }
  } catch (err) {
    console.error('User seed error:', err.message);
  }
};

// @route   GET /api/users
// @desc    Get all registered users
// @access  Private / Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await seedUsersIfEmpty();
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }

    // In-memory fallback
    const users = memoryStore.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users
// @desc    Admin manually create a user
// @access  Private / Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const userPassword = (password && password.trim().length >= 6) ? password.trim() : 'medicart123';

    if (mongoose.connection.readyState === 1) {
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone: phone || '8328579509',
        password: userPassword,
        role: role || 'customer',
      });

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      });
    }

    // In-memory fallback
    const exists = memoryStore.findUserByEmail(email);
    if (exists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await memoryStore.createUser({ name, email, phone, password: userPassword, role });
    const { password: _, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/users/:email
// @desc    Admin delete a user by email
// @access  Private / Admin
router.delete('/:email', protect, adminOnly, async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);

    // Prevent deleting main admin
    if (email.toLowerCase() === 'admin@sai.com') {
      return res.status(400).json({ message: 'Cannot delete the primary administrator' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await user.deleteOne();
      return res.json({ message: 'User removed successfully' });
    }

    // In-memory fallback
    const deleted = memoryStore.deleteUserByEmail(email);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
