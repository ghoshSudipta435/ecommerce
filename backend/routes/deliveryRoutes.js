const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { requireDelivery } = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/delivery/dashboard
// @desc    Get delivery agent dashboard
// @access  Private (Delivery only)
router.get('/dashboard', protect, requireDelivery, async (req, res) => {
  try {
    // Get delivery statistics
    const totalDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id
    });

    const completedDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id,
      status: 'delivered'
    });

    const pendingDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id,
      status: { $in: ['confirmed', 'shipped'] }
    });

    // Get today's deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Get assigned deliveries
    const assignedDeliveries = await Order.find({
      'delivery.deliveryAgent': req.user._id,
      status: { $in: ['confirmed', 'shipped'] }
    })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images')
      .sort('-createdAt')
      .limit(10);

    // Get recent completed deliveries
    const recentCompleted = await Order.find({
      'delivery.deliveryAgent': req.user._id,
      status: 'delivered'
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort('-delivery.actualDelivery')
      .limit(5);

    res.json({
      success: true,
      data: {
        statistics: {
          total: totalDeliveries,
          completed: completedDeliveries,
          pending: pendingDeliveries,
          today: todaysDeliveries
        },
        assignedDeliveries,
        recentCompleted
      }
    });

  } catch (error) {
    console.error('Delivery dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/delivery/orders
// @desc    Get delivery agent's assigned orders
// @access  Private (Delivery only)
router.get('/orders', protect, requireDelivery, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['confirmed', 'shipped', 'delivered']),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'delivery.estimatedDelivery', '-delivery.estimatedDelivery'])
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = {
      'delivery.deliveryAgent': req.user._id,
      isActive: true
    };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name price images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get delivery orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/delivery/orders/:id
// @desc    Get single delivery order
// @access  Private (Delivery only)
router.get('/orders/:id', protect, requireDelivery, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      'delivery.deliveryAgent': req.user._id
    })
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name price images weight dimensions');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get delivery order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order'
    });
  }
});

// @route   PATCH /api/delivery/orders/:id/status
// @desc    Update delivery status
// @access  Private (Delivery only)
router.patch('/orders/:id/status', protect, requireDelivery, [
  body('status')
    .isIn(['confirmed', 'shipped', 'delivered'])
    .withMessage('Invalid status for delivery agent'),
  body('estimatedDelivery').optional().isISO8601(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { status, estimatedDelivery, notes } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      'delivery.deliveryAgent': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you'
      });
    }

    // Update order status
    order.status = status;
    
    if (estimatedDelivery) {
      order.delivery.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (status === 'delivered') {
      order.delivery.actualDelivery = new Date();
    }

    if (notes) {
      order.notes = { ...order.notes, delivery: notes };
    }

    await order.save();

    // Populate order data
    await order.populate('customer', 'name email phone address');
    await order.populate('items.product', 'name price images');

    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating delivery status'
    });
  }
});

// @route   POST /api/delivery/orders/:id/tracking
// @desc    Add tracking information
// @access  Private (Delivery only)
router.post('/orders/:id/tracking', protect, requireDelivery, [
  body('trackingNumber')
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { trackingNumber, notes } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      'delivery.deliveryAgent': req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not assigned to you'
      });
    }

    order.delivery.trackingNumber = trackingNumber;
    
    if (notes) {
      order.notes = { ...order.notes, delivery: notes };
    }

    await order.save();

    res.json({
      success: true,
      message: 'Tracking information added successfully',
      data: order
    });

  } catch (error) {
    console.error('Add tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding tracking information'
    });
  }
});

// @route   GET /api/delivery/schedule
// @desc    Get delivery schedule
// @access  Private (Delivery only)
router.get('/schedule', protect, requireDelivery, [
  query('date').optional().isISO8601(),
  query('status').optional().isIn(['confirmed', 'shipped', 'delivered'])
], async (req, res) => {
  try {
    const { date, status } = req.query;

    const filter = {
      'delivery.deliveryAgent': req.user._id,
      isActive: true
    };

    if (status) filter.status = status;

    if (date) {
      const selectedDate = new Date(date);
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);

      filter.createdAt = {
        $gte: selectedDate,
        $lt: nextDate
      };
    }

    const schedule = await Order.find(filter)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name price images')
      .sort('delivery.estimatedDelivery')
      .limit(50);

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error('Get delivery schedule error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching schedule'
    });
  }
});

// @route   GET /api/delivery/reports
// @desc    Get delivery reports
// @access  Private (Delivery only)
router.get('/reports', protect, requireDelivery, [
  query('period').optional().isIn(['7', '30', '90']),
  query('type').optional().isIn(['daily', 'weekly', 'monthly'])
], async (req, res) => {
  try {
    const { period = '30', type = 'daily' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Delivery statistics
    const deliveryStats = await Order.aggregate([
      {
        $match: {
          'delivery.deliveryAgent': req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]);

    // Daily delivery trends
    const dailyTrends = await Order.aggregate([
      {
        $match: {
          'delivery.deliveryAgent': req.user._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          deliveries: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Performance metrics
    const totalDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id,
      createdAt: { $gte: startDate }
    });

    const completedDeliveries = await Order.countDocuments({
      'delivery.deliveryAgent': req.user._id,
      status: 'delivered',
      createdAt: { $gte: startDate }
    });

    const completionRate = totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0;

    res.json({
      success: true,
      data: {
        statistics: deliveryStats,
        trends: dailyTrends,
        metrics: {
          total: totalDeliveries,
          completed: completedDeliveries,
          completionRate: Math.round(completionRate * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('Get delivery reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching reports'
    });
  }
});

// @route   POST /api/delivery/orders/:id/complete
// @desc    Mark delivery as completed
// @access  Private (Delivery only)
router.post('/orders/:id/complete', protect, requireDelivery, [
  body('notes').optional().trim(),
  body('signature').optional().trim()
], async (req, res) => {
  try {
    const { notes, signature } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      'delivery.deliveryAgent': req.user._id,
      status: { $in: ['confirmed', 'shipped'] }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not ready for completion'
      });
    }

    // Mark as delivered
    order.status = 'delivered';
    order.delivery.actualDelivery = new Date();
    
    if (notes) {
      order.notes = { ...order.notes, delivery: notes };
    }

    if (signature) {
      order.delivery.signature = signature;
    }

    await order.save();

    // Populate order data
    await order.populate('customer', 'name email phone address');
    await order.populate('items.product', 'name price images');

    res.json({
      success: true,
      message: 'Delivery completed successfully',
      data: order
    });

  } catch (error) {
    console.error('Complete delivery error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while completing delivery'
    });
  }
});

module.exports = router; 