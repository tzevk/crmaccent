-- Proposal Templates Schema
-- This creates tables for managing proposal templates and their sections

CREATE TABLE IF NOT EXISTS proposal_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    default_currency VARCHAR(10) DEFAULT 'INR',
    is_active BOOLEAN DEFAULT 1,
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS proposal_template_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    section_order INT NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES proposal_templates(id) ON DELETE CASCADE,
    INDEX idx_template_id (template_id),
    INDEX idx_section_order (section_order)
);

-- Insert default templates
INSERT INTO proposal_templates (name, category, description, default_currency, is_active, created_by) VALUES
('Software Development Proposal', 'Software Development', 'Comprehensive template for software development projects including web apps, mobile apps, and custom solutions.', 'INR', 1, 'System'),
('Marketing Campaign Proposal', 'Marketing', 'Template for digital marketing campaigns, brand strategies, and promotional activities.', 'INR', 1, 'System'),
('Consulting Services Proposal', 'Consulting', 'Professional template for consulting services, business analysis, and strategic advisory.', 'INR', 1, 'System');

-- Insert sections for Software Development Proposal (template_id: 1)
INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required) VALUES
(1, 'Executive Summary', 'Overview of the software solution and its business benefits.', 1, 1),
(1, 'Technical Requirements', 'Detailed technical specifications and requirements.', 2, 1),
(1, 'Development Approach', 'Methodology, technologies, and development process.', 3, 1),
(1, 'Timeline & Milestones', 'Project timeline with key deliverables and milestones.', 4, 1),
(1, 'Investment & Payment Terms', 'Cost breakdown and payment schedule.', 5, 1),
(1, 'Support & Maintenance', 'Post-delivery support and maintenance terms.', 6, 0);

-- Insert sections for Marketing Campaign Proposal (template_id: 2)
INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required) VALUES
(2, 'Campaign Overview', 'Goals, target audience, and campaign objectives.', 1, 1),
(2, 'Strategy & Approach', 'Marketing strategy and tactical approach.', 2, 1),
(2, 'Channel Mix', 'Digital channels and media mix recommendations.', 3, 1),
(2, 'Creative Concepts', 'Creative direction and content strategy.', 4, 0),
(2, 'Timeline & Deliverables', 'Campaign timeline and key deliverables.', 5, 1),
(2, 'Investment & ROI', 'Budget breakdown and expected ROI.', 6, 1);

-- Insert sections for Consulting Services Proposal (template_id: 3)
INSERT INTO proposal_template_sections (template_id, title, content, section_order, is_required) VALUES
(3, 'Executive Summary', 'Brief overview of consulting engagement and outcomes.', 1, 1),
(3, 'Current Situation Analysis', 'Assessment of current state and challenges.', 2, 1),
(3, 'Proposed Solution', 'Recommended approach and methodology.', 3, 1),
(3, 'Implementation Plan', 'Detailed implementation roadmap.', 4, 1),
(3, 'Team & Expertise', 'Consultant profiles and relevant experience.', 5, 0),
(3, 'Investment & Terms', 'Engagement fees and terms of service.', 6, 1);
