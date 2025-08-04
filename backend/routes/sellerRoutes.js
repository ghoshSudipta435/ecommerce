const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');
const { requireSeller } = require('../middleware/roleCheck');

const router = express.Router();

// @route   GET /api/seller/dashboard
// @desc    Get seller dashboard statistics
// @access  Private (Seller only)
router.get('/dashboard', protect, requireSeller, async (req, res) => {
  try {
    // Get product statistics
    const totalProducts = await Product.countDocuments({ seller: req.user._id });
    const activeProducts = await Product.countDocuments({ 
      seller: req.user._id, 
      isActive: true 
    });
    const lowStockProducts = await Product.countDocuments({ 
      seller: req.user._id,
      stock: { $lte: 5 }, 
      isActive: true 
    });

    // Get order statistics for seller's products
    const sellerProducts = await Product.find({ seller: req.user._id });
    const productIds = sellerProducts.map(p => p._id);

    const totalOrders = await Order.countDocuments({
      'items.product': { $in: productIds }
    });

    const orderStats = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIds }
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

    // Calculate total revenue
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIds },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({
      'items.product': { $in: productIds }
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name price')
      .sort('-createdAt')
      .limit(5);

    // Get top selling products
    const topProducts = await Product.find({ seller: req.user._id })
      .sort('-sales')
      .limit(5);

    res.json({
      success: true,
      data: {
        statistics: {
          products: {
            total: totalProducts,
            active: activeProducts,
            lowStock: lowStockProducts
          },
          orders: {
            total: totalOrders,
            byStatus: orderStats,
            revenue: totalRevenue[0]?.total || 0
          }
        },
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error('Seller dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/seller/products
// @desc    Get seller's products
// @access  Private (Seller only)
router.get('/products', protect, requireSeller, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isIn(['books', 'foods', 'clothing_men', 'clothing_women']),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().trim(),
  query('sort').optional().isIn(['name', '-name', 'price', '-price', 'sales', '-sales', 'createdAt', '-createdAt'])
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sort = '-createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { seller: req.user._id };

    if (category) filter.category = category;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/seller/products/:id
// @desc    Get single seller product
// @access  Private (Seller only)
router.get('/products/:id', protect, requireSeller, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get seller product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/seller/products
// @desc    Create new product
// @access  Private (Seller only)
router.post('/products', protect, requireSeller, [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('category')
    .isIn(['books', 'foods', 'clothing_men', 'clothing_women'])
    .withMessage('Invalid category'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('images')
    .isArray({ min: 1 })
    .withMessage('At least one image is required'),
  body('images.*')
    .isURL()
    .withMessage('Invalid image URL')
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

    const productData = {
      ...req.body,
      seller: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/seller/products/:id
// @desc    Update seller's product
// @access  Private (Seller only)
router.put('/products/:id', protect, requireSeller, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('category').optional().isIn(['books', 'foods', 'clothing_men', 'clothing_women']),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray({ min: 1 }),
  body('images.*').optional().isURL()
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

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user._id
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/seller/products/:id
// @desc    Delete seller's product
// @access  Private (Seller only)
router.delete('/products/:id', protect, requireSeller, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting product'
    });
  }
});

// @route   GET /api/seller/orders
// @desc    Get orders containing seller's products
// @access  Private (Seller only)
router.get('/orders', protect, requireSeller, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  query('sort').optional().isIn(['createdAt', '-createdAt', 'total', '-total'])
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get seller's products
    const sellerProducts = await Product.find({ seller: req.user._id });
    const productIds = sellerProducts.map(p => p._id);

    const filter = {
      'items.product': { $in: productIds },
      isActive: true
    };

    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
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
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/seller/analytics
// @desc    Get seller analytics
// @access  Private (Seller only)
router.get('/analytics', protect, requireSeller, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get seller's products
    const sellerProducts = await Product.find({ seller: req.user._id });
    const productIds = sellerProducts.map(p => p._id);

    // Sales analytics
    const salesData = await Order.aggregate([
      {
        $match: {
          'items.product': { $in: productIds },
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Product performance
    const productPerformance = await Product.aggregate([
      {
        $match: {
          seller: req.user._id,
          isActive: true
        }
      },
      {
        $project: {
          name: 1,
          sales: 1,
          revenue: { $multiply: ['$price', '$sales'] },
          stock: 1,
          rating: 1
        }
      },
      { $sort: { sales: -1 } }
    ]);

    // Category performance
    const categoryPerformance = await Product.aggregate([
      {
        $match: {
          seller: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalSales: { $sum: '$sales' },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating.average' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        productPerformance,
        categoryPerformance
      }
    });

  } catch (error) {
    console.error('Seller analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching analytics'
    });
  }
});

module.exports = router; 