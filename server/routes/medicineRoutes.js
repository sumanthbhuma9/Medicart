import express from 'express';
import Medicine from '../models/Medicine.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial seed data to populate database if catalog is empty
const INITIAL_PRODUCTS = [
  {
    numId: 1,
    name: "Paracetamol 650mg",
    category: "Analgesic & Antipyretic",
    price: 30.00,
    stock: 120,
    description: "Used to treat mild to moderate pain (from headaches, menstrual periods, toothaches, backaches, osteoarthritis, or cold/flu aches) and to reduce fever.",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><circle cx='50' cy='50' r='30' fill='%2310b981'/><rect x='45' y='30' width='10' height='40' fill='white'/><rect x='30' y='45' width='40' height='10' fill='white'/></svg>"
  },
  {
    numId: 2,
    name: "Cetirizine 10mg",
    category: "Antihistamine",
    price: 45.00,
    stock: 80,
    description: "An antihistamine used to relieve allergy symptoms such as watery eyes, runny nose, itching eyes/nose, sneezing, hives, and itching.",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><g transform='rotate(45 50 50)'><rect x='35' y='25' width='30' height='25' rx='10' fill='%233b82f6'/><rect x='35' y='50' width='30' height='25' rx='10' fill='%23ffffff'/></g></svg>"
  },
  {
    numId: 3,
    name: "Vitamin C 500mg",
    category: "Supplements",
    price: 65.00,
    stock: 200,
    description: "Ascorbic acid (Vitamin C) is used to prevent or treat low levels of vitamin C in people who do not get enough of the vitamin from their diets.",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><circle cx='50' cy='50' r='25' fill='%23f97316'/><text x='50' y='57' font-family='sans-serif' font-size='22' font-weight='bold' fill='white' text-anchor='middle'>C</text></svg>"
  },
  {
    numId: 4,
    name: "ORS (Oral Rehydration Salts)",
    category: "Rehydration",
    price: 20.00,
    stock: 150,
    description: "A combination of dry salts mixed with safe water. It helps rehydrate the body when it has lost too much fluid due to diarrhea, vomiting, or excessive sweating.",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><path d='M35,30 L65,30 L65,75 L35,75 Z' fill='%2306b6d4'/><text x='50' y='55' font-family='sans-serif' font-size='12' font-weight='bold' fill='white' text-anchor='middle'>ORS</text><path d='M45,63 L55,63 M50,58 L50,68' stroke='white' stroke-width='2'/></svg>"
  },
  {
    numId: 5,
    name: "Pain Relief Gel",
    category: "Topical Analgesic",
    price: 90.00,
    stock: 50,
    description: "Fast-acting topical gel designed to penetrate deep into muscles and joints to relieve pain associated with arthritis, backache, strains, and sprains.",
    image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' width='100' height='100'><rect width='100' height='100' fill='%23e2e8f0'/><path d='M40,20 L60,20 L55,75 L45,75 Z' fill='%23ec4899'/><rect x='45' y='75' width='10' height='8' fill='%23475569'/></svg>"
  }
];

// Helper function to seed initial data
export const seedMedicinesIfEmpty = async () => {
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
    await seedMedicinesIfEmpty();
    const { search, limit } = req.query;

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
    res.json(medicines);
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
    let medicine;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      medicine = await Medicine.findById(id);
    } else {
      medicine = await Medicine.findOne({ numId: parseInt(id) });
    }

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
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

    // Calculate max numId
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

    res.status(201).json(newMedicine);
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
    res.json(updatedMedicine);
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
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
