# Supermarket Management System - Frontend

A modern React.js frontend for a supermarket management system with user authentication, role-based access control, sales data visualization, and admin user management capabilities.

## Features

### 🔐 Authentication & Authorization
- **Secure Login System** with JWT token management
- **Role-Based Access Control** (Admin, Manager, Cashier, User)
- **Permission-Based Features** for granular access control
- **Session Management** with automatic token refresh

### 📊 Dashboard
- **Real-time Sales Metrics** with trend indicators
- **Interactive Charts** using Recharts library
- **Recent Transactions** overview
- **Key Performance Indicators** (KPIs)

### 💰 Sales Data Management
- **Comprehensive Sales Reports** with filtering capabilities
- **Data Visualization** with charts and graphs
- **Export Functionality** for sales data
- **Advanced Search and Filtering** by date, category, product
- **Permission-based Access** for sensitive sales information

### 👥 User Management (Admin Only)
- **Complete User CRUD Operations**
- **Role Assignment** and modification
- **Permission Management** with granular control
- **User Status Management** (Active/Inactive)
- **Search and Filter Users**
- **Audit Trail** with last login tracking

### 🎨 Modern UI/UX
- **Responsive Design** for all devices
- **Modern Material Design** principles
- **Intuitive Navigation** with role-based menus
- **Toast Notifications** for user feedback
- **Loading States** and error handling

## Technology Stack

- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API calls
- **Recharts** - Data visualization library
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications
- **CSS Grid & Flexbox** - Modern layouts

## Demo Credentials

### Admin Access
- **Email:** admin@supermarket.com
- **Password:** admin123
- **Permissions:** Full system access

### Manager Access
- **Email:** manager@supermarket.com
- **Password:** manager123
- **Permissions:** Sales, inventory, reports

### Cashier Access
- **Email:** cashier@supermarket.com
- **Password:** cashier123
- **Permissions:** Orders, customers, returns

### User Access
- **Email:** user@supermarket.com
- **Password:** user123
- **Permissions:** Basic sales view

## Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd supermarket-frontend
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Application Configuration
REACT_APP_NAME=Supermarket Management System
REACT_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

### 4. Start the Development Server
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`

## Backend Integration

This frontend is designed to work with a REST API backend. The expected API endpoints include:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### User Management Endpoints
- `GET /api/users` - Get all users (Admin only)
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PATCH /api/users/:id/permissions` - Update user permissions (Admin only)

### Sales Data Endpoints
- `GET /api/sales` - Get sales data
- `GET /api/sales/stats` - Get sales statistics
- `GET /api/sales/by-date` - Get sales by date range
- `GET /api/dashboard/stats` - Get dashboard statistics

## File Structure

```
src/
├── components/           # React components
│   ├── Dashboard.js     # Main dashboard component
│   ├── Login.js         # Authentication component
│   ├── Navbar.js        # Navigation component
│   ├── SalesData.js     # Sales data management
│   ├── UserManagement.js # User management (Admin)
│   └── Loading.js       # Loading component
├── contexts/            # React contexts
│   └── AuthContext.js   # Authentication context
├── services/            # API service layer
│   └── apiService.js    # API communication
├── App.js              # Main app component
├── App.css             # Application styles
├── index.js            # Entry point
└── index.css           # Global styles
```

## Key Features Implementation

### Authentication Flow
1. User enters credentials on login page
2. Frontend sends request to backend API
3. Backend validates and returns JWT token
4. Token is stored in localStorage
5. Token is included in all subsequent API requests
6. Protected routes check authentication status

### Role-Based Access Control
- **Admin:** Full access to all features
- **Manager:** Access to sales, inventory, reports
- **Cashier:** Access to orders, customers, returns
- **User:** Limited access to basic features

### Permission System
Granular permissions for specific features:
- `view_sales` - View sales data
- `manage_inventory` - Manage inventory
- `create_orders` - Create orders
- `view_reports` - View reports
- `manage_products` - Manage products
- `process_returns` - Process returns
- `view_customers` - View customers
- `manage_discounts` - Manage discounts

## API Integration Notes

### Authentication
- Uses JWT tokens for authentication
- Automatic token refresh on API calls
- Redirects to login on 401 responses

### Error Handling
- Comprehensive error handling with user-friendly messages
- Toast notifications for success/error states
- Loading states for better UX

### Data Fetching
- Axios interceptors for request/response handling
- Automatic token injection
- Error response handling

## Development

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Development Best Practices
1. **Component Structure:** Functional components with hooks
2. **State Management:** Context API for global state
3. **Error Boundaries:** Comprehensive error handling
4. **Code Splitting:** Lazy loading for better performance
5. **Accessibility:** ARIA labels and keyboard navigation

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Update `.env` file for production:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

### Deployment Options
- **Netlify:** Connect GitHub repository
- **Vercel:** Deploy with vercel CLI
- **AWS S3:** Static website hosting
- **Nginx:** Serve static files

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note:** This is a frontend application that requires a backend API to function properly. The application includes mock data for demonstration purposes, but should be connected to a real backend for production use.