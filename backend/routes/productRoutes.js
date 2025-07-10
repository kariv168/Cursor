const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdminOrDev } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Product routes
router.get('/', authenticateToken, productController.getAllProducts);
router.get('/:id', authenticateToken, productController.getProductById);

// Admin/Dev only routes for product management
router.post('/', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.product), 
  productController.createProduct
);

router.put('/:id', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.product), 
  productController.updateProduct
);

router.delete('/:id', 
  authenticateToken, 
  requireAdminOrDev, 
  productController.deleteProduct
);

// Category routes
router.get('/categories/all', authenticateToken, productController.getAllCategories);

router.post('/categories', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.category), 
  productController.createCategory
);

module.exports = router;