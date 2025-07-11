-- Supermarket Management System Database Setup
-- Run this script in your MySQL database to set up the required tables and demo data

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS g1_supermarket;
USE g1_supermarket;

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    product_name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    brand VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Create branches table
CREATE TABLE IF NOT EXISTS branches (
    branch_id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    branch_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    branch_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
    UNIQUE KEY unique_product_branch (product_id, branch_id)
);

-- Insert demo roles
INSERT INTO roles (role_name, description) VALUES
('administrator', 'System administrator with full access'),
('backend_developer', 'Backend developer with technical access'),
('business_analyst', 'Business analyst with reporting access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert demo users (password is 'password' for all users)
INSERT INTO users (username, password_hash, role_id) VALUES
('admin', 'hashed_password', 1),
('backend_dev', 'hashed_password', 2),
('biz_analyst', 'hashed_password', 3)
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Insert demo categories
INSERT INTO categories (category_name, description) VALUES
('Dairy', 'Milk, cheese, yogurt, and other dairy products'),
('Bakery', 'Bread, pastries, and baked goods'),
('Fruits', 'Fresh fruits and berries'),
('Vegetables', 'Fresh vegetables and greens'),
('Meat', 'Fresh meat and poultry'),
('Pantry', 'Canned goods, pasta, and dry foods'),
('Beverages', 'Soft drinks, juices, and water'),
('Snacks', 'Chips, nuts, and snack foods')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert demo products
INSERT INTO products (product_name, price, category_id, brand) VALUES
('Whole Milk', 3.50, 1, 'Farm Fresh'),
('White Bread', 2.50, 2, 'Baker\'s Choice'),
('Apples (1lb)', 1.20, 3, 'Fresh Market'),
('Cheddar Cheese', 6.00, 1, 'Dairy Delight'),
('Bananas (1lb)', 0.80, 3, 'Tropical Fresh'),
('Chicken Breast', 8.50, 5, 'Farm Raised'),
('Greek Yogurt', 4.00, 1, 'Healthy Choice'),
('Spaghetti', 2.00, 6, 'Pasta Perfect'),
('Ground Beef', 12.00, 5, 'Premium Meat'),
('Tomatoes (1lb)', 1.50, 4, 'Garden Fresh')
ON DUPLICATE KEY UPDATE price = VALUES(price);

-- Insert demo branches
INSERT INTO branches (branch_name, location, phone) VALUES
('Downtown Branch', '123 Main St, Downtown', '555-0101'),
('Westside Branch', '456 West Ave, Westside', '555-0102'),
('Eastside Branch', '789 East Blvd, Eastside', '555-0103')
ON DUPLICATE KEY UPDATE phone = VALUES(phone);

-- Insert demo customers
INSERT INTO customers (first_name, last_name, email, phone, address) VALUES
('John', 'Doe', 'john.doe@email.com', '555-1001', '123 Oak St, City'),
('Jane', 'Smith', 'jane.smith@email.com', '555-1002', '456 Pine Ave, City'),
('Bob', 'Johnson', 'bob.johnson@email.com', '555-1003', '789 Elm Blvd, City'),
('Alice', 'Wilson', 'alice.wilson@email.com', '555-1004', '321 Maple Dr, City'),
('Charlie', 'Brown', 'charlie.brown@email.com', '555-1005', '654 Cedar Ln, City')
ON DUPLICATE KEY UPDATE phone = VALUES(phone);

-- Insert demo orders
INSERT INTO orders (customer_id, branch_id, order_date, total_amount) VALUES
(1, 1, NOW() - INTERVAL 1 HOUR, 45.50),
(2, 1, NOW() - INTERVAL 2 HOUR, 78.20),
(3, 2, NOW() - INTERVAL 3 HOUR, 23.99),
(4, 2, NOW() - INTERVAL 4 HOUR, 156.75),
(5, 3, NOW() - INTERVAL 5 HOUR, 89.30)
ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount);

-- Insert demo order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1, 1, 2, 3.50),  -- 2 milks
(1, 2, 1, 2.50),  -- 1 bread
(1, 3, 3, 1.20),  -- 3 lbs apples
(2, 4, 1, 6.00),  -- 1 cheese
(2, 5, 2, 0.80),  -- 2 lbs bananas
(2, 6, 1, 8.50),  -- 1 chicken
(3, 7, 2, 4.00),  -- 2 yogurts
(4, 8, 3, 2.00),  -- 3 pastas
(4, 9, 2, 12.00), -- 2 lbs beef
(5, 10, 4, 1.50)  -- 4 lbs tomatoes
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- Insert demo inventory
INSERT INTO inventory (product_id, branch_id, quantity) VALUES
(1, 1, 100), (1, 2, 85), (1, 3, 120),
(2, 1, 50), (2, 2, 75), (2, 3, 60),
(3, 1, 200), (3, 2, 150), (3, 3, 180),
(4, 1, 30), (4, 2, 45), (4, 3, 25),
(5, 1, 300), (5, 2, 250), (5, 3, 280),
(6, 1, 40), (6, 2, 35), (6, 3, 50),
(7, 1, 80), (7, 2, 65), (7, 3, 90),
(8, 1, 120), (8, 2, 100), (8, 3, 110),
(9, 1, 25), (9, 2, 30), (9, 3, 20),
(10, 1, 150), (10, 2, 130), (10, 3, 160)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- Show summary
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_roles FROM roles;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders; 