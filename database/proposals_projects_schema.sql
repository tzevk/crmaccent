-- Proposals Table
CREATE TABLE IF NOT EXISTS proposals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  proposal_id VARCHAR(50) NOT NULL UNIQUE,
  proposal_title VARCHAR(255) NOT NULL,
  proposal_date DATE NOT NULL,
  prepared_by VARCHAR(100),
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  designation VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  address TEXT,
  
  -- Project Details
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  scope_of_work TEXT NOT NULL,
  estimated_value DECIMAL(15, 2),
  estimated_duration VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'INR',
  
  -- Proposal Status & Tracking
  current_status ENUM('Draft', 'Submitted', 'Under Discussion', 'Awaiting Response', 'Awarded', 'Lost', 'Closed') DEFAULT 'Draft',
  submission_mode VARCHAR(50),
  follow_up_date DATE,
  expected_decision_date DATE,
  
  -- Internal Management
  proposal_owner VARCHAR(100),
  department VARCHAR(100),
  internal_notes TEXT,
  
  -- Project Conversion
  is_converted_to_project BOOLEAN DEFAULT FALSE,
  project_id VARCHAR(50),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_proposal_id (proposal_id),
  INDEX idx_client_name (client_name),
  INDEX idx_current_status (current_status),
  INDEX idx_proposal_date (proposal_date),
  INDEX idx_is_converted (is_converted_to_project)
);

-- Projects Table  
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  project_type VARCHAR(100),
  description TEXT,
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  client_address TEXT,
  
  -- Project Details
  estimated_value DECIMAL(15, 2),
  actual_value DECIMAL(15, 2),
  estimated_duration VARCHAR(100),
  actual_duration VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'INR',
  
  -- Project Status & Timeline
  project_status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  
  -- Team & Management
  project_owner VARCHAR(100),
  project_manager VARCHAR(100),
  department VARCHAR(100),
  team_members TEXT, -- JSON array of team member IDs
  
  -- Progress Tracking
  completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Financial
  budget_allocated DECIMAL(15, 2),
  budget_spent DECIMAL(15, 2) DEFAULT 0.00,
  
  -- References
  proposal_reference_id VARCHAR(50),
  created_from_proposal BOOLEAN DEFAULT FALSE,
  
  -- Notes
  project_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_project_id (project_id),
  INDEX idx_client_name (client_name),
  INDEX idx_project_status (project_status),
  INDEX idx_start_date (start_date),
  INDEX idx_proposal_reference (proposal_reference_id)
);

-- Project Tasks Table
CREATE TABLE IF NOT EXISTS project_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  task_status ENUM('Pending', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Pending',
  priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  assigned_to VARCHAR(100),
  start_date DATE,
  due_date DATE,
  completion_date DATE,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_task_status (task_status),
  INDEX idx_assigned_to (assigned_to)
);

-- Project Timeline/Milestones Table
CREATE TABLE IF NOT EXISTS project_milestones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  milestone_name VARCHAR(255) NOT NULL,
  milestone_description TEXT,
  milestone_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  milestone_type ENUM('Start', 'Checkpoint', 'Deliverable', 'Completion') DEFAULT 'Checkpoint',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_milestone_date (milestone_date)
);

-- Add foreign key constraint to proposals table
ALTER TABLE proposals 
ADD CONSTRAINT fk_proposals_project 
FOREIGN KEY (project_id) REFERENCES projects(project_id) 
ON DELETE SET NULL;
