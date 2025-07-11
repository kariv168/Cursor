require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const branchRoutes = require('./routes/branchRoutes');
const customerRoutes = require('./routes/customerRoutes');
const salesRoutes = require('./routes/salesRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'OK', 
      message: 'Supermarket backend is running',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Dashboard stats endpoint (compatible with existing frontend)
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const { executeQuery } = require('./config/database');
    
    // Get total sales for today
    const salesQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT o.customer_id) as total_customers,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as total_sales,
        COUNT(DISTINCT p.product_id) as total_products
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.product_id
      WHERE DATE(o.order_date) = CURDATE()
    `;

    const statsResult = await executeQuery(salesQuery);
    const stats = statsResult[0];

    // Get recent transactions
    const recentQuery = `
      SELECT 
        o.order_id as id,
        COALESCE(SUM(oi.quantity * oi.unit_price), 0) as amount,
        CONCAT(COALESCE(c.first_name, 'Guest'), ' ', COALESCE(c.last_name, '')) as customer,
        CONCAT(TIMESTAMPDIFF(MINUTE, o.order_date, NOW()), ' minutes ago') as time
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE DATE(o.order_date) = CURDATE()
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT 3
    `;

    const recentTransactions = await executeQuery(recentQuery);

    res.json({
      totalSales: parseFloat(stats.total_sales) || 0,
      totalOrders: parseInt(stats.total_orders) || 0,
      totalCustomers: parseInt(stats.total_customers) || 0,
      totalProducts: parseInt(stats.total_products) || 0,
      recentTransactions: recentTransactions.map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount) || 0
      }))
    });

  } catch (error) {
    console.error('Dashboard stats error, using mock data:', error.message);
    
    // Fallback to mock data when database is not available
    const mockStats = {
      totalSales: 125000,
      totalOrders: 1250,
      totalCustomers: 450,
      totalProducts: 850,
      recentTransactions: [
        { id: 1, customer: 'John Doe', amount: 45.50, time: '5 minutes ago' },
        { id: 2, customer: 'Jane Smith', amount: 78.20, time: '12 minutes ago' },
        { id: 3, customer: 'Bob Johnson', amount: 23.99, time: '18 minutes ago' }
      ]
    };

    res.json(mockStats);
  }
});

// Sales data endpoint (compatible with existing frontend)
app.get('/api/sales', async (req, res) => {
  try {
    const { executeQuery } = require('./config/database');
    
    // Try to get real data from database
    const salesQuery = `
      SELECT 
        oi.product_id as id,
        p.product_name as product,
        pc.category_name as category,
        SUM(oi.quantity) as quantity,
        SUM(oi.quantity * oi.unit_price) as total,
        DATE(o.order_date) as date,
        b.branch_name as branch
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN product_categories pc ON p.category_id = pc.category_id
      JOIN orders o ON oi.order_id = o.order_id
      JOIN branches b ON o.branch_id = b.branch_id
      WHERE DATE(o.order_date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAYS)
      GROUP BY oi.product_id, DATE(o.order_date), o.branch_id
      ORDER BY o.order_date DESC, total DESC
      LIMIT 50
    `;

    const sales = await executeQuery(salesQuery);

    res.json(sales.map(sale => ({
      ...sale,
      total: parseFloat(sale.total) || 0
    })));

  } catch (error) {
    console.error('Sales data error, using mock data:', error.message);
    
    // Fallback to mock data when database is not available (using products from the schema)
    const mockSalesData = [
      { id: 1, product: 'Coca-Cola Can', category: 'Beverages', quantity: 150, total: 120.00, date: '2024-01-15', branch: 'Central Market Branch' },
      { id: 2, product: 'Lays Classic Chips', category: 'Snacks', quantity: 80, total: 96.00, date: '2024-01-15', branch: 'Central Market Branch' },
      { id: 3, product: 'Milk 1L', category: 'Dairy', quantity: 70, total: 105.00, date: '2024-01-14', branch: 'Riverside Branch' },
      { id: 4, product: 'Banana (per kg)', category: 'Produce', quantity: 30, total: 21.00, date: '2024-01-14', branch: 'Riverside Branch' },
      { id: 1, product: 'Coca-Cola Can', category: 'Beverages', quantity: 120, total: 96.00, date: '2024-01-13', branch: 'Riverside Branch' },
      { id: 2, product: 'Lays Classic Chips', category: 'Snacks', quantity: 60, total: 72.00, date: '2024-01-13', branch: 'Central Market Branch' },
      { id: 3, product: 'Milk 1L', category: 'Dairy', quantity: 45, total: 67.50, date: '2024-01-12', branch: 'Central Market Branch' },
      { id: 4, product: 'Banana (per kg)', category: 'Produce', quantity: 25, total: 17.50, date: '2024-01-12', branch: 'Riverside Branch' },
    ];

    res.json(mockSalesData);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.warn('⚠️  Database connection failed, but server will start anyway');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Supermarket backend server running on http://localhost:${PORT}`);
      console.log(`� Database status: ${dbConnected ? 'Connected' : 'Disconnected'}`);
      console.log('📝 API Documentation:');
      console.log(`   Health Check: GET /api/health`);
      console.log(`   Authentication: POST /api/auth/login`);
      console.log(`   Products: GET /api/products`);
      console.log(`   Inventory: GET /api/inventory`);
      console.log(`   Orders: GET /api/orders`);
      console.log(`   Branches: GET /api/branches`);
      console.log(`   Customers: GET /api/customers`);
      console.log('');
      console.log('🔑 Demo credentials (from database):');
      console.log('   Admin: admin / password');
      console.log('   Backend Dev: backend_dev / password');
      console.log('   Business Analyst: biz_analyst / password');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
