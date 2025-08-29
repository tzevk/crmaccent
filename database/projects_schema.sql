-- Projects table schema
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_number VARCHAR(50) UNIQUE NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  received_date DATE,
  project_type ENUM('Proposal', 'Project') DEFAULT 'Project',
  project_cost DECIMAL(15, 2),
  currency VARCHAR(10) DEFAULT 'INR',
  start_date DATE,
  end_date DATE,
  duration VARCHAR(50), -- e.g., "30 days", "6 months"
  manhours INT,
  project_head VARCHAR(255),
  project_manager VARCHAR(255),
  lead VARCHAR(255),
  area_engineer VARCHAR(255),
  project_team TEXT, -- JSON array of team members
  status ENUM('Ongoing', 'Hold', 'Proposal', 'Closed', 'Cancelled', 'Regret') DEFAULT 'Ongoing',
  proposal_id INT, -- Link to proposals table if converted from proposal
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_number (project_number),
  INDEX idx_client_name (client_name),
  INDEX idx_status (status),
  INDEX idx_project_type (project_type),
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL
);

-- Sample data insertion
INSERT INTO projects (
  project_number, project_name, client_name, city, received_date, 
  project_type, project_cost, start_date, end_date, duration, manhours,
  project_head, project_manager, lead, area_engineer, project_team, status
) VALUES 
(
  'PRJ_001_2025', 'Office Building Construction', 'ABC Corp', 'Mumbai', '2025-01-15',
  'Project', 5000000.00, '2025-02-01', '2025-08-01', '6 months', 2400,
  'John Smith', 'Sarah Johnson', 'Mike Wilson', 'David Brown', 
  '["John Smith", "Sarah Johnson", "Mike Wilson", "David Brown", "Emma Davis"]', 'Ongoing'
),
(
  'PRJ_002_2025', 'Residential Complex', 'XYZ Developers', 'Delhi', '2025-01-20',
  'Project', 12000000.00, '2025-03-01', '2025-12-01', '10 months', 4000,
  'Alice Cooper', 'Bob Martin', 'Carol White', 'Dan Green',
  '["Alice Cooper", "Bob Martin", "Carol White", "Dan Green", "Frank Blue"]', 'Ongoing'
),
(
  'PRJ_003_2025', 'Shopping Mall Renovation', 'Retail Group Ltd', 'Bangalore', '2025-02-01',
  'Proposal', 8000000.00, NULL, NULL, '8 months', 3200,
  'Tom Anderson', 'Lisa Parker', 'Ryan Clark', 'Amy Taylor',
  '["Tom Anderson", "Lisa Parker", "Ryan Clark", "Amy Taylor"]', 'Proposal'
);
