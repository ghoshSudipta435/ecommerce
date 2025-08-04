# 🛒 E-commerce RBAC Web Application

A comprehensive E-commerce application with Role-Based Access Control (RBAC) featuring a modern React frontend and a robust Node.js backend API. The application supports multiple user roles including Admin, Seller, Customer, and Delivery Agent.

## 🎯 Project Overview

This is a full-stack E-commerce platform that handles books, foods, and clothing for men and women. The application implements sophisticated role-based access control to provide different experiences and capabilities based on user roles.

## 🏗️ Architecture

```
ecommerce-website/
├── frontend/          # React.js + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Role-based dashboard pages
│   │   ├── context/       # Authentication context
│   │   ├── utils/         # Helper functions & API config
│   │   └── App.jsx        # Main application
│   └── package.json
├── backend/           # Node.js + Express + MongoDB
│   ├── models/        # Database models
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth & role checking
│   ├── config/        # Database configuration
│   └── server.js      # Main server file
└── README.md
```

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** with 4 distinct roles:
  - **Admin**: Full system access and management
  - **Seller**: Product management and sales analytics
  - **Customer**: Shopping and order management
  - **Delivery Agent**: Delivery tracking and status updates
- **Protected routes** with automatic role-based redirection
- **Secure password hashing** with bcrypt

### 🎨 Frontend Features
- **Modern React 18** with hooks and context API
- **Responsive design** with Tailwind CSS
- **Role-specific dashboards** with tailored UI/UX
- **Real-time notifications** with React Hot Toast
- **Form validation** with client-side error handling
- **Loading states** and error boundaries
- **Mobile-first** responsive design

### 🔧 Backend Features
- **RESTful API** with Express.js
- **MongoDB** with Mongoose ODM
- **Input validation** with express-validator
- **Security middleware** (helmet, CORS, rate limiting)
- **Comprehensive error handling**
- **Database indexing** for optimal performance
- **Analytics and reporting** capabilities

### 📊 Role-Based Capabilities

| Feature | Admin | Seller | Customer | Delivery |
|---------|-------|--------|----------|----------|
| User Management | ✅ | ❌ | ❌ | ❌ |
| Product Management | ✅ | ✅ (Own) | ❌ | ❌ |
| Order Management | ✅ | ✅ (Own Products) | ✅ (Own) | ✅ (Assigned) |
| Analytics | ✅ | ✅ | ❌ | ✅ |
| Shopping Cart | ❌ | ❌ | ✅ | ❌ |
| Delivery Tracking | ❌ | ❌ | ✅ | ✅ |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **React Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-repository-url>
cd ecommerce-website
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:5000" > .env
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 👥 Demo Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: password123
- **Capabilities**: Full system access

### Seller Account
- **Email**: seller@example.com
- **Password**: password123
- **Capabilities**: Product management, sales analytics

### Customer Account
- **Email**: customer@example.com
- **Password**: password123
- **Capabilities**: Shopping, order management

### Delivery Account
- **Email**: delivery@example.com
- **Password**: password123
- **Capabilities**: Delivery tracking, status updates

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification
- `PUT /api/auth/profile` - Update profile

### Product Endpoints
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Order Endpoints
- `GET /api/orders` - Get orders (role-based)
- `POST /api/orders` - Create order (Customer)
- `PATCH /api/orders/:id/status` - Update order status

### Role-Specific Endpoints
- **Admin**: `/api/admin/*` - User management, analytics
- **Seller**: `/api/seller/*` - Product management, sales
- **Delivery**: `/api/delivery/*` - Delivery tracking, reports

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set build directory to `frontend`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.render.com`
   - Deploy

### Backend Deployment (Render)

1. **Create Render Account**
   - Sign up at [Render](https://render.com)

2. **Deploy Backend**
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your-mongodb-atlas-uri
     JWT_SECRET=your-production-jwt-secret
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

3. **Configure MongoDB Atlas**
   - Create MongoDB Atlas account
   - Create cluster and database
   - Get connection string
   - Update `MONGODB_URI` in Render

## 🔧 Development

### Available Scripts

#### Backend
```bash
cd backend
npm run dev          # Development server
npm start            # Production server
npm test             # Run tests
```

#### Frontend
```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce-rbac
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📊 Database Models

### User Model
- Basic info (name, email, phone)
- Role-based access (admin, seller, customer, delivery)
- Address information
- Account preferences
- Authentication data

### Product Model
- Product details (name, description, price)
- Category classification (books, foods, clothing)
- Stock management
- Rating system
- Seller association

### Order Model
- Customer information
- Order items with quantities
- Status tracking (pending, confirmed, shipped, delivered)
- Payment details
- Delivery information

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** with bcrypt
- **Role-based Access Control** with middleware protection
- **Input Validation** with express-validator
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **Helmet Security Headers** for enhanced security
- **Request Size Limiting** to prevent large payload attacks

## 📈 Performance Optimizations

- **Database Indexing** for faster queries
- **Pagination** for large datasets
- **Compression Middleware** for reduced bandwidth
- **Efficient MongoDB Queries** with proper aggregation
- **Connection Pooling** for database connections
- **Code Splitting** in React for faster loading
- **Image Optimization** and lazy loading

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
```

### Frontend Testing
```bash
cd frontend
npm test             # Run all tests
npm run test:coverage # Run tests with coverage
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB service is running
   - Verify connection string in `.env`
   - Ensure network connectivity

2. **CORS Errors**
   - Update `FRONTEND_URL` in backend `.env`
   - Check CORS configuration in `server.js`

3. **JWT Token Issues**
   - Verify `JWT_SECRET` is set
   - Check token expiration
   - Ensure proper token format

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation in backend README
- Check server logs for detailed error messages
- Verify environment configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 Project Status

✅ **Completed Features:**
- Complete frontend with role-based dashboards
- Full backend API with authentication and authorization
- Database models and relationships
- Role-based access control middleware
- Comprehensive API documentation
- Security features and optimizations
- Deployment-ready configuration

🚀 **Ready for Deployment:**
- Frontend can be deployed to Vercel
- Backend can be deployed to Render
- MongoDB Atlas integration ready
- Environment variables configured

---

**🎯 The E-commerce RBAC application is now complete and ready for deployment!**

**Happy Coding! 🚀** 