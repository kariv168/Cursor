-- Supermarket Management System Database Setup
-- This script creates the complete database schema with sample data

-- Create and use database
CREATE DATABASE IF NOT EXISTS g1_supermarket;
USE g1_supermarket;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS restock_items;
DROP TABLE IF EXISTS restock_orders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS branch_inventory;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS product_categories;
DROP TABLE IF EXISTS branches;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

-- Create product categories table
CREATE TABLE product_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- Create products table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category_id INT NOT NULL,
    brand VARCHAR(100),
    FOREIGN KEY (category_id)
        REFERENCES product_categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create branches table
CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE
);

-- Create branch inventory table
CREATE TABLE branch_inventory (
    branch_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity >= 0),
    PRIMARY KEY (branch_id, product_id),
    FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create customers table
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL
);

-- Create employees table
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    position VARCHAR(50) NOT NULL,
    branch_id INT,
    FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

-- Create orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    branch_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id)
        REFERENCES customers(customer_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create order items table
CREATE TABLE order_items (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create payments table
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id)
        REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create suppliers table
CREATE TABLE suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL
);

-- Create restock orders table
CREATE TABLE restock_orders (
    restock_order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT,
    branch_id INT NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    FOREIGN KEY (supplier_id)
        REFERENCES suppliers(supplier_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (branch_id)
        REFERENCES branches(branch_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create restock items table
CREATE TABLE restock_items (
    restock_order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    PRIMARY KEY (restock_order_id, product_id),
    FOREIGN KEY (restock_order_id)
        REFERENCES restock_orders(restock_order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create roles table
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Insert sample data

-- Insert product categories
INSERT INTO product_categories (category_name) VALUES
('Beverages'),
('Snacks'),
('Dairy'),
('Produce'),
('Bakery'),
('Meat'),
('Frozen Foods'),
('Household');

-- Insert products
INSERT INTO products (product_name, price, category_id, brand) VALUES
('Coca-Cola Can', 0.80, 1, 'Coca-Cola'),
('Pepsi Bottle 500ml', 1.20, 1, 'Pepsi'),
('Lays Classic Chips', 1.20, 2, 'Lays'),
('Doritos Nacho Cheese', 1.50, 2, 'Doritos'),
('Milk 1L', 1.50, 3, 'Anchor'),
('Cheese Block 200g', 2.50, 3, 'Kraft'),
('Banana (per kg)', 0.70, 4, 'Local Farm'),
('Apple (per kg)', 1.20, 4, 'Fresh Fruits'),
('Bread White Loaf', 1.00, 5, 'Fresh Bakery'),
('Croissant', 0.80, 5, 'Fresh Bakery'),
('Chicken Breast 500g', 4.50, 6, 'Fresh Meat'),
('Beef Steak 300g', 8.00, 6, 'Premium Meat'),
('Ice Cream Vanilla', 2.50, 7, 'Dairy Queen'),
('Frozen Pizza', 3.50, 7, 'Pizza Hut'),
('Dish Soap 500ml', 1.80, 8, 'Dawn'),
('Paper Towels', 2.20, 8, 'Bounty');

-- Insert branches
INSERT INTO branches (branch_name, location, phone) VALUES
('Central Market Branch', '123 Market Street, Downtown', '0123456789'),
('Riverside Branch', '456 Riverside Blvd, Riverside', '0987654321'),
('Mall Branch', '789 Shopping Mall, Westside', '0555666777'),
('Express Branch', '321 Quick Lane, Eastside', '0444333222');

-- Insert branch inventory
INSERT INTO branch_inventory (branch_id, product_id, quantity) VALUES
-- Central Market Branch
(1, 1, 100), (1, 2, 80), (1, 3, 50), (1, 4, 60),
(1, 5, 70), (1, 6, 40), (1, 7, 30), (1, 8, 45),
(1, 9, 25), (1, 10, 35), (1, 11, 20), (1, 12, 15),
(1, 13, 30), (1, 14, 25), (1, 15, 40), (1, 16, 35),

-- Riverside Branch
(2, 1, 120), (2, 2, 90), (2, 3, 65), (2, 4, 70),
(2, 5, 85), (2, 6, 50), (2, 7, 40), (2, 8, 55),
(2, 9, 30), (2, 10, 40), (2, 11, 25), (2, 12, 20),
(2, 13, 35), (2, 14, 30), (2, 15, 45), (2, 16, 40),

-- Mall Branch
(3, 1, 80), (3, 2, 70), (3, 3, 45), (3, 4, 50),
(3, 5, 60), (3, 6, 35), (3, 7, 25), (3, 8, 35),
(3, 9, 20), (3, 10, 30), (3, 11, 15), (3, 12, 10),
(3, 13, 25), (3, 14, 20), (3, 15, 30), (3, 16, 25),

-- Express Branch
(4, 1, 60), (4, 2, 50), (4, 3, 35), (4, 4, 40),
(4, 5, 45), (4, 6, 25), (4, 7, 20), (4, 8, 25),
(4, 9, 15), (4, 10, 20), (4, 11, 10), (4, 12, 8),
(4, 13, 20), (4, 14, 15), (4, 15, 25), (4, 16, 20);

-- Insert customers
INSERT INTO customers (first_name, last_name, email, phone, address) VALUES
('John', 'Doe', 'john.doe@email.com', '011223344', '21 Sunset Road, Downtown'),
('Jane', 'Smith', 'jane.smith@email.com', '022334455', '12 River Lane, Riverside'),
('Bob', 'Johnson', 'bob.johnson@email.com', '033445566', '45 Oak Street, Westside'),
('Alice', 'Brown', 'alice.brown@email.com', '044556677', '78 Pine Avenue, Eastside'),
('Charlie', 'Wilson', 'charlie.wilson@email.com', '055667788', '90 Elm Court, Downtown'),
('Diana', 'Davis', 'diana.davis@email.com', '066778899', '34 Maple Drive, Riverside'),
('Edward', 'Miller', 'edward.miller@email.com', '077889900', '67 Cedar Lane, Westside'),
('Fiona', 'Garcia', 'fiona.garcia@email.com', '088990011', '89 Birch Road, Eastside');

-- Insert employees
INSERT INTO employees (first_name, last_name, email, phone, position, branch_id) VALUES
('Alice', 'Tan', 'alice.tan@supermarket.com', '099887766', 'Cashier', 1),
('Bob', 'Lee', 'bob.lee@supermarket.com', '088776655', 'Manager', 2),
('Carol', 'Chen', 'carol.chen@supermarket.com', '077665544', 'Cashier', 3),
('David', 'Wang', 'david.wang@supermarket.com', '066554433', 'Assistant Manager', 4),
('Eva', 'Liu', 'eva.liu@supermarket.com', '055443322', 'Cashier', 1),
('Frank', 'Zhang', 'frank.zhang@supermarket.com', '044332211', 'Stock Clerk', 2);

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('administrator', 'Has full access to all system modules and configurations'),
('backend_developer', 'Can access APIs and backend components for development'),
('business_analyst', 'Can view reports, data, and system performance, but cannot modify data');

-- Insert users (password is 'password' for all users)
INSERT INTO users (username, password_hash, role_id) VALUES
('admin', 'hashed_password_admin', 1),
('backend_dev', 'hashed_password_backend', 2),
('biz_analyst', 'hashed_password_ba', 3);

-- Insert orders and order items (sample data for the last 30 days)
INSERT INTO orders (customer_id, branch_id, order_date) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 1, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(4, 3, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 2, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(6, 1, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(7, 4, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(8, 3, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 2, DATE_SUB(NOW(), INTERVAL 9 DAY)),
(2, 1, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 4, DATE_SUB(NOW(), INTERVAL 11 DAY)),
(4, 2, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 3, DATE_SUB(NOW(), INTERVAL 13 DAY)),
(6, 1, DATE_SUB(NOW(), INTERVAL 14 DAY)),
(7, 2, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
-- Order 1
(1, 1, 2, 0.80), (1, 3, 1, 1.20), (1, 5, 1, 1.50),
-- Order 2
(2, 2, 1, 1.20), (2, 4, 2, 1.50), (2, 6, 1, 2.50),
-- Order 3
(3, 7, 3, 0.70), (3, 9, 1, 1.00), (3, 11, 1, 4.50),
-- Order 4
(4, 8, 2, 1.20), (4, 10, 3, 0.80), (4, 12, 1, 8.00),
-- Order 5
(5, 13, 1, 2.50), (5, 15, 2, 1.80), (5, 16, 1, 2.20),
-- Order 6
(6, 1, 3, 0.80), (6, 3, 2, 1.20), (6, 5, 2, 1.50),
-- Order 7
(7, 2, 1, 1.20), (7, 4, 1, 1.50), (7, 6, 1, 2.50),
-- Order 8
(8, 7, 2, 0.70), (8, 9, 1, 1.00), (8, 11, 1, 4.50),
-- Order 9
(9, 8, 1, 1.20), (9, 10, 2, 0.80), (9, 12, 1, 8.00),
-- Order 10
(10, 13, 1, 2.50), (10, 15, 1, 1.80), (10, 16, 2, 2.20),
-- Order 11
(11, 1, 2, 0.80), (11, 3, 1, 1.20), (11, 5, 1, 1.50),
-- Order 12
(12, 2, 1, 1.20), (12, 4, 2, 1.50), (12, 6, 1, 2.50),
-- Order 13
(13, 7, 2, 0.70), (13, 9, 1, 1.00), (13, 11, 1, 4.50),
-- Order 14
(14, 8, 1, 1.20), (14, 10, 3, 0.80), (14, 12, 1, 8.00),
-- Order 15
(15, 13, 1, 2.50), (15, 15, 2, 1.80), (15, 16, 1, 2.20);

-- Insert payments
INSERT INTO payments (order_id, payment_method) VALUES
(1, 'Credit Card'),
(2, 'Cash'),
(3, 'Debit Card'),
(4, 'Credit Card'),
(5, 'Cash'),
(6, 'Debit Card'),
(7, 'Credit Card'),
(8, 'Cash'),
(9, 'Debit Card'),
(10, 'Credit Card'),
(11, 'Cash'),
(12, 'Debit Card'),
(13, 'Credit Card'),
(14, 'Cash'),
(15, 'Debit Card');

-- Insert suppliers
INSERT INTO suppliers (supplier_name, phone, address) VALUES
('Fresh Farms Co.', '090123456', '88 Fresh Lane, Farm District'),
('DairyBest Ltd.', '091234567', '77 Milk Road, Dairy District'),
('SnackMaster Inc.', '092345678', '66 Crunch Street, Snack District'),
('BeverageCorp', '093456789', '55 Fizz Avenue, Beverage District'),
('BakeryFresh', '094567890', '44 Flour Lane, Bakery District');

-- Insert restock orders
INSERT INTO restock_orders (supplier_id, branch_id, status) VALUES
(1, 1, 'Delivered'),
(2, 2, 'Pending'),
(3, 3, 'Delivered'),
(4, 4, 'In Transit'),
(5, 1, 'Delivered');

-- Insert restock items
INSERT INTO restock_items (restock_order_id, product_id, quantity) VALUES
(1, 7, 100), (1, 8, 80),
(2, 5, 50), (2, 6, 40),
(3, 3, 60), (3, 4, 70),
(4, 1, 90), (4, 2, 100),
(5, 9, 30), (5, 10, 40);

-- Create indexes for better performance
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_branch_inventory_branch ON branch_inventory(branch_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_customers_email ON customers(email);

-- Show summary
SELECT 
    'Database Setup Complete' as status,
    COUNT(DISTINCT p.product_id) as total_products,
    COUNT(DISTINCT c.customer_id) as total_customers,
    COUNT(DISTINCT o.order_id) as total_orders,
    COUNT(DISTINCT u.user_id) as total_users,
    COUNT(DISTINCT b.branch_id) as total_branches
FROM products p
CROSS JOIN customers c
CROSS JOIN orders o
CROSS JOIN users u
CROSS JOIN branches b;

-- Display sample data
SELECT 'Product Categories' as table_name, COUNT(*) as count FROM product_categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Branches', COUNT(*) FROM branches
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Users', COUNT(*) FROM users; 