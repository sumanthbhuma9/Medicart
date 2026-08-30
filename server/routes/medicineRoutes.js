import express from 'express';
import mongoose from 'mongoose';
import Medicine from '../models/Medicine.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { memoryStore, INITIAL_PRODUCTS } from '../store/memoryStore.js';

const router = express.Router();

// Helper function to seed initial data into MongoDB
export const seedMedicinesIfEmpty = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await Medicine.countDocuments();
    if (count === 0) {
      console.log('Seeding initial medicines into MongoDB Atlas...');
      await Medicine.insertMany(INITIAL_PRODUCTS);
      console.log('Medicines seeded successfully!');
    }
  } catch (err) {
    console.error('Medicine seed error:', err.message);
  }
};

// @route   GET /api/products
// @desc    Get all medicines (supports optional search query & limit)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, limit } = req.query;

    if (mongoose.connection.readyState === 1) {
      await seedMedicinesIfEmpty();

      let query = {};
      if (search) {
        const regex = new RegExp(search, 'i');
        query = {
          $or: [
            { name: regex },
            { category: regex },
            { description: regex }
          ]
        };
      }

      const limitNum = limit ? parseInt(limit) : (search ? 1000 : 2500);
      const medicines = await Medicine.find(query).sort({ numId: 1, createdAt: -1 }).limit(limitNum);
      return res.json(medicines);
    }

    // In-memory fallback
    const memList = memoryStore.getAllProducts({ search, limit });
    res.json(memList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let medicine;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        medicine = await Medicine.findById(id);
      } else {
        medicine = await Medicine.findOne({ numId: parseInt(id) });
      }

      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }
      return res.json(medicine);
    }

    // In-memory fallback
    const memProd = memoryStore.findProductById(id);
    if (!memProd) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(memProd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new medicine
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, stock, description, image } = req.body;

    if (mongoose.connection.readyState === 1) {
      const maxProduct = await Medicine.findOne().sort({ numId: -1 });
      const nextNumId = maxProduct && maxProduct.numId ? maxProduct.numId + 1 : 1;

      const newMedicine = await Medicine.create({
        numId: nextNumId,
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        description,
        image: image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><rect x='45' y='30' width='10' height='40' fill='%2394a3b8'/><rect x='30' y='45' width='40' height='10' fill='%2394a3b8'/></svg>",
      });

      return res.status(201).json(newMedicine);
    }

    // In-memory fallback
    const memNew = memoryStore.createProduct({ name, category, price, stock, description, image });
    res.status(201).json(memNew);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a medicine
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, description, image } = req.body;

    if (mongoose.connection.readyState === 1) {
      let medicine;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        medicine = await Medicine.findById(id);
      } else {
        medicine = await Medicine.findOne({ numId: parseInt(id) });
      }

      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }

      medicine.name = name || medicine.name;
      medicine.category = category || medicine.category;
      medicine.price = price !== undefined ? parseFloat(price) : medicine.price;
      medicine.stock = stock !== undefined ? parseInt(stock) : medicine.stock;
      medicine.description = description || medicine.description;
      if (image !== undefined) medicine.image = image;

      const updatedMedicine = await medicine.save();
      return res.json(updatedMedicine);
    }

    // In-memory fallback
    const updatedMem = memoryStore.updateProduct(id, { name, category, price, stock, description, image });
    if (!updatedMem) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(updatedMem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a medicine
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      let medicine;
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        medicine = await Medicine.findById(id);
      } else {
        medicine = await Medicine.findOne({ numId: parseInt(id) });
      }

      if (!medicine) {
        return res.status(404).json({ message: 'Medicine not found' });
      }

      await medicine.deleteOne();
      return res.json({ message: 'Medicine deleted successfully' });
    }

    // In-memory fallback
    const deleted = memoryStore.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
