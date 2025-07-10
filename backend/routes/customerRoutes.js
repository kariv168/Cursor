const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticateToken, requireAdminOrDev } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Customer viewing routes
router.get('/', authenticateToken, customerController.getAllCustomers);
router.get('/stats', authenticateToken, customerController.getCustomerStats);
router.get('/:id', authenticateToken, customerController.getCustomerById);

// Customer management routes (Admin/Dev only)
router.post('/', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.customer), 
  customerController.createCustomer
);

router.put('/:id', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.customer), 
  customerController.updateCustomer
);

module.exports = router;