import express from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { memoryStore, INITIAL_ORDERS } from '../store/memoryStore.js';

const router = express.Router();

export const seedOrdersIfEmpty = async () => {
  if (mongoose.connection.readyState !== 1) return;
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
// @desc    Create new purchase order & update medicine stock
// @access  Private / Auth User
router.post('/', protect, async (req, res) => {
  try {
    const { items, customerEmail } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items array cannot be empty' });
    }

    const emailToUse = (req.user && req.user.email) || customerEmail;

    if (mongoose.connection.readyState === 1) {
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

      return res.status(201).json(newOrder);
    }

    // In-memory fallback
    const newOrder = memoryStore.createOrder({
      items,
      customerEmail: emailToUse,
      user: req.user,
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
    if (mongoose.connection.readyState === 1) {
      await seedOrdersIfEmpty();

      let orders;
      if (req.user && req.user.role === 'admin') {
        orders = await Order.find({}).sort({ createdAt: -1 });
      } else {
        orders = await Order.find({
          customerEmail: req.user.email.toLowerCase(),
        }).sort({ createdAt: -1 });
      }

      return res.json(orders);
    }

    // In-memory fallback
    const orders = memoryStore.getAllOrders(req.user);
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

    if (mongoose.connection.readyState === 1) {
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
      return res.json(updatedOrder);
    }

    // In-memory fallback
    const updatedOrder = memoryStore.updateOrderStatus(id, status);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
