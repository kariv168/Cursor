const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/login', validate(schemas.login), authController.login);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/refresh', authenticateToken, authController.refreshToken);

// Admin only routes
router.post('/users', 
  authenticateToken, 
  requireAdmin, 
  validate(schemas.user), 
  authController.createUser
);

router.get('/users', 
  authenticateToken, 
  requireAdmin, 
  authController.getAllUsers
);

router.put('/users/:userId', 
  authenticateToken, 
  requireAdmin, 
  validate(schemas.userUpdate), 
  authController.updateUser
);

router.delete('/users/:userId', 
  authenticateToken, 
  requireAdmin, 
  authController.deleteUser
);

router.get('/roles', 
  authenticateToken, 
  authController.getRoles
);

module.exports = router;