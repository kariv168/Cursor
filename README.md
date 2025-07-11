# 🛒 Supermarket Management System

A comprehensive full-stack supermarket management system built with React.js frontend and Node.js backend, featuring role-based access control, sales analytics, and user management.

## 🌟 Features

### 🔐 Authentication & Authorization
- **Role-based Access Control**: Three distinct roles with different permissions
  - **Administrator**: Full system access and user management
  - **Backend Developer**: Technical access for development
  - **Business Analyst**: Analytics and reporting access
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based route protection

### � Sales Analytics
- **Real-time Dashboard**: Live statistics and metrics
- **Advanced Analytics**: Multiple chart types and data visualization
- **Filtering & Search**: Date range, category, and product filtering
- **Export Functionality**: Data export capabilities
- **Trend Analysis**: Daily, weekly, and monthly sales trends

### 👥 User Management
- **User CRUD Operations**: Create, read, update, delete users
- **Role Assignment**: Assign and modify user roles
- **Permission Management**: Granular permission control
- **User Search**: Search and filter users

### 📈 Dashboard Features
- **Role-based Dashboards**: Customized views for each role
- **Real-time Statistics**: Live sales, orders, customers, and products data
- **Interactive Charts**: Area charts, bar charts, and pie charts
- **Recent Transactions**: Latest transaction history
- **Quick Actions**: Role-specific action buttons

## 🏗️ System Architecture

### Frontend (React.js)
- **React 18**: Latest React features and hooks
- **React Router**: Client-side routing
- **Recharts**: Data visualization library
- **React Icons**: Icon library
- **Axios**: HTTP client for API calls
- **React Hot Toast**: Notification system
- **Tailwind CSS**: Utility-first CSS framework

### Backend (Node.js)
- **Express.js**: Web framework
- **MySQL**: Database management
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection

### Database Schema
- **Users & Roles**: Authentication and authorization
- **Products & Categories**: Inventory management
- **Orders & Order Items**: Sales tracking
- **Customers**: Customer information
- **Branches**: Store locations
- **Payments**: Transaction records
- **Suppliers & Restock**: Inventory management

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd supermarket-system
```

### 2. Database Setup
```sql
-- Create database
CREATE DATABASE g1_supermarket;
USE g1_supermarket;

-- Run the database schema (see backend/setup-database.sql)
```

### 3. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Start backend server
npm start
```

### 4. Frontend Setup
```bash
cd ../
npm install

# Start frontend development server
npm start
```

### 5. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 Demo Credentials

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `password` | Administrator | Full access |
| `backend_dev` | `password` | Backend Developer | Technical access |
| `biz_analyst` | `password` | Business Analyst | Analytics access |

## 📁 Project Structure

```
supermarket-system/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── App.js          # Main app component
│   └── package.json
├── backend/                  # Node.js backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── routes/              # API routes
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### User Management
- `GET /api/auth/users` - Get all users (Admin only)
- `POST /api/auth/users` - Create user (Admin only)
- `PUT /api/auth/users/:id` - Update user (Admin only)
- `DELETE /api/auth/users/:id` - Delete user (Admin only)
- `GET /api/auth/roles` - Get all roles

### Sales Analytics
- `GET /api/sales` - Get sales data with filters
- `GET /api/sales/summary` - Get sales summary statistics
- `GET /api/sales/by-category` - Get sales by category
- `GET /api/sales/daily-trend` - Get daily sales trend

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/health` - Health check

## 🎨 UI Components

### Dashboard
- **Welcome Section**: Role-based greeting and user info
- **Statistics Cards**: Key metrics with icons
- **Charts Section**: Interactive data visualization
- **Recent Transactions**: Latest transaction list
- **Quick Actions**: Role-specific action buttons

### Sales Analytics
- **Table View**: Detailed sales data in tabular format
- **Charts View**: Pie charts and bar charts
- **Analytics View**: Trend analysis and performance metrics
- **Filters**: Advanced filtering and search capabilities

### User Management
- **User List**: Comprehensive user table with actions
- **Create/Edit Modal**: User creation and editing forms
- **Role Management**: Role assignment and permissions
- **Search & Filter**: User search functionality

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Role-based Access Control**: Granular permission system
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Cross-origin security
- **Input Validation**: Request validation middleware

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `roles` - User roles and permissions
- `products` - Product catalog
- `product_categories` - Product categorization
- `orders` - Sales orders
- `order_items` - Order line items
- `customers` - Customer information
- `branches` - Store locations
- `payments` - Payment transactions

### Relationships
- Users belong to roles
- Products belong to categories
- Orders belong to customers and branches
- Order items link orders to products
- Payments are linked to orders

## 🚀 Deployment

### Environment Variables
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=g1_supermarket

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Production Build
```bash
# Frontend
npm run build

# Backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔄 Updates

### Version 1.0.0
- Initial release with core functionality
- Role-based access control
- Sales analytics dashboard
- User management system
- Real-time data visualization

---

**Built with ❤️ using React.js and Node.js**