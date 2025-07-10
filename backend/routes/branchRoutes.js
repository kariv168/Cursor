const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const { authenticateToken, requireAdminOrDev } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

// Branch routes
router.get('/', authenticateToken, branchController.getAllBranches);
router.get('/:id', authenticateToken, branchController.getBranchById);

// Admin/Dev only routes for branch management
router.post('/', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.branch), 
  branchController.createBranch
);

// Employee routes
router.get('/employees/all', authenticateToken, branchController.getAllEmployees);

router.post('/employees', 
  authenticateToken, 
  requireAdminOrDev, 
  validate(schemas.employee), 
  branchController.createEmployee
);

module.exports = router;