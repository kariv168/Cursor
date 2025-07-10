const { executeQuery } = require('../config/database');

// Get inventory for all branches or specific branch
const getInventory = async (req, res) => {
  try {
    const { branch_id } = req.query;
    
    let query = `
      SELECT 
        bi.branch_id,
        bi.product_id,
        bi.quantity,
        p.product_name,
        p.price,
        p.brand,
        pc.category_name,
        b.branch_name,
        b.location
      FROM branch_inventory bi
      JOIN products p ON bi.product_id = p.product_id
      JOIN product_categories pc ON p.category_id = pc.category_id
      JOIN branches b ON bi.branch_id = b.branch_id
    `;
    
    const params = [];

    if (branch_id) {
      query += ' WHERE bi.branch_id = ?';
      params.push(branch_id);
    }

    query += ' ORDER BY b.branch_name, pc.category_name, p.product_name';

    const inventory = await executeQuery(query, params);

    res.json({
      success: true,
      data: { inventory }
    });

  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get inventory for specific product across all branches
const getProductInventory = async (req, res) => {
  try {
    const { product_id } = req.params;

    const query = `
      SELECT 
        bi.branch_id,
        bi.quantity,
        b.branch_name,
        b.location,
        p.product_name,
        p.price
      FROM branch_inventory bi
      JOIN branches b ON bi.branch_id = b.branch_id
      JOIN products p ON bi.product_id = p.product_id
      WHERE bi.product_id = ?
      ORDER BY b.branch_name
    `;

    const inventory = await executeQuery(query, [product_id]);

    res.json({
      success: true,
      data: { inventory }
    });

  } catch (error) {
    console.error('Get product inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update inventory quantity
const updateInventory = async (req, res) => {
  try {
    const { branch_id, product_id } = req.params;
    const { quantity } = req.body;

    // Check if inventory record exists
    const existingInventory = await executeQuery(
      'SELECT * FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
      [branch_id, product_id]
    );

    if (existingInventory.length === 0) {
      // Create new inventory record
      await executeQuery(
        'INSERT INTO branch_inventory (branch_id, product_id, quantity) VALUES (?, ?, ?)',
        [branch_id, product_id, quantity]
      );
    } else {
      // Update existing inventory record
      await executeQuery(
        'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
        [quantity, branch_id, product_id]
      );
    }

    res.json({
      success: true,
      message: 'Inventory updated successfully'
    });

  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Add stock to inventory
const addStock = async (req, res) => {
  try {
    const { branch_id, product_id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive'
      });
    }

    // Check if inventory record exists
    const existingInventory = await executeQuery(
      'SELECT quantity FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
      [branch_id, product_id]
    );

    if (existingInventory.length === 0) {
      // Create new inventory record
      await executeQuery(
        'INSERT INTO branch_inventory (branch_id, product_id, quantity) VALUES (?, ?, ?)',
        [branch_id, product_id, quantity]
      );
    } else {
      // Add to existing inventory
      const newQuantity = existingInventory[0].quantity + quantity;
      await executeQuery(
        'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
        [newQuantity, branch_id, product_id]
      );
    }

    res.json({
      success: true,
      message: 'Stock added successfully'
    });

  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reduce stock from inventory (for sales)
const reduceStock = async (req, res) => {
  try {
    const { branch_id, product_id } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive'
      });
    }

    // Check current inventory
    const existingInventory = await executeQuery(
      'SELECT quantity FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
      [branch_id, product_id]
    );

    if (existingInventory.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in branch inventory'
      });
    }

    const currentQuantity = existingInventory[0].quantity;
    
    if (currentQuantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    const newQuantity = currentQuantity - quantity;
    
    await executeQuery(
      'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
      [newQuantity, branch_id, product_id]
    );

    res.json({
      success: true,
      message: 'Stock reduced successfully'
    });

  } catch (error) {
    console.error('Reduce stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get low stock items (below a threshold)
const getLowStock = async (req, res) => {
  try {
    const { threshold = 10, branch_id } = req.query;

    let query = `
      SELECT 
        bi.branch_id,
        bi.product_id,
        bi.quantity,
        p.product_name,
        p.price,
        b.branch_name,
        pc.category_name
      FROM branch_inventory bi
      JOIN products p ON bi.product_id = p.product_id
      JOIN branches b ON bi.branch_id = b.branch_id
      JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE bi.quantity <= ?
    `;
    
    const params = [threshold];

    if (branch_id) {
      query += ' AND bi.branch_id = ?';
      params.push(branch_id);
    }

    query += ' ORDER BY bi.quantity ASC, b.branch_name, p.product_name';

    const lowStockItems = await executeQuery(query, params);

    res.json({
      success: true,
      data: { lowStockItems }
    });

  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Transfer stock between branches
const transferStock = async (req, res) => {
  try {
    const { from_branch_id, to_branch_id, product_id, quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be positive'
      });
    }

    if (from_branch_id === to_branch_id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same branch'
      });
    }

    // Check source branch inventory
    const sourceInventory = await executeQuery(
      'SELECT quantity FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
      [from_branch_id, product_id]
    );

    if (sourceInventory.length === 0 || sourceInventory[0].quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock in source branch'
      });
    }

    // Start transaction-like operation
    // Reduce from source branch
    const newSourceQuantity = sourceInventory[0].quantity - quantity;
    await executeQuery(
      'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
      [newSourceQuantity, from_branch_id, product_id]
    );

    // Add to destination branch
    const destInventory = await executeQuery(
      'SELECT quantity FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
      [to_branch_id, product_id]
    );

    if (destInventory.length === 0) {
      // Create new inventory record
      await executeQuery(
        'INSERT INTO branch_inventory (branch_id, product_id, quantity) VALUES (?, ?, ?)',
        [to_branch_id, product_id, quantity]
      );
    } else {
      // Add to existing inventory
      const newDestQuantity = destInventory[0].quantity + quantity;
      await executeQuery(
        'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
        [newDestQuantity, to_branch_id, product_id]
      );
    }

    res.json({
      success: true,
      message: 'Stock transferred successfully'
    });

  } catch (error) {
    console.error('Transfer stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getInventory,
  getProductInventory,
  updateInventory,
  addStock,
  reduceStock,
  getLowStock,
  transferStock
};