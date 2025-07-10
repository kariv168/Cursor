const { executeQuery } = require('../config/database');

// Get all products with category information
const getAllProducts = async (req, res) => {
  try {
    const { category_id, search } = req.query;
    
    let query = `
      SELECT p.*, pc.category_name 
      FROM products p 
      JOIN product_categories pc ON p.category_id = pc.category_id
    `;
    
    const params = [];
    const conditions = [];

    if (category_id) {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (search) {
      conditions.push('(p.product_name LIKE ? OR p.brand LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.product_name';

    const products = await executeQuery(query, params);

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT p.*, pc.category_name 
      FROM products p 
      JOIN product_categories pc ON p.category_id = pc.category_id 
      WHERE p.product_id = ?
    `;

    const products = await executeQuery(query, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product: products[0] }
    });

  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { product_name, price, category_id, brand } = req.body;

    // Check if product name already exists
    const existingProduct = await executeQuery(
      'SELECT product_id FROM products WHERE product_name = ?',
      [product_name]
    );

    if (existingProduct.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    // Verify category exists
    const category = await executeQuery(
      'SELECT category_id FROM product_categories WHERE category_id = ?',
      [category_id]
    );

    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const result = await executeQuery(
      'INSERT INTO products (product_name, price, category_id, brand) VALUES (?, ?, ?, ?)',
      [product_name, price, category_id, brand]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product_id: result.insertId }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, price, category_id, brand } = req.body;

    // Check if product exists
    const existingProduct = await executeQuery(
      'SELECT product_id FROM products WHERE product_id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if new product name already exists (excluding current product)
    const duplicateName = await executeQuery(
      'SELECT product_id FROM products WHERE product_name = ? AND product_id != ?',
      [product_name, id]
    );

    if (duplicateName.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this name already exists'
      });
    }

    // Verify category exists
    const category = await executeQuery(
      'SELECT category_id FROM product_categories WHERE category_id = ?',
      [category_id]
    );

    if (category.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    await executeQuery(
      'UPDATE products SET product_name = ?, price = ?, category_id = ?, brand = ? WHERE product_id = ?',
      [product_name, price, category_id, brand, id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const existingProduct = await executeQuery(
      'SELECT product_id FROM products WHERE product_id = ?',
      [id]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await executeQuery('DELETE FROM products WHERE product_id = ?', [id]);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await executeQuery(
      'SELECT * FROM product_categories ORDER BY category_name'
    );

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new category
const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    // Check if category name already exists
    const existingCategory = await executeQuery(
      'SELECT category_id FROM product_categories WHERE category_name = ?',
      [category_name]
    );

    if (existingCategory.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const result = await executeQuery(
      'INSERT INTO product_categories (category_name) VALUES (?)',
      [category_name]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category_id: result.insertId }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  createCategory
};