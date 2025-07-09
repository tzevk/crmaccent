import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up updated leads database schema...');

    // Disable foreign key checks temporarily
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop existing related tables first
    await executeQuery('DROP TABLE IF EXISTS lead_activities');
    await executeQuery('DROP TABLE IF EXISTS leads');
    console.log('Existing tables dropped');

    // Re-enable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    // Create updated leads table matching your JSON structure
    const createLeadsTable = `
      CREATE TABLE leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        sr_no INT,
        enquiry_no VARCHAR(50),
        year INT,
        company_name VARCHAR(255),
        type ENUM('New', 'Existing', 'Renewal') DEFAULT 'New',
        city VARCHAR(255),
        enquiry_date DATETIME,
        enquiry_type ENUM('Email', 'Phone', 'Website', 'Referral', 'Social Media', 'Other') DEFAULT 'Email',
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        project_description TEXT,
        enquiry_status ENUM('New', 'Working', 'Quoted', 'Won', 'Lost', 'Follow-up') DEFAULT 'New',
        project_status ENUM('Open', 'Active', 'On Hold', 'Closed', 'Cancelled') DEFAULT 'Open',
        followup1_date DATETIME,
        followup1_description TEXT,
        followup2_date DATETIME,
        followup2_description TEXT,
        followup3_date DATETIME,
        followup3_description TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_enquiry_no (enquiry_no),
        INDEX idx_company_name (company_name),
        INDEX idx_enquiry_status (enquiry_status),
        INDEX idx_project_status (project_status),
        INDEX idx_enquiry_date (enquiry_date),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await executeQuery(createLeadsTable);
    console.log('Leads table created successfully');

    // Insert sample data based on your JSON example
    const sampleLead = `
      INSERT INTO leads (
        sr_no, enquiry_no, year, company_name, type, city, 
        enquiry_date, enquiry_type, contact_name, contact_email, 
        project_description, enquiry_status, project_status, 
        followup1_date, followup1_description, created_by
      ) VALUES (
        14, '23115', 2024, 'Preipolar Engineering Pvt. Ltd', 'New', 
        'Kanchipuram, Tamil Nadu', '2024-03-05 00:00:00', 'Email', 
        'Saravanan', 'saravanan@preipolar.com', 
        'Smart P&ID and Instrumentation', 'Working', 'Closed', 
        '2024-05-03 00:00:00', 'Ganesh shared this inquiry for RFQ to Sepadutech', 1
      )
    `;

    await executeQuery(sampleLead);
    console.log('Sample lead data inserted');

    // Create lead_activities table for tracking activities
    const createActivitiesTable = `
      CREATE TABLE IF NOT EXISTS lead_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        lead_id INT NOT NULL,
        activity_type ENUM('Call', 'Email', 'Meeting', 'Follow-up', 'Quote', 'Proposal', 'Other') DEFAULT 'Other',
        description TEXT,
        activity_date DATETIME,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await executeQuery(createActivitiesTable);
    console.log('Lead activities table created successfully');

    // Get final counts
    const [leadsCount] = await executeQuery('SELECT COUNT(*) as count FROM leads');
    const [activitiesCount] = await executeQuery('SELECT COUNT(*) as count FROM lead_activities');
    
    res.status(200).json({
      message: 'Updated leads database setup completed',
      leadsCount: leadsCount.count,
      activitiesCount: activitiesCount.count,
      tables: ['leads', 'lead_activities'],
      sampleData: 'Sample lead from JSON structure inserted'
    });

  } catch (error) {
    console.error('Database setup error:', error);
    res.status(500).json({ 
      message: 'Database setup failed', 
      error: error.message 
    });
  }
}
