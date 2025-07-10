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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
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
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
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
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
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
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  login,
  getCurrentUser,
  refreshToken,
  createUser,
  getAllUsers,
  getRoles
};