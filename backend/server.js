const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock users database
const users = [
  {
    id: 1,
    email: 'admin@supermarket.com',
    password: 'admin123',
    role: 'admin',
    permissions: ['view_sales', 'manage_inventory', 'create_orders', 'view_reports', 'manage_products', 'process_returns', 'view_customers', 'manage_discounts']
  },
  {
    id: 2,
    email: 'manager@supermarket.com',
    password: 'manager123',
    role: 'manager',
    permissions: ['view_sales', 'manage_inventory', 'view_reports']
  },
  {
    id: 3,
    email: 'cashier@supermarket.com',
    password: 'cashier123',
    role: 'cashier',
    permissions: ['create_orders', 'process_returns', 'view_customers']
  },
  {
    id: 4,
    email: 'user@supermarket.com',
    password: 'user123',
    role: 'user',
    permissions: ['view_sales']
  }
];

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`Login attempt: ${email}`);
  
  // Find user by email and password
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Create a mock JWT token
    const token = `mock-jwt-token-${user.id}-${Date.now()}`;
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
    
    console.log(`Login successful for: ${email}`);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
    console.log(`Login failed for: ${email}`);
  }
});

// Mock user info endpoint
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  // Extract user ID from mock token
  const tokenParts = token.split('-');
  const userId = parseInt(tokenParts[3]);
  
  const user = users.find(u => u.id === userId);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Mock refresh token endpoint
app.post('/api/auth/refresh', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Return a new mock token
  const newToken = `mock-jwt-token-refresh-${Date.now()}`;
  res.json({ token: newToken });
});

// Mock dashboard stats endpoint
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalSales: 125000,
    totalOrders: 450,
    totalCustomers: 1200,
    totalProducts: 350,
    recentTransactions: [
      { id: 1, amount: 45.99, customer: 'John Doe', time: '2 minutes ago' },
      { id: 2, amount: 12.50, customer: 'Jane Smith', time: '5 minutes ago' },
      { id: 3, amount: 78.25, customer: 'Bob Johnson', time: '8 minutes ago' }
    ]
  });
});

// Mock sales data endpoint
app.get('/api/sales', (req, res) => {
  res.json([
    { id: 1, product: 'Apples', quantity: 50, total: 75.00, date: '2024-01-15' },
    { id: 2, product: 'Bread', quantity: 30, total: 45.00, date: '2024-01-15' },
    { id: 3, product: 'Milk', quantity: 25, total: 62.50, date: '2024-01-14' }
  ]);
});

// Mock users endpoint (admin only)
app.get('/api/users', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Return users without passwords
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock backend is running' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
  console.log('📝 Available demo credentials:');
  console.log('   Admin: admin@supermarket.com / admin123');
  console.log('   Manager: manager@supermarket.com / manager123');
  console.log('   Cashier: cashier@supermarket.com / cashier123');
  console.log('   User: user@supermarket.com / user123');
});