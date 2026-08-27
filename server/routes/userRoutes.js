import express from 'express';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial sample users for seeding
const INITIAL_USERS = [
  {
    name: 'Admin Owner',
    email: 'admin@sai.com',
    password: 'admin123',
    phone: '8328579509',
    role: 'admin',
  },
  {
    name: 'Sai Kumar',
    email: 'customer@sai.com',
    password: 'customer123',
    phone: '8328579509',
    role: 'customer',
  },
  {
    name: 'Vijay Anand',
    email: 'vijay@sai.com',
    password: 'vijay123',
    phone: '9988776655',
    role: 'customer',
  },
  {
    name: 'Deepa Raj',
    email: 'deepa@sai.com',
    password: 'deepa123',
    phone: '8877665544',
    role: 'customer',
  },
];

export const seedUsersIfEmpty = async () => {
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
    await seedUsersIfEmpty();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/users
// @desc    Add user by admin
// @access  Private / Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '8328579509',
      role: role || 'customer',
      password: password || 'default123',
    });

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/users/:email
// @desc    Delete user by email or ID
// @access  Private / Admin
router.delete('/:email', protect, adminOnly, async (req, res) => {
  try {
    const target = req.params.email;

    if (target.toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    let user;
    if (target.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(target);
    }
    if (!user) {
      user = await User.findOne({ email: target.toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
