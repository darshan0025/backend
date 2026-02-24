-- Database Schema for Support Ticket Management System

CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('MANAGER', 'SUPPORT', 'USER') NOT NULL UNIQUE
);

-- Insert Default Roles
INSERT IGNORE INTO roles (name) VALUES ('MANAGER'), ('SUPPORT'), ('USER');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    created_by INT NOT NULL,
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 4. Ticket Comments Table
CREATE TABLE IF NOT EXISTS ticket_comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Ticket Status Logs Table
CREATE TABLE IF NOT EXISTS ticket_status_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    old_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL,
    new_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL,
    changed_by INT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Create default users (Password for all is 'password123')
-- bcrypt hash for 'password123': $2b$10$XVpiSYoYzPA/5z4VLIKSsO2n0ZtFVj2gS/DkKwE/VcsuYd2ZOMQPy

-- 1. Default Manager
INSERT IGNORE INTO users (name, email, password, role_id) 
SELECT 'Admin Manager', 'manager@test.com', '$2b$10$XVpiSYoYzPA/5z4VLIKSsO2n0ZtFVj2gS/DkKwE/VcsuYd2ZOMQPy', id 
FROM roles WHERE name = 'MANAGER';

-- 2. Default Support
INSERT IGNORE INTO users (name, email, password, role_id) 
SELECT 'Tech Support', 'support@test.com', '$2b$10$XVpiSYoYzPA/5z4VLIKSsO2n0ZtFVj2gS/DkKwE/VcsuYd2ZOMQPy', id 
FROM roles WHERE name = 'SUPPORT';

-- 3. Default Employee User
INSERT IGNORE INTO users (name, email, password, role_id) 
SELECT 'Employee User', 'user@test.com', '$2b$10$XVpiSYoYzPA/5z4VLIKSsO2n0ZtFVj2gS/DkKwE/VcsuYd2ZOMQPy', id 
FROM roles WHERE name = 'USER';
