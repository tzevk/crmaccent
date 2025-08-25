-- Lead Management System Database Setup (Simplified)
-- This script creates all necessary tables for the CRM lead management system

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cities master table
CREATE TABLE IF NOT EXISTS cities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enquiry statuses master table
CREATE TABLE IF NOT EXISTS enquiry_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project statuses master table
CREATE TABLE IF NOT EXISTS project_statuses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    source VARCHAR(255),
    
    -- Company information
    company_id INT NULL,
    company_name VARCHAR(255) NOT NULL,
    city_id INT NULL,
    city VARCHAR(100),
    industry VARCHAR(100),
    
    -- Contact information
    contact_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    mobile VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    
    -- Project details
    project_name VARCHAR(255),
    project_description_id INT NULL,
    project_description VARCHAR(255),
    estimated_value DECIMAL(15,2) DEFAULT 0,
    estimated_duration INT,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Lead status tracking
    enquiry_status_id INT NULL,
    enquiry_status VARCHAR(100) DEFAULT 'New',
    project_status_id INT NULL,
    project_status VARCHAR(100) DEFAULT 'Pending',
    lead_stage ENUM('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') DEFAULT 'New',
    
    -- Assignment and ownership
    assigned_to INT NULL,
    
    -- Additional information
    remarks TEXT,
    
    -- System fields
    created_by INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Follow-ups Table
CREATE TABLE IF NOT EXISTS followups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    followup_date DATE NOT NULL,
    description TEXT NOT NULL,
    next_action VARCHAR(500),
    followup_type VARCHAR(50) DEFAULT 'General',
    status VARCHAR(50) DEFAULT 'Completed',
    created_by INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Lead Activities Table (for audit trail)
CREATE TABLE IF NOT EXISTS lead_activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lead_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    old_value VARCHAR(500),
    new_value VARCHAR(500),
    activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL DEFAULT 1
);

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_company_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_city_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_enquiry_no ON leads(enquiry_no);
CREATE INDEX IF NOT EXISTS idx_company_name_leads ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_enquiry_date ON leads(enquiry_date);
CREATE INDEX IF NOT EXISTS idx_lead_stage ON leads(lead_stage);
CREATE INDEX IF NOT EXISTS idx_followup_date ON followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_activity_date ON lead_activities(activity_date);

-- 6. Insert default data

-- Default enquiry types
INSERT IGNORE INTO enquiry_types (type_name, description) VALUES
('Direct', 'Direct enquiry from customer'),
('Reference', 'Referred by existing customer or partner'),
('Exhibition', 'Lead from trade shows or exhibitions'),
('Website', 'Enquiry through company website'),
('Social Media', 'Lead from social media platforms'),
('Cold Call', 'Outbound sales call'),
('Email Campaign', 'Response to email marketing'),
('Advertisement', 'Response to advertisements');

-- Default project descriptions
INSERT IGNORE INTO project_descriptions (description, category) VALUES
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
('Other', 'General');

-- Default enquiry statuses
INSERT IGNORE INTO enquiry_statuses (status_name, description, color_code, display_order) VALUES
('New', 'Newly received enquiry', '#3b82f6', 1),
('Awaiting', 'Awaiting customer response', '#f59e0b', 2),
('In Discussion', 'Under active discussion', '#8b5cf6', 3),
('Proposal Sent', 'Proposal submitted to customer', '#06b6d4', 4),
('Awarded', 'Project awarded to us', '#10b981', 5),
('Lost', 'Lost to competitor or cancelled', '#ef4444', 6),
('On Hold', 'Temporarily on hold', '#6b7280', 7);

-- Default project statuses  
INSERT IGNORE INTO project_statuses (status_name, description, color_code, display_order) VALUES
('Pending', 'Project not yet started', '#6b7280', 1),
('Planning', 'Project in planning phase', '#3b82f6', 2),
('Ongoing', 'Project in progress', '#f59e0b', 3),
('Testing', 'Project in testing phase', '#8b5cf6', 4),
('Completed', 'Project completed successfully', '#10b981', 5),
('Hold', 'Project temporarily on hold', '#6b7280', 6),
('Cancelled', 'Project cancelled', '#ef4444', 7);

-- Sample cities
INSERT IGNORE INTO cities (name, state) VALUES
('Mumbai', 'Maharashtra'),
('Delhi', 'Delhi'),
('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'),
('Ahmedabad', 'Gujarat'),
('Chennai', 'Tamil Nadu'),
('Kolkata', 'West Bengal'),
('Surat', 'Gujarat'),
('Pune', 'Maharashtra'),
('Jaipur', 'Rajasthan'),
('Lucknow', 'Uttar Pradesh'),
('Kanpur', 'Uttar Pradesh'),
('Nagpur', 'Maharashtra'),
('Indore', 'Madhya Pradesh'),
('Thane', 'Maharashtra'),
('Bhopal', 'Madhya Pradesh'),
('Visakhapatnam', 'Andhra Pradesh'),
('Pimpri-Chinchwad', 'Maharashtra'),
('Patna', 'Bihar'),
('Vadodara', 'Gujarat');
