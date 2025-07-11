const bcrypt = require('bcryptjs');
const { executeQuery } = require('../config/database');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const usersQuery = `
      SELECT u.user_id, u.username, r.role_id, r.role_name, r.description 
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
    console.error('Get all users error:', error.message);
    
    // Fallback to mock data when database is not available
    const mockUsers = [
      {
        user_id: 1,
        username: 'admin',
        role_id: 1,
        role_name: 'Administrator',
        description: 'Has full access to all system modules and configurations'
      },
      {
        user_id: 2,
        username: 'backend_dev',
        role_id: 2,
        role_name: 'Backend Developer',
        description: 'Can access APIs and backend components for development'
      },
      {
        user_id: 3,
        username: 'biz_analyst',
        role_id: 3,
        role_name: 'Business Analyst',
        description: 'Can view reports, data, and system performance, but cannot modify data'
      }
    ];

    res.json({
      success: true,
      data: { users: mockUsers }
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const userQuery = `
      SELECT u.user_id, u.username, r.role_id, r.role_name, r.description 
      FROM users u 
      JOIN roles r ON u.role_id = r.role_id 
      WHERE u.user_id = ?
    `;
    
    const users = await executeQuery(userQuery, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: users[0] }
    });

  } catch (error) {
    console.error('Get user by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new user
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

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role_id } = req.body;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is taken by another user
    const duplicateUser = await executeQuery(
      'SELECT user_id FROM users WHERE username = ? AND user_id != ?',
      [username, id]
    );

    if (duplicateUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    let updateQuery = 'UPDATE users SET username = ?, role_id = ?';
    let params = [username, role_id];

    // If password is provided, hash and include it
    if (password && password.trim() !== '') {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);
      updateQuery += ', password_hash = ?';
      params.push(password_hash);
    }

    updateQuery += ' WHERE user_id = ?';
    params.push(id);

    await executeQuery(updateQuery, params);

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

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting the current user (admin)
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await executeQuery('DELETE FROM users WHERE user_id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
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

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_id } = req.body;

    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT user_id FROM users WHERE user_id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if role exists
    const roleExists = await executeQuery(
      'SELECT role_id FROM roles WHERE role_id = ?',
      [role_id]
    );

    if (roleExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    await executeQuery(
      'UPDATE users SET role_id = ? WHERE user_id = ?',
      [role_id, id]
    );

    res.json({
      success: true,
      message: 'User role updated successfully'
    });

  } catch (error) {
    console.error('Update user role error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.message.includes('connect')) {
      res.status(503).json({
        success: false,
        message: 'Database is not connected. Role update is not available in demo mode.'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
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
    console.error('Get roles error:', error.message);
    
    // Fallback to mock data when database is not available
    const mockRoles = [
      {
        role_id: 1,
        role_name: 'Administrator',
        description: 'Has full access to all system modules and configurations'
      },
      {
        role_id: 2,
        role_name: 'Backend Developer',
        description: 'Can access APIs and backend components for development'
      },
      {
        role_id: 3,
        role_name: 'Business Analyst',
        description: 'Can view reports, data, and system performance, but cannot modify data'
      }
    ];

    res.json({
      success: true,
      data: { roles: mockRoles }
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getRoles
};