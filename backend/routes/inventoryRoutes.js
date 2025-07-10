const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireAdminOrDev } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Inventory viewing routes (all authenticated users)
router.get('/', authenticateToken, inventoryController.getInventory);
router.get('/product/:product_id', authenticateToken, inventoryController.getProductInventory);
router.get('/low-stock', authenticateToken, inventoryController.getLowStock);

// Inventory management routes (Admin/Dev only)
router.put('/branch/:branch_id/product/:product_id', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.inventoryUpdate), 
  inventoryController.updateInventory
);

router.post('/branch/:branch_id/product/:product_id/add', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.inventoryUpdate), 
  inventoryController.addStock
);

router.post('/branch/:branch_id/product/:product_id/reduce', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.inventoryUpdate), 
  inventoryController.reduceStock
);

router.post('/transfer', 
  authenticateToken, 
  requireAdminOrDev, 
  inventoryController.transferStock
);

module.exports = router;