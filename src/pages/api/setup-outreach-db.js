import { getDbConnection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDbConnection();

    // Create outreach table
    await db.query(`
      CREATE TABLE IF NOT EXISTS outreach (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('email', 'call', 'meeting', 'follow-up', 'proposal') NOT NULL,
        subject VARCHAR(255) NOT NULL,
        target_type ENUM('lead', 'company') NOT NULL,
        lead_id INT NULL,
        company_id INT NULL,
        assigned_to INT NULL,
        scheduled_date DATETIME NULL,
        completed_date DATETIME NULL,
        status ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        notes TEXT NULL,
        outcome TEXT NULL,
        next_action TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_outreach_type (type),
        INDEX idx_outreach_status (status),
        INDEX idx_outreach_lead (lead_id),
        INDEX idx_outreach_company (company_id),
        INDEX idx_outreach_scheduled (scheduled_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Insert some sample outreach data
    await db.query(`
      INSERT IGNORE INTO outreach (type, subject, target_type, lead_id, company_id, assigned_to, scheduled_date, status, priority, notes) VALUES
      ('email', 'Initial consultation follow-up', 'lead', 1, NULL, 1, '2025-07-10 10:00:00', 'scheduled', 'high', 'Follow up on initial consultation meeting'),
      ('call', 'Project proposal discussion', 'lead', 2, NULL, 1, '2025-07-08 14:30:00', 'completed', 'medium', 'Discussed project requirements and timeline'),
      ('meeting', 'Contract negotiation', 'company', NULL, 825, 1, '2025-07-12 15:00:00', 'scheduled', 'high', 'Review and finalize contract terms'),
      ('email', 'Quarterly check-in', 'company', NULL, 827, 1, '2025-07-15 09:00:00', 'scheduled', 'low', 'Routine quarterly business review'),
      ('follow-up', 'Proposal status update', 'lead', 3, NULL, 1, '2025-07-09 11:00:00', 'in_progress', 'medium', 'Check on proposal review status')
    `);

    res.status(200).json({ 
      message: 'Outreach table created successfully and sample data inserted' 
    });
  } catch (error) {
    console.error('Error setting up outreach table:', error);
    res.status(500).json({ 
      message: 'Error setting up outreach table',
      error: error.message 
    });
  }
}
