import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up leads database tables...');
    
    // Create leads table
    const createLeadsTable = `
      CREATE TABLE IF NOT EXISTS leads (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          company VARCHAR(100),
          email VARCHAR(100),
          phone VARCHAR(20),
          status ENUM('hot', 'warm', 'cold', 'qualified', 'converted', 'lost') DEFAULT 'cold',
          source ENUM('website', 'referral', 'cold_call', 'social_media', 'email_campaign', 'trade_show', 'other') DEFAULT 'other',
          value DECIMAL(15,2) DEFAULT 0.00,
          assigned_to VARCHAR(100),
          description TEXT,
          address TEXT,
          city VARCHAR(50),
          state VARCHAR(50),
          postal_code VARCHAR(20),
          country VARCHAR(50) DEFAULT 'India',
          industry VARCHAR(100),
          website VARCHAR(255),
          lead_score INT DEFAULT 0,
          last_contact TIMESTAMP NULL,
          next_follow_up TIMESTAMP NULL,
          notes TEXT,
          tags VARCHAR(500),
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `;

    await executeQuery(createLeadsTable);
    console.log('Leads table created successfully');

    // Create lead_activities table for tracking interactions
    const createLeadActivitiesTable = `
      CREATE TABLE IF NOT EXISTS lead_activities (
          id INT AUTO_INCREMENT PRIMARY KEY,
          lead_id INT NOT NULL,
          activity_type ENUM('call', 'email', 'meeting', 'note', 'status_change', 'task') NOT NULL,
          subject VARCHAR(200),
          description TEXT,
          activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `;

    await executeQuery(createLeadActivitiesTable);
    console.log('Lead activities table created successfully');

    // Create lead_sources table for managing custom sources
    const createLeadSourcesTable = `
      CREATE TABLE IF NOT EXISTS lead_sources (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await executeQuery(createLeadSourcesTable);
    console.log('Lead sources table created successfully');

    // Insert default lead sources
    const insertDefaultSources = `
      INSERT IGNORE INTO lead_sources (name, description) VALUES 
      ('Website', 'Leads from company website contact forms'),
      ('Referral', 'Leads from existing customer referrals'),
      ('Cold Call', 'Leads from cold calling campaigns'),
      ('Social Media', 'Leads from social media platforms'),
      ('Email Campaign', 'Leads from email marketing campaigns'),
      ('Trade Show', 'Leads from trade shows and events'),
      ('Google Ads', 'Leads from Google advertising'),
      ('LinkedIn', 'Leads from LinkedIn outreach'),
      ('Other', 'Miscellaneous lead sources')
    `;

    await executeQuery(insertDefaultSources);
    console.log('Default lead sources inserted successfully');

    // Check what was created
    const tables = await executeQuery("SHOW TABLES LIKE '%lead%'");
    const leadCount = await executeQuery('SELECT COUNT(*) as count FROM leads');
    const sourceCount = await executeQuery('SELECT COUNT(*) as count FROM lead_sources');

    return res.status(200).json({
      message: 'Leads database setup completed successfully',
      tables: tables,
      leadCount: leadCount[0].count,
      sourceCount: sourceCount[0].count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leads database setup error:', error);
    return res.status(500).json({
      message: 'Leads database setup failed',
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
}
