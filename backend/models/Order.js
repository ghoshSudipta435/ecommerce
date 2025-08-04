const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    },
    country: {
      type: String,
      default: 'USA'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash_on_delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  delivery: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    deliveryAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notes: {
    customer: String,
    internal: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for order status timeline
orderSchema.virtual('statusTimeline').get(function() {
  const timeline = [];
  
  if (this.createdAt) {
    timeline.push({
      status: 'created',
      date: this.createdAt,
      description: 'Order placed'
    });
  }
  
  if (this.status === 'confirmed' || this.status === 'shipped' || this.status === 'delivered') {
    timeline.push({
      status: 'confirmed',
      date: this.updatedAt,
      description: 'Order confirmed'
    });
  }
  
  if (this.status === 'shipped' || this.status === 'delivered') {
    timeline.push({
      status: 'shipped',
      date: this.updatedAt,
      description: 'Order shipped'
    });
  }
  
  if (this.status === 'delivered') {
    timeline.push({
      status: 'delivered',
      date: this.updatedAt,
      description: 'Order delivered'
    });
  }
  
  return timeline;
});

// Virtual for order summary
orderSchema.virtual('summary').get(function() {
  return {
    orderNumber: this.orderNumber,
    status: this.status,
    total: this.total,
    itemCount: this.items.length,
    createdAt: this.createdAt
  };
});

// Indexes for better query performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'delivery.deliveryAgent': 1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Pre-save middleware to calculate totals
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate total
    this.total = this.subtotal + this.tax + this.shippingCost;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

// Method to add delivery tracking
orderSchema.methods.addTracking = function(trackingNumber, deliveryAgent) {
  this.delivery.trackingNumber = trackingNumber;
  this.delivery.deliveryAgent = deliveryAgent;
  return this.save();
};

// Method to mark as delivered
orderSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.delivery.actualDelivery = new Date();
  return this.save();
};

// Method to calculate order statistics
orderSchema.methods.getStatistics = function() {
  return {
    totalItems: this.items.reduce((sum, item) => sum + item.quantity, 0),
    averageItemPrice: this.subtotal / this.items.length,
    taxRate: (this.tax / this.subtotal) * 100,
    shippingPercentage: (this.shippingCost / this.total) * 100
  };
};

// Static method to find orders by customer
orderSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).populate('items.product');
};

// Static method to find orders by status
orderSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('customer', 'name email');
};

// Static method to find orders by delivery agent
orderSchema.statics.findByDeliveryAgent = function(agentId) {
  return this.find({ 'delivery.deliveryAgent': agentId });
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema); 