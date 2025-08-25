-- Lead Management System Database Setup
-- This script creates all necessary tables for the CRM lead management system

-- Drop existing tables if they exist (be careful in production)
-- DROP TABLE IF EXISTS followups;
-- DROP TABLE IF EXISTS leads;
-- DROP TABLE IF EXISTS enquiry_statuses;
-- DROP TABLE IF EXISTS project_statuses;
-- DROP TABLE IF EXISTS enquiry_types;
-- DROP TABLE IF EXISTS project_descriptions;
-- DROP TABLE IF EXISTS cities;
-- DROP TABLE IF EXISTS companies;

-- 1. Master Tables (for dropdowns and references)

-- Companies master table
CREATE TABLE IF NOT EXISTS companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    sector VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_company_name (name),
    INDEX idx_company_city (city)
);

-- Cities master table
CREATE TABLE IF NOT EXISTS cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_city_name (name),
    INDEX idx_city_state (state)
);

-- Enquiry types master table
CREATE TABLE IF NOT EXISTS enquiry_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project descriptions master table
CREATE TABLE IF NOT EXISTS project_descriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_project_category (category)
);

-- Enquiry statuses master table
CREATE TABLE IF NOT EXISTS enquiry_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7), -- For UI color coding
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project statuses master table
CREATE TABLE IF NOT EXISTS project_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7), -- For UI color coding
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (if not exists)
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
    INDEX idx_user_role (role)
);

-- 2. Main Leads Table

