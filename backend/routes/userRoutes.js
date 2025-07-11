const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Get all users (Admin only)
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  userController.getAllUsers
);

// Get user by ID (Admin only)
router.get('/:id', 
  authenticateToken, 
  requireAdmin, 
  userController.getUserById
);

// Create new user (Admin only)
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  validate(schemas.user), 
  userController.createUser
);

// Update user (Admin only)
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validate(schemas.userUpdate), 
  userController.updateUser
);

// Delete user (Admin only)
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  userController.deleteUser
);

// Update user role (Admin only)
router.patch('/:id/role', 
  authenticateToken, 
  requireAdmin, 
  userController.updateUserRole
);

// Get all roles
router.get('/roles/all', 
  authenticateToken, 
  userController.getRoles
);

module.exports = router;