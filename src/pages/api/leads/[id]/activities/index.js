import { executeQuery } from '../../../../../../lib/db';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query; // Lead ID

  if (!id) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'POST':
        return await handlePost(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Lead Activities API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/leads/[id]/activities - Get all activities for a lead
async function handleGet(req, res, leadId) {
  try {
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'lead_activities'
    `;
    
    const tableCheck = await executeQuery(checkTableQuery);
    
    if (tableCheck[0].table_exists === 0) {
      return res.status(200).json({ 
        activities: [],
        message: 'Lead activities table does not exist yet'
      });
    }
    
    const query = `
      SELECT 
        la.*,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM lead_activities la
      LEFT JOIN users u ON la.created_by = u.id
      WHERE la.lead_id = ?
      ORDER BY la.activity_date DESC
    `;

    const activities = await executeQuery(query, [leadId]);
    
    return res.status(200).json({
      activities
    });
  } catch (error) {
    console.error('Error fetching lead activities:', error);
    // Return empty array instead of error to not break the UI
    return res.status(200).json({ activities: [] });
  }
}

// POST /api/leads/[id]/activities - Add a new activity to a lead
async function handlePost(req, res, leadId) {
  try {
    // First check if the lead exists
    const leadCheck = await executeQuery('SELECT id FROM leads WHERE id = ?', [leadId]);
    
    if (leadCheck.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Check if the lead_activities table exists, create if not
    const checkTableQuery = `
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'lead_activities'
    `;
    
    const tableCheck = await executeQuery(checkTableQuery);
    
    if (tableCheck[0].table_exists === 0) {
      // Table doesn't exist, create it first
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
        )
      `;
      
      await executeQuery(createTableQuery);
      console.log('Lead Activities table created');
    }
    
    const { 
      activity_type, 
      subject, 
      description, 
      activity_date = new Date(), 
      created_by
    } = req.body;
    
    // Validation
    if (!activity_type || !subject) {
      return res.status(400).json({ message: 'Activity type and subject are required' });
    }
    
    const query = `
      INSERT INTO lead_activities (
        lead_id, activity_type, subject, description, activity_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      leadId,
      activity_type,
      subject,
      description || null,
      activity_date,
      created_by || null
    ];
    
    const result = await executeQuery(query, params);
    
    return res.status(201).json({
      message: 'Activity added successfully',
      activityId: result.insertId
    });
  } catch (error) {
    console.error('Error adding lead activity:', error);
    return res.status(500).json({ message: 'Failed to add activity', error: error.message });
  }
}
