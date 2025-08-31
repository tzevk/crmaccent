-- Users Table Schema
-- This script ensures the users table exists with proper structure

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    department VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_department (department),
    INDEX idx_user_active (is_active)
);

-- Insert default admin user if no users exist
INSERT IGNORE INTO users (name, email, password, role, department, is_active) 
SELECT 'System Admin', 'admin@crmaccent.com', 'admin123', 'admin', 'Administration', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Sample data for testing (optional)
INSERT IGNORE INTO users (name, email, password, role, department, phone, is_active) VALUES
('John Manager', 'john.manager@example.com', 'temp123', 'manager', 'Sales', '+91 9876543210', TRUE),
('Sarah Executive', 'sarah.exec@example.com', 'temp123', 'executive', 'Marketing', '+91 9876543211', TRUE),
('Mike User', 'mike.user@example.com', 'temp123', 'user', 'Development', '+91 9876543212', TRUE);

-- Display table info
SELECT 'users table created/verified successfully' as message;
SELECT COUNT(*) as total_users FROM users;
