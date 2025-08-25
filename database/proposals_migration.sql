-- Add lead_id column to proposals table to track lead conversion
ALTER TABLE proposals 
ADD COLUMN lead_id INT NULL,
ADD COLUMN title VARCHAR(500) NULL AFTER id,
ADD COLUMN client_email VARCHAR(255) NULL AFTER email,
ADD COLUMN client_phone VARCHAR(20) NULL AFTER client_email,
ADD COLUMN client_company VARCHAR(255) NULL AFTER client_phone,
ADD COLUMN project_description TEXT NULL AFTER project_name,
ADD COLUMN budget_range VARCHAR(100) NULL AFTER estimated_value,
ADD COLUMN timeline VARCHAR(100) NULL AFTER estimated_duration,
ADD COLUMN status VARCHAR(50) DEFAULT 'draft' AFTER current_status,
ADD COLUMN priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' AFTER status,
ADD COLUMN lead_source VARCHAR(100) NULL AFTER priority,
ADD COLUMN assigned_to VARCHAR(100) NULL AFTER lead_source,
ADD COLUMN notes TEXT NULL AFTER internal_notes;

-- Add index for lead_id
ALTER TABLE proposals ADD INDEX idx_lead_id (lead_id);

-- Add foreign key constraint if leads table exists
-- ALTER TABLE proposals ADD CONSTRAINT fk_proposal_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;

-- Update existing proposals to have the new status field match current_status
UPDATE proposals SET status = 
  CASE 
    WHEN current_status = 'Draft' THEN 'draft'
    WHEN current_status = 'Submitted' THEN 'submitted'
    WHEN current_status = 'Under Discussion' THEN 'in_discussion'
    WHEN current_status = 'Awaiting Response' THEN 'awaiting_response'
    WHEN current_status = 'Awarded' THEN 'awarded'
    WHEN current_status = 'Lost' THEN 'lost'
    WHEN current_status = 'Closed' THEN 'closed'
    ELSE 'draft'
  END
WHERE status IS NULL;

-- Create activities table if it doesn't exist for tracking conversions
CREATE TABLE IF NOT EXISTS activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_type ENUM('lead', 'proposal', 'project', 'employee', 'company') NOT NULL,
  related_id INT NOT NULL,
  assigned_to VARCHAR(100),
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  due_date DATE NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_type (type),
  INDEX idx_related (related_type, related_id),
  INDEX idx_assigned_to (assigned_to),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
