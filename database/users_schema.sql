-- Users Table Schema
-- This script ensures the users table exists with proper structure

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100),
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    employee_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id)
);

-- Insert default admin user if no users exist
INSERT IGNORE INTO users (username, password_hash, email, full_name, role, status) 
SELECT 'admin', 'admin123', 'admin@crmaccent.com', 'System Administrator', 'admin', 'active'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

-- Sample data for testing (optional)
INSERT IGNORE INTO users (username, password_hash, email, full_name, role, status) VALUES
('johnmanager', 'temp123', 'john.manager@example.com', 'John Manager', 'manager', 'active'),
('sarahexec', 'temp123', 'sarah.exec@example.com', 'Sarah Executive', 'user', 'active'),
('mikeuser', 'temp123', 'mike.user@example.com', 'Mike User', 'user', 'active');

-- Display table info
SELECT 'users table created/verified successfully' as message;
SELECT COUNT(*) as total_users FROM users;
