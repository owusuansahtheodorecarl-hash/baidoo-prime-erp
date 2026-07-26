-- ===================================================
-- BAIDOO PRIME ERP - DATABASE SCHEMA (V1)
-- ===================================================

-- 1. BRANCHES (Shops & Warehouses)
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g. "Accra Main Shop", "Tema Warehouse"
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & STAFF ROLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('SUPER_ADMIN', 'GENERAL_MANAGER', 'BRANCH_MANAGER', 'SALES_OFFICER', 'CASHIER', 'WAREHOUSE_OFFICER', 'ACCOUNTANT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMERS
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PRODUCTS (Tyres, Trucks, Spare Parts)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) CHECK (category IN ('TYRE', 'TRUCK', 'SPARE_PART', 'ACCESSORY')),
    name_or_model VARCHAR(150) NOT NULL, -- e.g. "Sino Truck 371", "315/80R22.5 Tyre"
    brand VARCHAR(100), -- e.g. "Sinotruk", "Triangle", "Linglong"
    unit_price_ghs DECIMAL(12, 2) NOT NULL,
    unit_price_usd DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. INVENTORY STOCK
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches(id),
    product_id INT REFERENCES products(id),
    quantity_in_stock INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. ORDERS & SALES
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. "BP-2026-0001"
    customer_id INT REFERENCES customers(id),
    branch_id INT REFERENCES branches(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    amount_paid DECIMAL(12, 2) DEFAULT 0.00,
    balance_due DECIMAL(12, 2) GENERATED ALWAYS AS (total_amount - amount_paid) STORED, -- Auto-calculated balance
    currency VARCHAR(3) DEFAULT 'GHS', -- 'GHS' or 'USD'
    payment_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PARTIAL', 'PAID_IN_FULL'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. PAYMENTS (Tracks each installment paid)
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'CASH', 'MOMO', 'BANK_TRANSFER'
    received_by_user_id INT REFERENCES users(id),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);