const { executeQuery, getConnection } = require('../config/database');

// Get all orders with pagination and filtering
const getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      branch_id, 
      customer_id, 
      start_date, 
      end_date 
    } = req.query;

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        o.order_id,
        o.customer_id,
        o.branch_id,
        o.order_date,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.email as customer_email,
        b.branch_name,
        b.location as branch_location,
        SUM(oi.quantity * oi.unit_price) as total_amount,
        COUNT(oi.product_id) as total_items,
        p.payment_method,
        p.payment_date
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      JOIN branches b ON o.branch_id = b.branch_id
      JOIN order_items oi ON o.order_id = oi.order_id
      LEFT JOIN payments p ON o.order_id = p.order_id
    `;

    const conditions = [];
    const params = [];

    if (branch_id) {
      conditions.push('o.branch_id = ?');
      params.push(branch_id);
    }

    if (customer_id) {
      conditions.push('o.customer_id = ?');
      params.push(customer_id);
    }

    if (start_date) {
      conditions.push('DATE(o.order_date) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(o.order_date) <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY o.order_id
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), parseInt(offset));

    const orders = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      JOIN branches b ON o.branch_id = b.branch_id
    `;

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const countResult = await executeQuery(countQuery, params.slice(0, -2));
    const totalCount = countResult[0].total;

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order by ID with items
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderQuery = `
      SELECT 
        o.order_id,
        o.customer_id,
        o.branch_id,
        o.order_date,
        CONCAT(c.first_name, ' ', c.last_name) as customer_name,
        c.email as customer_email,
        c.phone as customer_phone,
        c.address as customer_address,
        b.branch_name,
        b.location as branch_location,
        p.payment_method,
        p.payment_date
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      JOIN branches b ON o.branch_id = b.branch_id
      LEFT JOIN payments p ON o.order_id = p.order_id
      WHERE o.order_id = ?
    `;

    const orders = await executeQuery(orderQuery, [id]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        p.product_name,
        p.brand,
        pc.category_name,
        (oi.quantity * oi.unit_price) as subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE oi.order_id = ?
      ORDER BY p.product_name
    `;

    const items = await executeQuery(itemsQuery, [id]);

    const order = {
      ...orders[0],
      items,
      total_amount: items.reduce((sum, item) => sum + item.subtotal, 0)
    };

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new order with items
const createOrder = async (req, res) => {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();

    const { customer_id, branch_id, items } = req.body;

    // Create order
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (customer_id, branch_id) VALUES (?, ?)',
      [customer_id, branch_id]
    );

    const orderId = orderResult.insertId;

    // Process order items and update inventory
    for (const item of items) {
      const { product_id, quantity, unit_price } = item;

      // Check inventory availability
      const [inventoryResult] = await connection.execute(
        'SELECT quantity FROM branch_inventory WHERE branch_id = ? AND product_id = ?',
        [branch_id, product_id]
      );

      if (inventoryResult.length === 0 || inventoryResult[0].quantity < quantity) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ID ${product_id}`
        });
      }

      // Add order item
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, product_id, quantity, unit_price]
      );

      // Update inventory
      const newQuantity = inventoryResult[0].quantity - quantity;
      await connection.execute(
        'UPDATE branch_inventory SET quantity = ? WHERE branch_id = ? AND product_id = ?',
        [newQuantity, branch_id, product_id]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order_id: orderId }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  } finally {
    connection.release();
  }
};

// Process payment for order
const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    // Check if order exists
    const orderExists = await executeQuery(
      'SELECT order_id FROM orders WHERE order_id = ?',
      [id]
    );

    if (orderExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if payment already exists
    const existingPayment = await executeQuery(
      'SELECT payment_id FROM payments WHERE order_id = ?',
      [id]
    );

    if (existingPayment.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed for this order'
      });
    }

    // Create payment record
    await executeQuery(
      'INSERT INTO payments (order_id, payment_method) VALUES (?, ?)',
      [id, payment_method]
    );

    res.json({
      success: true,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get order statistics
const getOrderStats = async (req, res) => {
  try {
    const { branch_id, start_date, end_date } = req.query;

    let dateCondition = '';
    const params = [];

    if (start_date && end_date) {
      dateCondition = 'WHERE DATE(o.order_date) BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }

    if (branch_id) {
      if (dateCondition) {
        dateCondition += ' AND o.branch_id = ?';
      } else {
        dateCondition = 'WHERE o.branch_id = ?';
      }
      params.push(branch_id);
    }

    const statsQuery = `
      SELECT 
        COUNT(DISTINCT o.order_id) as total_orders,
        COUNT(DISTINCT o.customer_id) as unique_customers,
        SUM(oi.quantity * oi.unit_price) as total_revenue,
        AVG(order_totals.order_total) as average_order_value,
        SUM(oi.quantity) as total_items_sold
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN (
        SELECT order_id, SUM(quantity * unit_price) as order_total
        FROM order_items
        GROUP BY order_id
      ) order_totals ON o.order_id = order_totals.order_id
      ${dateCondition}
    `;

    const stats = await executeQuery(statsQuery, params);

    res.json({
      success: true,
      data: { stats: stats[0] }
    });

  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get top selling products
const getTopSellingProducts = async (req, res) => {
  try {
    const { branch_id, limit = 10, start_date, end_date } = req.query;

    let query = `
      SELECT 
        p.product_id,
        p.product_name,
        p.brand,
        pc.category_name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.unit_price) as total_revenue,
        AVG(oi.unit_price) as average_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      JOIN product_categories pc ON p.category_id = pc.category_id
      JOIN orders o ON oi.order_id = o.order_id
    `;

    const conditions = [];
    const params = [];

    if (branch_id) {
      conditions.push('o.branch_id = ?');
      params.push(branch_id);
    }

    if (start_date) {
      conditions.push('DATE(o.order_date) >= ?');
      params.push(start_date);
    }

    if (end_date) {
      conditions.push('DATE(o.order_date) <= ?');
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += `
      GROUP BY p.product_id
      ORDER BY total_sold DESC
      LIMIT ?
    `;

    params.push(parseInt(limit));

    const topProducts = await executeQuery(query, params);

    res.json({
      success: true,
      data: { topProducts }
    });

  } catch (error) {
    console.error('Get top selling products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  processPayment,
  getOrderStats,
  getTopSellingProducts
};