import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ROLES } from './utils/constants';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';

// Home page component
const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const { isDarkMode } = useTheme();

  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to E-commerce RBAC
          </h1>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A comprehensive e-commerce platform with role-based access control.
          </p>
          <div className="space-y-4">
            <a
              href="/login"
              className="btn-primary block w-full"
            >
              Get Started
            </a>
            <a
              href="/register"
              className="btn-secondary block w-full"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  switch (role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.SELLER:
      return <Navigate to="/seller" replace />;
    case ROLES.CUSTOMER:
      return <Navigate to="/customer" replace />;
    case ROLES.DELIVERY:
      return <Navigate to="/delivery" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Unauthorized page
const Unauthorized = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-6">
          <span className="text-red-600 font-bold text-2xl">!</span>
        </div>
        <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Access Denied
        </h1>
        <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          You don't have permission to access this page.
        </p>
        <a
          href="/"
          className="btn-primary"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

// App content component
const AppContent = () => {
  const { loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Navbar />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole={ROLES.ADMIN}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Seller routes */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute requiredRole={ROLES.SELLER}>
                  <SellerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Customer routes */}
            <Route
              path="/customer"
              element={
                <ProtectedRoute requiredRole={ROLES.CUSTOMER}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Delivery routes */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute requiredRole={ROLES.DELIVERY}>
                  <DeliveryDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Main App component
const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 