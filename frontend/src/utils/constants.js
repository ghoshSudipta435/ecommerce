// User roles
export const ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer',
  DELIVERY: 'delivery'
};

// Product categories
export const CATEGORIES = {
  BOOKS: 'books',
  FOODS: 'foods',
  CLOTHING_MEN: 'clothing_men',
  CLOTHING_WOMEN: 'clothing_women'
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id) => `/api/products/${id}`,
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_BY_ID: (id) => `/api/orders/${id}`,
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id) => `/api/users/${id}`,
  
  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_ORDERS: '/api/admin/orders',
  
  // Seller
  SELLER_PRODUCTS: '/api/seller/products',
  SELLER_ORDERS: '/api/seller/orders',
  
  // Delivery
  DELIVERY_ORDERS: '/api/delivery/orders',
};

// Navigation menu items based on role
export const NAVIGATION_MENU = {
  [ROLES.ADMIN]: [
    { name: 'Dashboard', path: '/admin', icon: 'Home' },
    { name: 'Users', path: '/admin/users', icon: 'Users' },
    { name: 'Products', path: '/admin/products', icon: 'Package' },
    { name: 'Orders', path: '/admin/orders', icon: 'ShoppingCart' },
  ],
  [ROLES.SELLER]: [
    { name: 'Dashboard', path: '/seller', icon: 'Home' },
    { name: 'My Products', path: '/seller/products', icon: 'Package' },
    { name: 'My Orders', path: '/seller/orders', icon: 'ShoppingCart' },
    { name: 'Add Product', path: '/seller/add-product', icon: 'Plus' },
  ],
  [ROLES.CUSTOMER]: [
    { name: 'Home', path: '/', icon: 'Home' },
    { name: 'Products', path: '/products', icon: 'Package' },
    { name: 'My Orders', path: '/orders', icon: 'ShoppingCart' },
    { name: 'Profile', path: '/profile', icon: 'User' },
  ],
  [ROLES.DELIVERY]: [
    { name: 'Dashboard', path: '/delivery', icon: 'Home' },
    { name: 'My Deliveries', path: '/delivery/orders', icon: 'Truck' },
  ],
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
  ROLE: 'user_role',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
}; 