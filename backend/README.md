# E-commerce RBAC Backend API

A comprehensive Node.js backend API for the E-commerce RBAC application with role-based access control, featuring user management, product management, order processing, and delivery tracking.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Seller, Customer, Delivery)
- Password hashing with bcrypt
- Token verification middleware
- Role-specific route protection

### 👥 User Management
- User registration and login
- Role-based user profiles
- User statistics and analytics
- Account management (Admin only)

### 📦 Product Management
- CRUD operations for products
- Category-based organization
- Stock management
- Product ratings and reviews
- Image handling
- Seller-specific product management

### 🛒 Order Management
- Order creation and processing
- Status tracking (pending, confirmed, shipped, delivered)
- Payment integration
- Order history and analytics
- Role-based order access

### 🚚 Delivery System
- Delivery agent assignment
- Real-time status updates
- Tracking number management
- Delivery scheduling
- Performance analytics

### 📊 Analytics & Reporting
- Sales analytics
- User statistics
- Product performance metrics
- Delivery reports
- Revenue tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, rate-limiting
- **Logging**: morgan
- **Compression**: compression

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/            # Business logic (if needed)
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── roleCheck.js       # Role-based access control
├── models/
│   ├── User.js            # User model with roles
│   ├── Product.js         # Product model
│   └── Order.js           # Order model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── productRoutes.js   # Product management
│   ├── orderRoutes.js     # Order processing
│   ├── adminRoutes.js     # Admin-specific routes
│   ├── sellerRoutes.js    # Seller-specific routes
│   └── deliveryRoutes.js  # Delivery management
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-website/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce-rbac

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### MongoDB Setup

1. **Local MongoDB**
   ```bash
   # Install MongoDB locally
   # Start MongoDB service
   mongod
   ```

2. **MongoDB Atlas (Cloud)**
   - Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Get connection string
   - Update `MONGODB_URI` in `.env`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "customer",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "customer"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=10&category=books&search=novel
Authorization: Bearer <token>
```

#### Create Product (Seller/Admin)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "Product description",
  "category": "books",
  "price": 29.99,
  "stock": 100,
  "images": ["https://example.com/image.jpg"]
}
```

### Order Endpoints

#### Create Order (Customer)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "product": "product_id",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "payment": {
    "method": "credit_card"
  }
}
```

### Admin Endpoints

#### Get Dashboard Statistics
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=customer
Authorization: Bearer <token>
```

### Seller Endpoints

#### Get Seller Dashboard
```http
GET /api/seller/dashboard
Authorization: Bearer <token>
```

#### Get Seller Products
```http
GET /api/seller/products?page=1&limit=10
Authorization: Bearer <token>
```

### Delivery Endpoints

#### Get Delivery Dashboard
```http
GET /api/delivery/dashboard
Authorization: Bearer <token>
```

#### Update Delivery Status
```http
PATCH /api/delivery/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "delivered",
  "notes": "Delivered successfully"
}
```

## 🔐 Role-Based Access Control

### Admin Role
- Full system access
- User management
- Product management
- Order management
- Analytics and reporting

### Seller Role
- Product management (own products)
- Order management (own products)
- Sales analytics
- Inventory management

### Customer Role
- Browse products
- Place orders
- View order history
- Rate products

### Delivery Role
- View assigned deliveries
- Update delivery status
- Track deliveries
- Generate delivery reports

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📊 Database Models

### User Model
- Basic info (name, email, phone)
- Role-based access
- Address information
- Account preferences
- Authentication data

### Product Model
- Product details (name, description, price)
- Category classification
- Stock management
- Rating system
- Seller association

### Order Model
- Customer information
- Order items
- Status tracking
- Payment details
- Delivery information

## 🚀 Deployment

### Render Deployment

1. **Create Render Account**
   - Sign up at [Render](https://render.com)

2. **Connect Repository**
   - Connect your GitHub repository
   - Select the backend directory

3. **Configure Environment**
   - Set environment variables
   - Configure MongoDB connection

4. **Deploy**
   - Render will automatically deploy on push

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
```

### Code Structure

- **Middleware**: Authentication and authorization
- **Models**: Database schemas and methods
- **Routes**: API endpoints and validation
- **Config**: Database and server configuration

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation with express-validator
- CORS protection
- Rate limiting
- Helmet security headers
- Request size limiting

## 📈 Performance

- Database indexing for faster queries
- Pagination for large datasets
- Compression middleware
- Efficient MongoDB queries
- Connection pooling

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string in `.env`
   - Ensure network connectivity

2. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Ensure proper token format

3. **CORS Errors**
   - Update `FRONTEND_URL` in `.env`
   - Check CORS configuration in `server.js`

4. **Validation Errors**
   - Check request body format
   - Verify required fields
   - Ensure proper data types

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation
- Check server logs for errors
- Verify environment configuration

## 📄 License

This project is licensed under the MIT License.

---

**Happy Coding! 🚀** 