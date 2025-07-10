const { executeQuery } = require('../config/database');

// Get all customers with pagination
const getAllCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY first_name, last_name LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const customers = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM customers';
    if (search) {
      countQuery += ' WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?';
    }

    const countParams = search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
    const countResult = await executeQuery(countQuery, countParams);
    const totalCount = countResult[0].total;

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get customer by ID with order history
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get customer details
    const customers = await executeQuery(
      'SELECT * FROM customers WHERE customer_id = ?',
      [id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Get customer's order history
    const orders = await executeQuery(`
      SELECT 
        o.order_id,
        o.order_date,
        b.branch_name,
        SUM(oi.quantity * oi.unit_price) as total_amount,
        COUNT(oi.product_id) as total_items,
        p.payment_method
      FROM orders o
      JOIN branches b ON o.branch_id = b.branch_id
      JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      WHERE o.customer_id = ?
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT 10
    `, [id]);

    const customer = {
      ...customers[0],
      orders
    };

    res.json({
      success: true,
      data: { customer }
    });

  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new customer
const createCustomer = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, address } = req.body;

    // Check if email already exists
    const existingEmail = await executeQuery(
      'SELECT customer_id FROM customers WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await executeQuery(
      'SELECT customer_id FROM customers WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    const result = await executeQuery(
      'INSERT INTO customers (first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, address]
    );

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer_id: result.insertId }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, address } = req.body;

    // Check if customer exists
    const existingCustomer = await executeQuery(
      'SELECT customer_id FROM customers WHERE customer_id = ?',
      [id]
    );

    if (existingCustomer.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if new email already exists (excluding current customer)
    const duplicateEmail = await executeQuery(
      'SELECT customer_id FROM customers WHERE email = ? AND customer_id != ?',
      [email, id]
    );

    if (duplicateEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }

    // Check if new phone already exists (excluding current customer)
    const duplicatePhone = await executeQuery(
      'SELECT customer_id FROM customers WHERE phone = ? AND customer_id != ?',
      [phone, id]
    );

    if (duplicatePhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    await executeQuery(
      'UPDATE customers SET first_name = ?, last_name = ?, email = ?, phone = ?, address = ? WHERE customer_id = ?',
      [first_name, last_name, email, phone, address, id]
    );

    res.json({
      success: true,
      message: 'Customer updated successfully'
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get customer statistics
const getCustomerStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT c.customer_id) as total_customers,
        COUNT(DISTINCT o.order_id) as total_orders,
        AVG(order_totals.order_total) as average_order_value,
        SUM(order_totals.order_total) as total_revenue
      FROM customers c
      LEFT JOIN orders o ON c.customer_id = o.customer_id
      LEFT JOIN (
        SELECT order_id, SUM(quantity * unit_price) as order_total
        FROM order_items
        GROUP BY order_id
      ) order_totals ON o.order_id = order_totals.order_id
    `;

    const stats = await executeQuery(statsQuery);

    res.json({
      success: true,
      data: { stats: stats[0] }
    });

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerStats
};