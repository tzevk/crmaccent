-- CRM Database Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  postal_code VARCHAR(20),
  country VARCHAR(50),
  company VARCHAR(100),
  website VARCHAR(255),
  status ENUM('active', 'inactive', 'lead', 'customer') NOT NULL DEFAULT 'active',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  enquiry_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  company VARCHAR(100),
  location VARCHAR(100),
  requirement TEXT,
  status ENUM('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost') NOT NULL DEFAULT 'new',
  source VARCHAR(50),
  assigned_to INT,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_number VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  type ENUM('PROPOSAL', 'ONGOING') NOT NULL DEFAULT 'PROPOSAL',
  client_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
  value DECIMAL(15, 2),
  description TEXT,
  has_quotation BOOLEAN DEFAULT FALSE,
  quotation_number VARCHAR(50),
  quotation_date DATE,
  has_po BOOLEAN DEFAULT FALSE,
  po_number VARCHAR(50),
  po_date DATE,
  has_invoice BOOLEAN DEFAULT FALSE,
  invoice_number VARCHAR(50),
  invoice_date DATE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Project Team Members (Many-to-Many)
CREATE TABLE IF NOT EXISTS project_team (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (project_id, user_id)
);

-- Project Tasks/Activities
CREATE TABLE IF NOT EXISTS project_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  assigned_to INT,
  due_date DATE,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Logs
CREATE TABLE IF NOT EXISTS logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'lead', 'project', etc.
  entity_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create trigger to track project changes
DELIMITER //
CREATE TRIGGER project_after_update
AFTER UPDATE ON projects
FOR EACH ROW
BEGIN
  -- Log status changes
  IF OLD.status != NEW.status THEN
    INSERT INTO logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.created_by, 
      CONCAT('Project status changed from ', OLD.status, ' to ', NEW.status), 
      'project', 
      NEW.id,
      JSON_OBJECT('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  -- Log document changes
  IF OLD.has_quotation != NEW.has_quotation OR OLD.has_po != NEW.has_po OR OLD.has_invoice != NEW.has_invoice THEN
    INSERT INTO logs (user_id, action, entity_type, entity_id, details)
    VALUES (
      NEW.created_by,
      'Project documents updated',
      'project',
      NEW.id,
      JSON_OBJECT(
        'has_quotation_changed', OLD.has_quotation != NEW.has_quotation,
        'has_po_changed', OLD.has_po != NEW.has_po,
        'has_invoice_changed', OLD.has_invoice != NEW.has_invoice
      )
    );
  END IF;
END //
DELIMITER ;