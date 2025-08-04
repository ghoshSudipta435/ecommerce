import React from 'react';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helper';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  Edit,
  MapPin,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

const OrderCard = ({ 
  order, 
  onView, 
  onEdit, 
  onUpdateStatus,
  showActions = true 
}) => {
  const { role } = useAuth();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <Package className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const canUpdateStatus = () => {
    if (role === ROLES.ADMIN) return true;
    if (role === ROLES.SELLER && order.status === 'pending') return true;
    if (role === ROLES.DELIVERY && ['confirmed', 'shipped'].includes(order.status)) return true;
    return false;
  };

  const getNextStatus = () => {
    switch (order.status) {
      case 'pending':
        return 'confirmed';
      case 'confirmed':
        return 'shipped';
      case 'shipped':
        return 'delivered';
      default:
        return null;
    }
  };

  const handleStatusUpdate = () => {
    const nextStatus = getNextStatus();
    if (nextStatus && onUpdateStatus) {
      onUpdateStatus(order._id, nextStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Order Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Order #{order.orderNumber}
          </h3>
          <p className="text-sm text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            <span className="ml-1">{getStatusText(order.status)}</span>
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Customer Info */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Customer</span>
          </div>
          <p className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</p>
          <p className="text-sm text-gray-600">{order.customer?.email || 'N/A'}</p>
        </div>

        {/* Shipping Address */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Shipping Address</span>
          </div>
          <p className="text-sm text-gray-900">{order.shippingAddress?.street || 'N/A'}</p>
          <p className="text-sm text-gray-600">
            {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Order Items</h4>
        <div className="space-y-2">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                  <p className="text-gray-600">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Subtotal:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Shipping:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(order.shippingCost)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tax:</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(order.tax)}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
          <span className="text-base font-semibold text-gray-900">Total:</span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView?.(order)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>View Details</span>
          </button>
          
          {role === ROLES.ADMIN && (
            <button
              onClick={() => onEdit?.(order)}
              className="btn-primary flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          )}
          
          {canUpdateStatus() && getNextStatus() && (
            <button
              onClick={handleStatusUpdate}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as {getNextStatus()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderCard; 