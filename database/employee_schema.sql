-- Employee Management Schema Update
-- Fixed version with proper table creation order and relationships

-- First create the departments table (no dependencies)
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  head_id INT NULL, -- Will be set after employees table is created
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create designations table (depends on departments)
CREATE TABLE IF NOT EXISTS designations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) UNIQUE NOT NULL,
  department_id INT NULL,
  level INT DEFAULT 1,  -- Seniority level (1-10)
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Main employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE,  -- EMP-12345
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  profile_image VARCHAR(255),
  
  -- Employment details (using names for flexibility)
  department VARCHAR(100),
  designation VARCHAR(100),
  reporting_manager_id INT NULL,
  join_date DATE,
  employment_status ENUM('active', 'on_leave', 'terminated', 'resigned') DEFAULT 'active',
  
  -- Personal details
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'India',
  
  -- Linked user account (optional)
  user_id INT UNIQUE NULL,
  
  -- System fields
  created_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Self-referencing foreign key for reporting manager
  FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Add foreign key for department head after employees table exists
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_head 
FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Employee Education
CREATE TABLE IF NOT EXISTS employee_education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  degree VARCHAR(100),
  institution VARCHAR(100),
  start_year INT,
  end_year INT,
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Work Experience
CREATE TABLE IF NOT EXISTS employee_experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  company VARCHAR(100),
  position VARCHAR(100),
  start_date DATE,
  end_date DATE,
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  document_type ENUM('id_proof', 'address_proof', 'education', 'experience', 'contract', 'other') NOT NULL,
  document_name VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT DEFAULT 0,
  mime_type VARCHAR(100),
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Employee Salaries (if needed for HR management)
CREATE TABLE IF NOT EXISTS employee_salaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  basic_salary DECIMAL(10,2),
  allowances DECIMAL(10,2) DEFAULT 0,
  deductions DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2),
  effective_date DATE NOT NULL,
  created_by INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_designation ON employees(designation);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_employee_id ON employees(employee_id);
CREATE INDEX idx_employees_manager ON employees(reporting_manager_id);

-- Add indexes for related tables
CREATE INDEX idx_employee_education_employee ON employee_education(employee_id);
CREATE INDEX idx_employee_experience_employee ON employee_experience(employee_id);
CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_designations_title ON designations(title);
CREATE INDEX idx_designations_department ON designations(department_id);

-- Insert default departments
INSERT INTO departments (name, description) VALUES 
('Engineering', 'Software development and technical teams'),
('Marketing', 'Marketing, branding, and customer outreach'),
('Sales', 'Business development and sales operations'),
('Human Resources', 'HR, recruitment, and employee management'),
('Finance', 'Accounting, finance, and administration'),
('Operations', 'General operations and project management')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default designations
INSERT INTO designations (title, department_id, level, description) VALUES 
('Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 3, 'Software development and programming'),
('Senior Software Engineer', (SELECT id FROM departments WHERE name = 'Engineering'), 5, 'Senior software development role'),
('Technical Lead', (SELECT id FROM departments WHERE name = 'Engineering'), 7, 'Technical leadership and team management'),
('Marketing Executive', (SELECT id FROM departments WHERE name = 'Marketing'), 3, 'Marketing campaigns and brand management'),
('Sales Executive', (SELECT id FROM departments WHERE name = 'Sales'), 3, 'Sales and business development'),
('HR Executive', (SELECT id FROM departments WHERE name = 'Human Resources'), 3, 'Human resources and recruitment'),
('Project Manager', (SELECT id FROM departments WHERE name = 'Operations'), 6, 'Project planning and management'),
('Manager', NULL, 6, 'Department or team management role'),
('Senior Manager', NULL, 7, 'Senior management position'),
('Director', NULL, 9, 'Director level position')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Note: User table modifications should be done separately
-- This creates the employee_id link for users when ready:
/*
ALTER TABLE users 
ADD COLUMN employee_id INT UNIQUE NULL,
ADD CONSTRAINT fk_users_employee 
FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Add employee_id back-reference to users (for linking)
ALTER TABLE employees 
ADD CONSTRAINT fk_employees_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_employees_creator 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
*/
