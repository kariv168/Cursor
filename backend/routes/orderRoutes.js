const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdminOrDev } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Order viewing routes
router.get('/', authenticateToken, orderController.getAllOrders);
router.get('/stats', authenticateToken, orderController.getOrderStats);
router.get('/top-products', authenticateToken, orderController.getTopSellingProducts);
router.get('/:id', authenticateToken, orderController.getOrderById);

// Order creation routes (Admin/Dev only)
router.post('/', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.order), 
  orderController.createOrder
);

// Payment processing routes (Admin/Dev only)
router.post('/:id/payment', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.payment), 
  orderController.processPayment
);

module.exports = router;