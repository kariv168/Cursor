const { executeQuery } = require('../config/database');

// Get all branches
const getAllBranches = async (req, res) => {
  try {
    const branches = await executeQuery(
      'SELECT * FROM branches ORDER BY branch_name'
    );

    res.json({
      success: true,
      data: { branches }
    });

  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get branch by ID with employees
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get branch details
    const branches = await executeQuery(
      'SELECT * FROM branches WHERE branch_id = ?',
      [id]
    );

    if (branches.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Get employees for this branch
    const employees = await executeQuery(
      'SELECT * FROM employees WHERE branch_id = ? ORDER BY first_name, last_name',
      [id]
    );

    const branch = {
      ...branches[0],
      employees
    };

    res.json({
      success: true,
      data: { branch }
    });

  } catch (error) {
    console.error('Get branch by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new branch
const createBranch = async (req, res) => {
  try {
    const { branch_name, location, phone } = req.body;

    // Check if branch name already exists
    const existingBranch = await executeQuery(
      'SELECT branch_id FROM branches WHERE branch_name = ?',
      [branch_name]
    );

    if (existingBranch.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Branch with this name already exists'
      });
    }

    // Check if phone number already exists
    const existingPhone = await executeQuery(
      'SELECT branch_id FROM branches WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Branch with this phone number already exists'
      });
    }

    const result = await executeQuery(
      'INSERT INTO branches (branch_name, location, phone) VALUES (?, ?, ?)',
      [branch_name, location, phone]
    );

    res.status(201).json({
      success: true,
      message: 'Branch created successfully',
      data: { branch_id: result.insertId }
    });

  } catch (error) {
    console.error('Create branch error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { branch_id } = req.query;

    let query = `
      SELECT e.*, b.branch_name, b.location 
      FROM employees e 
      LEFT JOIN branches b ON e.branch_id = b.branch_id
    `;
    
    const params = [];

    if (branch_id) {
      query += ' WHERE e.branch_id = ?';
      params.push(branch_id);
    }

    query += ' ORDER BY e.first_name, e.last_name';

    const employees = await executeQuery(query, params);

    res.json({
      success: true,
      data: { employees }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, position, branch_id } = req.body;

    // Check if email already exists
    const existingEmail = await executeQuery(
      'SELECT employee_id FROM employees WHERE email = ?',
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email already exists'
      });
    }

    // Check if phone already exists
    const existingPhone = await executeQuery(
      'SELECT employee_id FROM employees WHERE phone = ?',
      [phone]
    );

    if (existingPhone.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this phone number already exists'
      });
    }

    // Verify branch exists if branch_id provided
    if (branch_id) {
      const branch = await executeQuery(
        'SELECT branch_id FROM branches WHERE branch_id = ?',
        [branch_id]
      );

      if (branch.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID'
        });
      }
    }

    const result = await executeQuery(
      'INSERT INTO employees (first_name, last_name, email, phone, position, branch_id) VALUES (?, ?, ?, ?, ?, ?)',
      [first_name, last_name, email, phone, position, branch_id]
    );

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee_id: result.insertId }
    });

  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  getAllEmployees,
  createEmployee
};