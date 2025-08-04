# E-commerce RBAC Frontend

A modern React-based frontend for an E-commerce platform with Role-Based Access Control (RBAC). Built with React 18, Vite, Tailwind CSS, and modern JavaScript practices.

## 🚀 Features

### Role-Based Access Control
- **Admin**: Full system management, user management, product oversight
- **Seller**: Product management, order fulfillment, sales analytics
- **Customer**: Product browsing, shopping cart, order tracking
- **Delivery Agent**: Delivery management, status updates, route optimization

### Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light mode support
- Modern component library with Lucide React icons
- Toast notifications for user feedback
- Loading states and error boundaries

### Authentication & Security
- JWT-based authentication
- Protected routes with role-based access
- Secure token management
- Form validation and error handling

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Hooks
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Form Validation**: Custom validation with helper functions

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── OrderCard.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── SellerDashboard.jsx
│   │   ├── CustomerDashboard.jsx
│   │   ├── DeliveryDashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── utils/
│   │   ├── axiosInstance.js
│   │   ├── constants.js
│   │   └── helper.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running (see backend documentation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ecommerce-website/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI Components

### Core Components
- **Navbar**: Responsive navigation with role-based menu
- **ProductCard**: Product display with role-specific actions
- **OrderCard**: Order information with status management
- **LoadingSpinner**: Consistent loading states
- **ErrorBoundary**: Graceful error handling

### Pages
- **Login/Register**: Authentication with role selection
- **AdminDashboard**: System overview and management
- **SellerDashboard**: Product and sales management
- **CustomerDashboard**: Shopping and order tracking
- **DeliveryDashboard**: Delivery management and tracking

## 🔐 Authentication Flow

1. **Login**: Users select their role and authenticate
2. **Token Storage**: JWT tokens stored in localStorage
3. **Route Protection**: ProtectedRoute component checks authentication and roles
4. **Auto-redirect**: Authenticated users redirected to role-specific dashboard

## 🎯 Role-Based Features

### Admin
- System statistics and analytics
- User management
- Product oversight
- Order management
- System-wide reports

### Seller
- Product catalog management
- Order fulfillment
- Sales analytics
- Inventory tracking
- Customer communication

### Customer
- Product browsing and search
- Shopping cart management
- Order tracking
- Wishlist functionality
- Personal dashboard

### Delivery Agent
- Assigned delivery management
- Route optimization
- Status updates
- Delivery tracking
- Customer communication

## 🎨 Styling

The application uses Tailwind CSS with custom components:

```css
/* Custom button classes */
.btn-primary { /* Primary action buttons */ }
.btn-secondary { /* Secondary action buttons */ }
.btn-danger { /* Destructive action buttons */ }

/* Custom input classes */
.input-field { /* Form input styling */ }

/* Custom card classes */
.card { /* Card container styling */ }
```

## 🔧 Configuration

### Vite Configuration
- Development server on port 3000
- API proxy to backend on port 5000
- Hot module replacement enabled

### Tailwind Configuration
- Custom color palette
- Responsive breakpoints
- Custom component classes

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set environment variables
3. Deploy automatically on push

## 🔍 API Integration

The frontend integrates with the backend API through:

- **Axios Instance**: Configured with interceptors for authentication
- **API Endpoints**: Defined in `utils/constants.js`
- **Error Handling**: Centralized error management
- **Loading States**: Consistent loading indicators

## 🧪 Testing

### Manual Testing
1. Test all role-based routes
2. Verify authentication flow
3. Test responsive design
4. Check error handling

### Demo Accounts
- **Admin**: admin@example.com / password123
- **Seller**: seller@example.com / password123
- **Customer**: customer@example.com / password123
- **Delivery**: delivery@example.com / password123

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ using React, Vite, and Tailwind CSS** 