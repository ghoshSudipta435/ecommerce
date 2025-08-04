import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin,
  User,
  Phone,
  Eye,
  Navigation,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helper';
import api from '../utils/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import OrderCard from '../components/OrderCard';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom'; // Added missing import

const DeliveryDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    todayDeliveries: 0
  });
  const [assignedDeliveries, setAssignedDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch delivery dashboard statistics
      const statsResponse = await api.get('/api/delivery/dashboard/stats');
      setStats(statsResponse.data);
      
      // Fetch assigned deliveries
      const deliveriesResponse = await api.get('/api/delivery/orders');
      setAssignedDeliveries(deliveriesResponse.data.orders);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/delivery/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      shipped: 'text-purple-600 bg-purple-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

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
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back, {user?.name}! Here are your assigned deliveries.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/delivery/orders"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View all deliveries →
              </Link>
            </div>
          </div>

          {/* Completed Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedDeliveries}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="ml-1 text-sm text-green-600">Successfully delivered</span>
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/delivery/orders?status=pending"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View pending deliveries →
              </Link>
            </div>
          </div>

          {/* Today's Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to="/delivery/orders?date=today"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View today's schedule →
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/delivery/orders"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Truck className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">View Deliveries</p>
                  <p className="text-sm text-gray-600">See all assigned orders</p>
                </div>
              </div>
            </Link>

            <Link
              to="/delivery/map"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Navigation className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Map</p>
                  <p className="text-sm text-gray-600">Optimize your route</p>
                </div>
              </div>
            </Link>

            <Link
              to="/delivery/schedule"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Schedule</p>
                  <p className="text-sm text-gray-600">View delivery timeline</p>
                </div>
              </div>
            </Link>

            <Link
              to="/delivery/reports"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <Package className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reports</p>
                  <p className="text-sm text-gray-600">View delivery analytics</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Assigned Deliveries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Assigned Deliveries</h2>
            <Link
              to="/delivery/orders"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              View all deliveries →
            </Link>
          </div>
          
          {assignedDeliveries.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignedDeliveries.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Assigned on {formatDate(order.assignedAt || order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Customer</span>
                    </div>
                    <p className="text-sm text-gray-900">{order.customer?.name}</p>
                    <p className="text-sm text-gray-600">{order.customer?.email}</p>
                    {order.customer?.phone && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600">{order.customer.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Delivery Address</span>
                    </div>
                    <p className="text-sm text-gray-900">{order.shippingAddress?.street}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Items:</span>
                      <span className="text-sm font-medium text-gray-900">{order.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/delivery/orders/${order._id}`}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                    
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'shipped')}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Start Delivery</span>
                      </button>
                    )}
                    
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, 'delivered')}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Delivered</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Assigned</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any deliveries assigned at the moment. Check back later for new assignments.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4" />
                  <span>New deliveries will appear here automatically</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Delivery Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-1">• Always verify customer identity before delivery</p>
              <p className="font-medium mb-1">• Update delivery status promptly</p>
              <p className="font-medium mb-1">• Contact customer if delivery is delayed</p>
            </div>
            <div>
              <p className="font-medium mb-1">• Take photos for proof of delivery</p>
              <p className="font-medium mb-1">• Follow safety protocols</p>
              <p className="font-medium mb-1">• Report any issues immediately</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard; 