CREATE TABLE IF NOT EXISTS leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    
    -- Lead identification
    enquiry_no VARCHAR(50) UNIQUE NOT NULL,
    year INT NOT NULL,
    enquiry_date DATE NOT NULL,
    
    -- Lead source and type
    enquiry_type VARCHAR(100) DEFAULT 'Direct',
    source VARCHAR(255), -- Referrer name, website, etc.
    
    -- Company information (can be linked to companies table or stored directly)
    company_id INT NULL, -- FK to companies table (optional)
    company_name VARCHAR(255) NOT NULL, -- Direct storage for flexibility
    city_id INT NULL, -- FK to cities table (optional)
    city VARCHAR(100), -- Direct storage for flexibility
    industry VARCHAR(100), -- Sector classification
    
    -- Contact information
    contact_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    mobile VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    
    -- Project details
    project_name VARCHAR(255),
    project_description_id INT NULL, -- FK to project_descriptions (optional)
    project_description VARCHAR(255), -- Direct storage for flexibility
    estimated_value DECIMAL(15,2) DEFAULT 0,
    estimated_duration INT, -- in months
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Lead status tracking
    enquiry_status_id INT NULL, -- FK to enquiry_statuses (optional)
    enquiry_status VARCHAR(100) DEFAULT 'New', -- Direct storage for flexibility
    project_status_id INT NULL, -- FK to project_statuses (optional)
    project_status VARCHAR(100) DEFAULT 'Pending', -- Direct storage for flexibility
    lead_stage ENUM('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') DEFAULT 'New',
    
    -- Assignment and ownership
    assigned_to INT NULL, -- FK to users table
    
    -- Additional information
    remarks TEXT,
    
    -- System fields
    created_by INT NOT NULL DEFAULT 1, -- FK to users table
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_enquiry_no (enquiry_no),
    INDEX idx_company_name (company_name),
    INDEX idx_enquiry_date (enquiry_date),
    INDEX idx_lead_stage (lead_stage),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_by (created_by),
    INDEX idx_year (year),
    
    -- Foreign key constraints (optional - can be enforced if using master tables)
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
    FOREIGN KEY (project_description_id) REFERENCES project_descriptions(id) ON DELETE SET NULL,
    FOREIGN KEY (enquiry_status_id) REFERENCES enquiry_statuses(id) ON DELETE SET NULL,
    FOREIGN KEY (project_status_id) REFERENCES project_statuses(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Follow-ups Table

CREATE TABLE IF NOT EXISTS followups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    followup_date DATE NOT NULL,
    description TEXT NOT NULL,
    next_action VARCHAR(500),
    followup_type VARCHAR(50) DEFAULT 'General', -- Call, Email, Meeting, etc.
    status VARCHAR(50) DEFAULT 'Completed', -- Completed, Pending, Cancelled
    created_by INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_lead_id (lead_id),
    INDEX idx_followup_date (followup_date),
    INDEX idx_created_by (created_by),
    
    -- Foreign key constraints
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Lead Activities Table (for audit trail)

CREATE TABLE IF NOT EXISTS lead_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL, -- status_change, assignment, note, etc.
    description TEXT NOT NULL,
    old_value VARCHAR(500),
    new_value VARCHAR(500),
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL DEFAULT 1,
    
    -- Indexes
    INDEX idx_lead_id (lead_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_activity_date (activity_date),
    
    -- Foreign key constraints
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Insert default/sample data

-- Insert default enquiry types
INSERT INTO enquiry_types (type_name, description) VALUES
('Direct', 'Direct enquiry from customer'),
('Reference', 'Referred by existing customer or partner'),
('Exhibition', 'Lead from trade shows or exhibitions'),
('Website', 'Enquiry through company website'),
('Social Media', 'Lead from social media platforms'),
('Cold Call', 'Outbound sales call'),
('Email Campaign', 'Response to email marketing'),
('Advertisement', 'Response to advertisements')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default project descriptions
INSERT INTO project_descriptions (description, category) VALUES
('Software Development', 'Technology'),
('Web Application Development', 'Technology'),
('Mobile Application Development', 'Technology'),
('ERP System Implementation', 'Enterprise Software'),
('CRM System Implementation', 'Enterprise Software'),
('E-commerce Platform', 'Technology'),
('Database Management System', 'Technology'),
('Business Intelligence Solution', 'Analytics'),
('IT Consulting Services', 'Consulting'),
('Digital Transformation', 'Consulting'),
('Custom Software Solution', 'Technology'),
('System Integration', 'Technology'),
('Cloud Migration', 'Technology'),
('Cybersecurity Solution', 'Security'),
('Other', 'General')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Insert default enquiry statuses
INSERT INTO enquiry_statuses (status_name, description, color_code, display_order) VALUES
('New', 'Newly received enquiry', '#3b82f6', 1),
('Awaiting', 'Awaiting customer response', '#f59e0b', 2),
('In Discussion', 'Under active discussion', '#8b5cf6', 3),
('Proposal Sent', 'Proposal submitted to customer', '#06b6d4', 4),
('Awarded', 'Project awarded to us', '#10b981', 5),
('Lost', 'Lost to competitor or cancelled', '#ef4444', 6),
('On Hold', 'Temporarily on hold', '#6b7280', 7)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert default project statuses
INSERT INTO project_statuses (status_name, description, color_code, display_order) VALUES
('Pending', 'Project not yet started', '#6b7280', 1),
('Planning', 'Project in planning phase', '#3b82f6', 2),
('Ongoing', 'Project in progress', '#f59e0b', 3),
('Testing', 'Project in testing phase', '#8b5cf6', 4),
('Completed', 'Project successfully completed', '#10b981', 5),
('Hold', 'Project on hold', '#ef4444', 6),
('Cancelled', 'Project cancelled', '#991b1b', 7)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert sample cities (Indian cities)
INSERT INTO cities (name, state, country) VALUES
('Mumbai', 'Maharashtra', 'India'),
('Delhi', 'Delhi', 'India'),
('Bangalore', 'Karnataka', 'India'),
('Hyderabad', 'Telangana', 'India'),
('Ahmedabad', 'Gujarat', 'India'),
('Chennai', 'Tamil Nadu', 'India'),
('Kolkata', 'West Bengal', 'India'),
('Pune', 'Maharashtra', 'India'),
('Jaipur', 'Rajasthan', 'India'),
('Lucknow', 'Uttar Pradesh', 'India'),
('Kanpur', 'Uttar Pradesh', 'India'),
('Nagpur', 'Maharashtra', 'India'),
('Indore', 'Madhya Pradesh', 'India'),
('Thane', 'Maharashtra', 'India'),
('Bhopal', 'Madhya Pradesh', 'India'),
('Visakhapatnam', 'Andhra Pradesh', 'India'),
('Pimpri-Chinchwad', 'Maharashtra', 'India'),
('Patna', 'Bihar', 'India'),
('Vadodara', 'Gujarat', 'India'),
('Ghaziabad', 'Uttar Pradesh', 'India')
ON DUPLICATE KEY UPDATE state = VALUES(state);

-- Insert default user if not exists
INSERT INTO users (name, email, password, role, department) VALUES
('System Admin', 'admin@crmaccent.com', 'hashed_password_here', 'admin', 'IT'),
('Sales Manager', 'sales@crmaccent.com', 'hashed_password_here', 'manager', 'Sales'),
('Sales Rep 1', 'rep1@crmaccent.com', 'hashed_password_here', 'user', 'Sales'),
('Sales Rep 2', 'rep2@crmaccent.com', 'hashed_password_here', 'user', 'Sales'),
('Sales Rep 3', 'rep3@crmaccent.com', 'hashed_password_here', 'user', 'Sales')
ON DUPLICATE KEY UPDATE role = VALUES(role);

-- Create views for better querying

-- View for leads with all related data
CREATE VIEW IF NOT EXISTS leads_with_details AS
SELECT 
    l.*,
    c.name as company_master_name,
    c.sector as company_sector,
    ct.name as city_name,
    ct.state as city_state,
    u.name as assigned_to_name,
    u.email as assigned_to_email,
    ub.name as created_by_name,
    et.type_name as enquiry_type_name,
    pd.description as project_desc_name,
    es.status_name as enquiry_status_name,
    es.color_code as enquiry_status_color,
    ps.status_name as project_status_name,
    ps.color_code as project_status_color,
    (SELECT COUNT(*) FROM followups f WHERE f.lead_id = l.id) as followup_count,
    (SELECT MAX(f.followup_date) FROM followups f WHERE f.lead_id = l.id) as last_followup_date
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
LEFT JOIN cities ct ON l.city_id = ct.id
LEFT JOIN users u ON l.assigned_to = u.id
LEFT JOIN users ub ON l.created_by = ub.id
LEFT JOIN enquiry_types et ON l.enquiry_type = et.type_name
LEFT JOIN project_descriptions pd ON l.project_description_id = pd.id
LEFT JOIN enquiry_statuses es ON l.enquiry_status_id = es.id
LEFT JOIN project_statuses ps ON l.project_status_id = ps.id;

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_compound ON leads(lead_stage, enquiry_status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_followups_compound ON followups(lead_id, followup_date);
CREATE INDEX IF NOT EXISTS idx_activities_compound ON lead_activities(lead_id, activity_date);

-- Triggers for automatic activity logging
DELIMITER //

CREATE TRIGGER IF NOT EXISTS lead_insert_activity
AFTER INSERT ON leads
FOR EACH ROW
BEGIN
    INSERT INTO lead_activities (lead_id, activity_type, description, new_value, created_by)
    VALUES (NEW.id, 'lead_created', 'Lead created', CONCAT('Company: ', NEW.company_name), NEW.created_by);
END//

CREATE TRIGGER IF NOT EXISTS lead_update_activity
AFTER UPDATE ON leads
FOR EACH ROW
BEGIN
    -- Log stage changes
    IF OLD.lead_stage != NEW.lead_stage THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, old_value, new_value, created_by)
        VALUES (NEW.id, 'stage_change', 'Lead stage changed', OLD.lead_stage, NEW.lead_stage, NEW.created_by);
    END IF;
    
    -- Log status changes
    IF OLD.enquiry_status != NEW.enquiry_status THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, old_value, new_value, created_by)
        VALUES (NEW.id, 'status_change', 'Enquiry status changed', OLD.enquiry_status, NEW.enquiry_status, NEW.created_by);
    END IF;
    
    -- Log assignment changes
    IF OLD.assigned_to != NEW.assigned_to THEN
        INSERT INTO lead_activities (lead_id, activity_type, description, old_value, new_value, created_by)
        VALUES (NEW.id, 'assignment_change', 'Lead reassigned', 
               COALESCE((SELECT name FROM users WHERE id = OLD.assigned_to), 'Unassigned'),
               COALESCE((SELECT name FROM users WHERE id = NEW.assigned_to), 'Unassigned'),
               NEW.created_by);
    END IF;
END//

DELIMITER ;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON crmaccent.* TO 'crm_user'@'%';
-- FLUSH PRIVILEGES;

-- Display table creation summary
SELECT 'Lead Management Database Setup Complete!' as Status,
       'Tables Created:' as Info,
       'companies, cities, enquiry_types, project_descriptions, enquiry_statuses, project_statuses, users, leads, followups, lead_activities' as Tables;

-- Show table counts
SELECT 
    (SELECT COUNT(*) FROM leads) as total_leads,
    (SELECT COUNT(*) FROM followups) as total_followups,
    (SELECT COUNT(*) FROM lead_activities) as total_activities,
    (SELECT COUNT(*) FROM companies) as total_companies,
    (SELECT COUNT(*) FROM cities) as total_cities,
    (SELECT COUNT(*) FROM enquiry_types) as total_enquiry_types,
    (SELECT COUNT(*) FROM project_descriptions) as total_project_descriptions;
