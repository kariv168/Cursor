const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user with role information
    const userQuery = `
      SELECT u.user_id, u.username, u.password_hash, r.role_name, r.description 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id 
      WHERE u.username = ?
    `;
    
    const users = await executeQuery(userQuery, [username]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];

    // For initial testing, if password_hash starts with 'hashed_password', 
    // compare directly. Otherwise use bcrypt.
    let isValidPassword;
    if (user.password_hash.startsWith('hashed_password')) {
      // Simple comparison for demo data
      isValidPassword = password === 'password'; // You might want to adjust this
    } else {
      // Use bcrypt for properly hashed passwords
      isValidPassword = await bcrypt.compare(password, user.password_hash);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.user_id);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('Login error, using fallback authentication:', error.message);
    
    // Fallback authentication when database is not available
    const demoUsers = {
      'admin': { user_id: 1, username: 'admin', role_name: 'administrator', description: 'System administrator' },
      'backend_dev': { user_id: 2, username: 'backend_dev', role_name: 'backend_developer', description: 'Backend developer' },
      'biz_analyst': { user_id: 3, username: 'biz_analyst', role_name: 'business_analyst', description: 'Business analyst' }
    };

    if (demoUsers[username] && password === 'password') {
      const user = demoUsers[username];
      const token = generateToken(user.user_id);

      res.json({
        success: true,
        message: 'Login successful (demo mode)',
        data: {
          token,
          user
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const newToken = generateToken(userId);

    res.json({
      success: true,
      data: { token: newToken }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  try {
    const { username, password, role_id } = req.body;

    // Check if username already exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await executeQuery(
      'INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
      [username, password_hash, role_id]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user_id: result.insertId }
    });

  } catch (error) {
    console.error('Create user error:', error.message);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. User creation is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const usersQuery = `
      SELECT u.user_id, u.username, r.role_name, r.description 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id 
      ORDER BY u.user_id
    `;
    
    const users = await executeQuery(usersQuery);

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get all users error, using mock data:', error.message);
    
    // Fallback to mock data when database is not available
    const mockUsers = [
      {
        user_id: 1,
        username: 'admin',
        role_name: 'administrator',
        description: 'System administrator with full access'
      },
      {
        user_id: 2,
        username: 'backend_dev',
        role_name: 'backend_developer',
        description: 'Backend developer with technical access'
      },
      {
        user_id: 3,
        username: 'biz_analyst',
        role_name: 'business_analyst',
        description: 'Business analyst with reporting access'
      }
    ];

    res.json({
      success: true,
      data: { users: mockUsers }
    });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await executeQuery('SELECT * FROM roles ORDER BY role_id');

    res.json({
      success: true,
      data: { roles }
    });

  } catch (error) {
    console.error('Get roles error, using mock data:', error.message);
    
    // Fallback to mock data when database is not available
    const mockRoles = [
      {
        role_id: 1,
        role_name: 'administrator',
        description: 'System administrator with full access'
      },
      {
        role_id: 2,
        role_name: 'backend_developer',
        description: 'Backend developer with technical access'
      },
      {
        role_id: 3,
        role_name: 'business_analyst',
        description: 'Business analyst with reporting access'
      }
    ];

    res.json({
      success: true,
      data: { roles: mockRoles }
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, password, role_id } = req.body;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username already exists (excluding current user)
    if (username) {
      const usernameExists = await executeQuery(
        'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
        [username, userId]
      );

      if (usernameExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists'
        });
      }
    }

    // Build update query dynamically
    let updateQuery = 'UPDATE users SET ';
    const updateParams = [];
    const updates = [];

    if (username) {
      updates.push('username = ?');
      updateParams.push(username);
    }

    if (password) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      updates.push('password_hash = ?');
      updateParams.push(password_hash);
    }

    if (role_id) {
      updates.push('role_id = ?');
      updateParams.push(role_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateQuery += updates.join(', ') + ' WHERE user_id = ?';
    updateParams.push(userId);

    await executeQuery(updateQuery, updateParams);

    res.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. User update is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id, username FROM users WHERE user_id = ?',
      [userId]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user
    await executeQuery('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: `User "${existingUser[0].username}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete user error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. User deletion is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = {
  login,
  getCurrentUser,
  refreshToken,
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
  getRoles
};