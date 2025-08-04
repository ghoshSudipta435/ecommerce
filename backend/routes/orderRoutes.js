const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { requireCustomer, checkOrderAccess, canManageOrders } = require('../middleware/roleCheck');

const router = express.Router();

// Validation rules
const orderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  body('payment.method')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'])
    .withMessage('Invalid payment method')
];

// @route   GET /api/orders
// @desc    Get orders (role-based)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { isActive: true };

    // Role-based filtering
    if (req.user.role === 'customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'seller') {
      // Get products by this seller
      const sellerProducts = await Product.find({ seller: req.user._id });
      filter['items.product'] = { $in: sellerProducts.map(p => p._id) };
    } else if (req.user.role === 'delivery') {
      filter['delivery.deliveryAgent'] = req.user._id;
    }
    // Admin can see all orders

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images')
      .populate('delivery.deliveryAgent', 'name email')
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private (role-based)
router.get('/:id', protect, checkOrderAccess, async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching order'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Customer only)
router.post('/', protect, requireCustomer, orderValidation, async (req, res) => {
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

    const { items, shippingAddress, billingAddress, payment, notes } = req.body;

    // Validate and get products
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.product} not found`
        });
      }

      if (!product.isActive) {
        return res.status(400).json({
          success: false,
          error: `Product ${product.name} is not available`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Calculate totals
    const tax = subtotal * 0.08; // 8% tax
    const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shippingCost;

    // Create order
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shippingCost,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: payment.method,
        status: 'pending'
      },
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sales: item.quantity }
      });
    }

    // Populate order data
    await order.populate('customer', 'name email phone');
    await order.populate('items.product', 'name price images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating order'
    });
  }
});

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Admin/Seller/Delivery)
router.patch('/:id/status', protect, canManageOrders, checkOrderAccess, [
  body('status')
    .isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
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

    const { status } = req.body;
    const order = req.order;

    // Role-based status restrictions
    if (req.user.role === 'seller') {
      if (!['pending', 'confirmed'].includes(status)) {
        return res.status(403).json({
          success: false,
          error: 'Sellers can only confirm orders'
        });
      }
    }

    if (req.user.role === 'delivery') {
      if (!['confirmed', 'shipped', 'delivered'].includes(status)) {
        return res.status(403).json({
          success: false,
          error: 'Delivery agents can only update shipping status'
        });
      }
    }

    // Update status
    order.status = status;
    
    // Update delivery agent if shipping
    if (status === 'shipped' && req.user.role === 'delivery') {
      order.delivery.deliveryAgent = req.user._id;
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order status'
    });
  }
});

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private (Admin only)
router.put('/:id', protect, checkOrderAccess, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update orders'
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price images')
      .populate('delivery.deliveryAgent', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating order'
    });
  }
});

// @route   DELETE /api/orders/:id
// @desc    Cancel order
// @access  Private (Customer - own orders, Admin - all orders)
router.delete('/:id', protect, checkOrderAccess, async (req, res) => {
  try {
    const order = req.order;

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Only pending orders can be cancelled'
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sales: -item.quantity }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while cancelling order'
    });
  }
});

// @route   POST /api/orders/:id/tracking
// @desc    Add tracking information
// @access  Private (Delivery agent)
router.post('/:id/tracking', protect, checkOrderAccess, [
  body('trackingNumber')
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required')
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

    if (req.user.role !== 'delivery') {
      return res.status(403).json({
        success: false,
        error: 'Only delivery agents can add tracking information'
      });
    }

    const { trackingNumber } = req.body;
    const order = req.order;

    order.delivery.trackingNumber = trackingNumber;
    order.delivery.deliveryAgent = req.user._id;
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

module.exports = router; 