const { protect } = require('./auth');

// Middleware to check if user has specific role
const requireRole = (roles) => {
  return (req, res, next) => {
    // First check if user is authenticated
    protect(req, res, (err) => {
      if (err) return next(err);
      
      // Check if user has required role
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Convert single role to array for easier handling
      const requiredRoles = Array.isArray(roles) ? roles : [roles];

      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${requiredRoles.join(' or ')}`
        });
      }

      next();
    });
  };
};

// Middleware for admin only
const requireAdmin = requireRole('admin');

// Middleware for seller only
const requireSeller = requireRole('seller');

// Middleware for customer only
const requireCustomer = requireRole('customer');

// Middleware for delivery agent only
const requireDelivery = requireRole('delivery');

// Middleware for admin or seller
const requireAdminOrSeller = requireRole(['admin', 'seller']);

// Middleware for admin or delivery
const requireAdminOrDelivery = requireRole(['admin', 'delivery']);

// Middleware for any authenticated user
const requireAuth = (req, res, next) => {
  protect(req, res, next);
};

// Middleware to check resource ownership
const checkOwnership = (model, field = 'seller') => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      // Admin can access all resources
      if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      if (resource[field].toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only manage your own resources.'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Server error'
      });
    }
  };
};

// Middleware to check order ownership or delivery assignment
const checkOrderAccess = async (req, res, next) => {
  try {
    const Order = require('../models/Order');
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('delivery.deliveryAgent', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Admin can access all orders
    if (req.user.role === 'admin') {
      req.order = order;
      return next();
    }

    // Seller can access orders containing their products
    if (req.user.role === 'seller') {
      const Product = require('../models/Product');
      const orderProducts = await Product.find({
        _id: { $in: order.items.map(item => item.product) },
        seller: req.user._id
      });

      if (orderProducts.length > 0) {
        req.order = order;
        return next();
      }
    }

    // Customer can access their own orders
    if (req.user.role === 'customer' && order.customer._id.toString() === req.user._id.toString()) {
      req.order = order;
      return next();
    }

    // Delivery agent can access assigned orders
    if (req.user.role === 'delivery' && order.delivery.deliveryAgent && 
        order.delivery.deliveryAgent._id.toString() === req.user._id.toString()) {
      req.order = order;
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'Access denied. You cannot access this order.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Middleware to check if user can manage products
const canManageProducts = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'seller') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Access denied. Only admins and sellers can manage products.'
  });
};

// Middleware to check if user can manage orders
const canManageOrders = (req, res, next) => {
  if (['admin', 'seller', 'delivery'].includes(req.user.role)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Access denied. Only admins, sellers, and delivery agents can manage orders.'
  });
};

// Middleware to check if user can view analytics
const canViewAnalytics = (req, res, next) => {
  if (['admin', 'seller'].includes(req.user.role)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Access denied. Only admins and sellers can view analytics.'
  });
};

module.exports = {
  requireRole,
  requireAdmin,
  requireSeller,
  requireCustomer,
  requireDelivery,
  requireAdminOrSeller,
  requireAdminOrDelivery,
  requireAuth,
  checkOwnership,
  checkOrderAccess,
  canManageProducts,
  canManageOrders,
  canViewAnalytics
}; 