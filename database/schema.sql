-- ===============================================
-- ServiceCRM - Структура базы данных (PostgreSQL)
-- ===============================================

-- Создание базы данных (выполняется отдельно!)
-- CREATE DATABASE servicecrm ENCODING 'UTF8';

-- \c servicecrm;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'master')),
    specialization VARCHAR(100),
    commission_percent INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Клиенты
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Склады
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    manager_id INT REFERENCES users(id),
    comment TEXT
);

-- Товары
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    buy_price DECIMAL(10,2) DEFAULT 0,
    sell_price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0,
    warehouse_id INT REFERENCES warehouses(id)
);

-- Заказы
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    client_id INT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    device VARCHAR(150),
    issue TEXT,
    diagnosis TEXT,
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'vip')),
    status VARCHAR(50) DEFAULT 'new',
    master_id INT REFERENCES users(id) ON DELETE SET NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    paid DECIMAL(10,2) DEFAULT 0,
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Финансы
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    order_id INT REFERENCES orders(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Настройки
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(255)
);
