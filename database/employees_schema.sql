-- Employee Management Schema
-- This script creates the employees table with all the required fields

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  emailPassword VARCHAR(255),
  
  -- Personal Information
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  empType ENUM('Permanent', 'Contract', 'Temporary') DEFAULT 'Permanent',
  department VARCHAR(100),
  pfNo VARCHAR(50),
  dob DATE,
  maritalStatus ENUM('Single', 'Married', 'Divorced', 'Widowed') DEFAULT 'Single',
  
  -- Contact Information
  presentAddress TEXT,
  city VARCHAR(100),
  pin VARCHAR(20),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  phone VARCHAR(20),
  mobile VARCHAR(20),
  email VARCHAR(255),
  
  -- Qualification
  qualification VARCHAR(200),
  institute VARCHAR(200),
  passingYear INT,
  
  -- Work Experience
  workExperience TEXT,
  
  -- Leave Structure
  leaveStructure TEXT,
  
  -- Employment Details
  employeeStatus ENUM('Working', 'On Leave', 'Terminated') DEFAULT 'Working',
  role VARCHAR(100),
  joiningDate DATE,
  
  -- Salary Structure
  basicSalary DECIMAL(10,2) DEFAULT 0,
  da DECIMAL(10,2) DEFAULT 0, -- Dearness Allowance
  hra DECIMAL(10,2) DEFAULT 0, -- House Rent Allowance
  conveyanceAllowance DECIMAL(10,2) DEFAULT 0,
  otherAllowance DECIMAL(10,2) DEFAULT 0,
  
  -- Statutory Information (Boolean flags)
  bonus BOOLEAN DEFAULT FALSE,
  pf BOOLEAN DEFAULT FALSE, -- Provident Fund
  mlwf BOOLEAN DEFAULT FALSE, -- Maharashtra Labour Welfare Fund
  pt BOOLEAN DEFAULT FALSE, -- Professional Tax
  esic BOOLEAN DEFAULT FALSE, -- Employee State Insurance Corporation
  tds BOOLEAN DEFAULT FALSE, -- Tax Deducted at Source
  
  -- Statutory Amounts/Percentages
  bonusAmount DECIMAL(10,2) DEFAULT 0,
  pfAmount DECIMAL(10,2) DEFAULT 0,
  mlwfPercentage DECIMAL(5,2) DEFAULT 7.00,
  ptAmount DECIMAL(10,2) DEFAULT 0,
  esicPercentage DECIMAL(5,2) DEFAULT 7.00,
  tdsPercentage DECIMAL(5,2) DEFAULT 0,
  
  -- Salary Periods (JSON field for historical salary data)
  salaryPeriods JSON,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for better performance
  INDEX idx_username (username),
  INDEX idx_department (department),
  INDEX idx_employee_status (employeeStatus),
  INDEX idx_joining_date (joiningDate),
  INDEX idx_name (firstName, lastName),
  INDEX idx_email (email)
);

-- Insert sample data for testing
INSERT INTO employees (
  username, firstName, lastName, gender, empType, department, role,
  email, mobile, joiningDate, employeeStatus, basicSalary, hra, da,
  bonus, pf, esic, pt
) VALUES 
(
  'chandrakant', 'Chandrakant', 'Controller', 'Male', 'Permanent', 
  'Administration', 'Administrator', 'chandrakant@example.com', 
  '9876543210', '2023-01-15', 'Working', 25000, 5000, 2000,
  TRUE, TRUE, TRUE, TRUE
),
(
  'priya.sharma', 'Priya', 'Sharma', 'Female', 'Permanent', 
  'HR', 'HR Manager', 'priya.sharma@example.com', 
  '9876543211', '2023-02-01', 'Working', 30000, 6000, 3000,
  TRUE, TRUE, TRUE, TRUE
),
(
  'rajesh.kumar', 'Rajesh', 'Kumar', 'Male', 'Contract', 
  'IT', 'Software Developer', 'rajesh.kumar@example.com', 
  '9876543212', '2023-03-15', 'Working', 35000, 7000, 3500,
  FALSE, TRUE, TRUE, TRUE
);
