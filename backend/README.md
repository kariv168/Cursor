# Supermarket Management System - Backend

A comprehensive REST API backend for the supermarket management system built with Node.js, Express, and MySQL.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Complete CRUD operations for products and categories
- **Inventory Management**: Real-time inventory tracking across multiple branches
- **Order Processing**: Full order lifecycle management with payment processing
- **Customer Management**: Customer data and order history tracking
- **Branch Management**: Multi-branch support with employee management
- **Real-time Statistics**: Dashboard stats and analytics
- **Data Validation**: Comprehensive input validation using Joi
- **Rate Limiting**: API rate limiting for security
- **Error Handling**: Comprehensive error handling and logging

## 📋 Prerequisites

- Node.js (v16.x or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=g1_supermarket
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the MySQL database**
   
   Run the SQL schema provided in your database to create all tables and insert sample data:
   ```sql
   -- Use the SQL schema you provided to create the database and tables
   CREATE DATABASE g1_supermarket;
   USE g1_supermarket;
   -- ... rest of your schema
   ```

5. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product management
│   ├── inventoryController.js # Inventory management
│   ├── orderController.js   # Order processing
│   ├── branchController.js  # Branch management
│   └── customerController.js # Customer management
├── middleware/
│   ├── auth.js             # Authentication middleware
│   └── validation.js       # Input validation middleware
├── routes/
│   ├── authRoutes.js       # Authentication routes
│   ├── productRoutes.js    # Product routes
│   ├── inventoryRoutes.js  # Inventory routes
│   ├── orderRoutes.js      # Order routes
│   ├── branchRoutes.js     # Branch routes
│   └── customerRoutes.js   # Customer routes
├── .env                    # Environment variables
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── server.js             # Main server file
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Three user roles are available:

### Default Users (from your database):
- **Administrator**: `admin` / `password`
- **Backend Developer**: `backend_dev` / `password`
- **Business Analyst**: `biz_analyst` / `password`

### Login Process:
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "username": "admin",
      "role_name": "Administrator"
    }
  }
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/roles` - Get all roles
- `POST /api/auth/users` - Create new user (Admin only)
- `GET /api/auth/users` - Get all users (Admin only)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin/Dev)
- `PUT /api/products/:id` - Update product (Admin/Dev)
- `DELETE /api/products/:id` - Delete product (Admin/Dev)
- `GET /api/products/categories/all` - Get all categories
- `POST /api/products/categories` - Create new category (Admin/Dev)

### Inventory
- `GET /api/inventory` - Get inventory data
- `GET /api/inventory/product/:product_id` - Get product inventory across branches
- `GET /api/inventory/low-stock` - Get low stock items
- `PUT /api/inventory/branch/:branch_id/product/:product_id` - Update inventory
- `POST /api/inventory/branch/:branch_id/product/:product_id/add` - Add stock
- `POST /api/inventory/branch/:branch_id/product/:product_id/reduce` - Reduce stock
- `POST /api/inventory/transfer` - Transfer stock between branches

### Orders
- `GET /api/orders` - Get all orders (with pagination)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order (Admin/Dev)
- `GET /api/orders/stats` - Get order statistics
- `GET /api/orders/top-products` - Get top selling products
- `POST /api/orders/:id/payment` - Process payment (Admin/Dev)

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID with employees
- `POST /api/branches` - Create new branch (Admin/Dev)
- `GET /api/branches/employees/all` - Get all employees
- `POST /api/branches/employees` - Create new employee (Admin/Dev)

### Customers
- `GET /api/customers` - Get all customers (with pagination)
- `GET /api/customers/:id` - Get customer by ID with order history
- `GET /api/customers/stats` - Get customer statistics
- `POST /api/customers` - Create new customer (Admin/Dev)
- `PUT /api/customers/:id` - Update customer (Admin/Dev)

### System
- `GET /api/health` - Health check and database status
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/sales` - Sales data

## 🔒 Authorization Levels

1. **Public**: Health check endpoints
2. **Authenticated**: Most read operations (all logged-in users)
3. **Admin/Dev**: Write operations (Administrators and Backend Developers)
4. **Admin Only**: User management, critical system operations

## 📊 Example API Usage

### Create a New Order
```bash
POST /api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "customer_id": 1,
  "branch_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 0.80
    },
    {
      "product_id": 2,
      "quantity": 1,
      "unit_price": 1.20
    }
  ]
}
```

### Get Inventory for a Branch
```bash
GET /api/inventory?branch_id=1
Authorization: Bearer YOUR_JWT_TOKEN
```

### Add Stock to Inventory
```bash
POST /api/inventory/branch/1/product/1/add
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "quantity": 50
}
```

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon for auto-restart on file changes.

### Environment Variables
All configuration is handled through environment variables. See `.env.example` for all available options.

### Database Schema
The backend expects the MySQL database schema as provided in your SQL file. Make sure to run the complete schema including all table creations and sample data insertions.

## 🔍 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "details": ["Detailed error information"]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## 🚦 Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes (configurable)
- **Max Requests**: 100 per window per IP (configurable)

## 📈 Performance Features

- **Connection Pooling**: MySQL connection pooling for better performance
- **Transaction Support**: Database transactions for order processing
- **Pagination**: Built-in pagination for large datasets
- **Query Optimization**: Optimized database queries with proper JOINs

## 🔧 Troubleshooting

### Database Connection Issues
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Ensure the database `g1_supermarket` exists
4. Check if the MySQL user has proper permissions

### Authentication Issues
1. Verify JWT_SECRET is set in `.env`
2. Check if user exists in database
3. Ensure password comparison logic matches your data

### Port Issues
1. Check if port 5000 is available
2. Change PORT in `.env` if needed

## 📞 Support

If you encounter any issues:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your database schema matches the expected structure
4. Check that all dependencies are installed with `npm install`

The backend is designed to be robust and will attempt to start even if the database connection fails initially, allowing you to diagnose connection issues through the health check endpoint.