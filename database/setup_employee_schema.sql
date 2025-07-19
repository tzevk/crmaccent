-- Employee Schema Setup Script
-- Run this script to set up all employee-related tables with proper dependencies

SET foreign_key_checks = 0;

-- Drop tables in reverse order to handle dependencies
DROP TABLE IF EXISTS employee_salaries;
DROP TABLE IF EXISTS employee_documents;
DROP TABLE IF EXISTS employee_experience;
DROP TABLE IF EXISTS employee_education;
DROP TABLE IF EXISTS designations;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;

SET foreign_key_checks = 1;

-- Now create tables in correct order
SOURCE employee_schema.sql;

-- Verify table creation
SHOW TABLES LIKE '%employee%';
SHOW TABLES LIKE 'departments';
SHOW TABLES LIKE 'designations';

-- Show table structures
DESCRIBE departments;
DESCRIBE designations;
DESCRIBE employees;
DESCRIBE employee_education;
DESCRIBE employee_experience;
DESCRIBE employee_documents;
DESCRIBE employee_salaries;
