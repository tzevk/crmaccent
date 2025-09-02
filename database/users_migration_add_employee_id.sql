-- Add employee_id field to users table for tracking employee-to-user conversions
-- Run this migration to update the users table

USE crmaccent;

-- Add employee_id column if it doesn't exist
SET @column_exists = 0;
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'users' 
AND column_name = 'employee_id';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE users ADD COLUMN employee_id INT NULL AFTER is_active, ADD INDEX idx_employee_id (employee_id)', 
    'SELECT "employee_id column already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Display updated table structure
DESCRIBE users;

-- Show current users
SELECT 'Updated users table structure' as message;
SELECT COUNT(*) as total_users FROM users;
