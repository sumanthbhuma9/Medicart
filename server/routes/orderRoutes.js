import express from 'express';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Initial sample orders for seeding if empty
const INITIAL_ORDERS = [
  {
    numId: 1001,
    customerEmail: 'customer@sai.com',
    items: [
      {
        product: {
          id: 1,
          name: "Paracetamol 650mg",
          category: "Analgesic & Antipyretic",
          price: 30.00,
        },
        quantity: 2
      }
    ],
    total: 60.00,
    status: 'Pending',
    date: '2026-08-25'
  },
  {
    numId: 1002,
    customerEmail: 'vijay@sai.com',
    items: [
      {
        product: {
          id: 2,
          name: "Cetirizine 10mg",
          category: "Antihistamine",
          price: 45.00,
        },
        quantity: 1
      }
    ],
    total: 45.00,
    status: 'Delivered',
    date: '2026-08-24'
  }
];

export const seedOrdersIfEmpty = async () => {
  try {
    const count = await Order.countDocuments();
    if (count === 0) {
      console.log('Seeding initial orders into MongoDB Atlas...');
      await Order.insertMany(INITIAL_ORDERS);
      console.log('Orders seeded successfully!');
    }
  } catch (err) {
    console.error('Order seed error:', err.message);
  }
};

// @route   POST /api/orders
// @desc    Create new purchase order & update medicine stock in MongoDB
// @access  Private / Auth User
router.post('/', protect, async (req, res) => {
  try {
    const { items, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items array cannot be empty' });
    }

    const emailToUse = (req.user && req.user.email) || customerEmail;

    // Calculate total amount & deduct stock from DB
    let orderTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const prod = item.product;
      const qty = item.quantity || 1;
      const lineTotal = (prod.price || 0) * qty;
      orderTotal += lineTotal;

      orderItems.push({
        product: {
          id: prod.id || prod._id,
          _id: prod._id,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          description: prod.description,
          image: prod.image,
          stock: prod.stock,
        },
        quantity: qty,
      });

      // Deduct stock in MongoDB for this product
      if (prod.id || prod._id) {
        const prodId = prod._id || prod.id;
        let dbMedicine;
        if (typeof prodId === 'string' && prodId.match(/^[0-9a-fA-F]{24}$/)) {
          dbMedicine = await Medicine.findById(prodId);
        } else {
          dbMedicine = await Medicine.findOne({ numId: parseInt(prodId) });
        }

        if (dbMedicine) {
          dbMedicine.stock = Math.max(0, dbMedicine.stock - qty);
          await dbMedicine.save();
        }
      }
    }

    // Generate unique order numId
    const maxOrder = await Order.findOne().sort({ numId: -1 });
    const nextNumId = maxOrder && maxOrder.numId ? maxOrder.numId + 1 : 1003;

    const newOrder = await Order.create({
      numId: nextNumId,
      customerEmail: emailToUse.toLowerCase(),
      user: req.user ? req.user._id : null,
      items: orderItems,
      total: orderTotal,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
});

// @route   GET /api/orders
// @desc    Get orders (Admin: all orders, Customer: own orders)
// @access  Private / Auth User
router.get('/', protect, async (req, res) => {
  try {
    await seedOrdersIfEmpty();

    let orders;
    if (req.user && req.user.role === 'admin') {
      orders = await Order.find({}).sort({ createdAt: -1 });
    } else {
      orders = await Order.find({
        customerEmail: req.user.email.toLowerCase(),
      }).sort({ createdAt: -1 });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Pending -> Shipped -> Delivered)
// @access  Private / Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let order;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(id);
    } else {
      order = await Order.findOne({ numId: parseInt(id) });
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
