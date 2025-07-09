// API endpoint to set up lead_activities table

import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create lead_activities table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS lead_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        activity_type ENUM('call', 'email', 'meeting', 'note', 'status_change', 'milestone', 'other') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        activity_date DATETIME NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await executeQuery(createTableQuery);
    console.log('Lead Activities table created successfully');

    // Add some sample data if needed
    const insertSampleData = req.body?.insertSampleData === true;
    
    if (insertSampleData) {
      // Get some lead IDs
      const leadIdsResult = await executeQuery('SELECT id FROM leads LIMIT 5');
      if (leadIdsResult.length > 0) {
        for (const leadRow of leadIdsResult) {
          const leadId = leadRow.id;
          
          // Add a sample activity for each lead
          await executeQuery(
            `INSERT INTO lead_activities 
              (lead_id, activity_type, subject, description, activity_date, created_by) 
             VALUES 
              (?, ?, ?, ?, ?, ?)`,
            [
              leadId,
              'note',
              'Initial contact',
              'Made first contact with the lead via email.',
              new Date(),
              1 // Assuming user with ID 1 exists
            ]
          );
        }
        console.log('Sample lead activities inserted');
      }
    }

    return res.status(200).json({ 
      message: 'Lead activities table setup completed',
      sampleDataInserted: insertSampleData
    });
  } catch (error) {
    console.error('Error setting up lead_activities table:', error);
    return res.status(500).json({ 
      message: 'Failed to set up lead_activities table', 
      error: error.message 
    });
  }
}
