const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  // Authentication schemas
  login: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required()
  }),

  // Product schemas
  product: Joi.object({
    product_name: Joi.string().min(1).max(150).required(),
    price: Joi.number().positive().precision(2).required(),
    category_id: Joi.number().integer().positive().required(),
    brand: Joi.string().max(100).optional()
  }),

  // Category schemas
  category: Joi.object({
    category_name: Joi.string().min(1).max(100).required()
  }),

  // Branch schemas
  branch: Joi.object({
    branch_name: Joi.string().min(1).max(100).required(),
    location: Joi.string().min(1).max(255).required(),
    phone: Joi.string().min(10).max(15).required()
  }),

  // Customer schemas
  customer: Joi.object({
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string().min(10).max(255).required(),
    address: Joi.string().min(1).max(255).required()
  }),

  // Employee schemas
  employee: Joi.object({
    first_name: Joi.string().min(1).max(50).required(),
    last_name: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string().min(10).max(255).required(),
    position: Joi.string().min(1).max(50).required(),
    branch_id: Joi.number().integer().positive().optional()
  }),

  // Order schemas
  order: Joi.object({
    customer_id: Joi.number().integer().positive().optional(),
    branch_id: Joi.number().integer().positive().required(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required(),
        unit_price: Joi.number().positive().precision(2).required()
      })
    ).min(1).required()
  }),

  // Supplier schemas
  supplier: Joi.object({
    supplier_name: Joi.string().min(1).max(100).required(),
    phone: Joi.string().min(10).max(15).required(),
    address: Joi.string().min(1).max(255).required()
  }),

  // Restock order schemas
  restockOrder: Joi.object({
    supplier_id: Joi.number().integer().positive().optional(),
    branch_id: Joi.number().integer().positive().required(),
    status: Joi.string().max(50).optional(),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().positive().required()
      })
    ).min(1).required()
  }),

  // Inventory update schemas
  inventoryUpdate: Joi.object({
    quantity: Joi.number().integer().min(0).required()
  }),

  // Payment schemas
  payment: Joi.object({
    payment_method: Joi.string().min(1).max(50).required()
  }),

  // User schemas
  user: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required(),
    role_id: Joi.number().integer().positive().required()
  })
};

module.exports = {
  validate,
  schemas
};