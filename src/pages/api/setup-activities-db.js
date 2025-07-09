import { getDbConnection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDbConnection();

    // Create activities table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        type ENUM('call', 'email', 'meeting', 'task', 'follow-up', 'proposal', 'demo', 'other') NOT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        due_date DATETIME NULL,
        completed_date DATETIME NULL,
        assigned_to INT NULL,
        lead_id INT NULL,
        project_id INT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_activities_type (type),
        INDEX idx_activities_status (status),
        INDEX idx_activities_assigned (assigned_to),
        INDEX idx_activities_due_date (due_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert some sample activities
    await db.query(`
      INSERT IGNORE INTO activities (title, description, type, status, priority, due_date, assigned_to, lead_id, notes) VALUES
      ('Follow up on lead consultation', 'Call the client to discuss project requirements', 'call', 'pending', 'high', '2025-07-11 10:00:00', 1, 1, 'Initial consultation follow-up'),
      ('Send proposal document', 'Email the detailed project proposal', 'email', 'pending', 'medium', '2025-07-12 09:00:00', 1, 2, 'Custom proposal for mobile app'),
      ('Schedule project kickoff meeting', 'Arrange meeting with client and team', 'meeting', 'pending', 'high', '2025-07-15 14:00:00', 1, NULL, 'Project initiation meeting'),
      ('Complete project documentation', 'Finalize technical specifications', 'task', 'in_progress', 'medium', '2025-07-14 17:00:00', 1, NULL, 'Technical docs for CRM project'),
      ('Demo presentation preparation', 'Prepare demo for client presentation', 'demo', 'pending', 'high', '2025-07-16 11:00:00', 1, 3, 'Product demo for new client')
    `);

    res.status(200).json({ 
      message: 'Activities table created successfully and sample data inserted'
    });
  } catch (error) {
    console.error('Setup activities table error:', error);
    res.status(500).json({ 
      message: 'Error setting up activities table',
      error: error.message 
    });
  }
}
