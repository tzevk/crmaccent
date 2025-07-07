import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/leads/activities - Get activities with optional lead_id filter
async function handleGet(req, res) {
  const { lead_id, limit = 50 } = req.query;

  let query = `
    SELECT 
      la.*,
      l.name as lead_name,
      l.company as lead_company,
      u.first_name as created_by_name,
      u.last_name as created_by_lastname
    FROM lead_activities la
    LEFT JOIN leads l ON la.lead_id = l.id
    LEFT JOIN users u ON la.created_by = u.id
  `;

  const params = [];

  if (lead_id) {
    query += ' WHERE la.lead_id = ?';
    params.push(lead_id);
  }

  query += ' ORDER BY la.activity_date DESC LIMIT ?';
  params.push(parseInt(limit));

  const activities = await executeQuery(query, params);

  return res.status(200).json({
    activities
  });
}

// POST /api/leads/activities - Create a new activity
async function handlePost(req, res) {
  const {
    lead_id,
    activity_type,
    subject,
    description,
    activity_date,
    created_by
  } = req.body;

  // Validation
  if (!lead_id || !activity_type) {
    return res.status(400).json({ 
      message: 'Lead ID and activity type are required' 
    });
  }

  // Verify lead exists
  const leadExists = await executeQuery(
    'SELECT id FROM leads WHERE id = ?', 
    [lead_id]
  );

  if (leadExists.length === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  const query = `
    INSERT INTO lead_activities (
      lead_id, activity_type, subject, description, activity_date, created_by
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  const params = [
    lead_id,
    activity_type,
    subject,
    description,
    activity_date || new Date(),
    created_by
  ];

  const result = await executeQuery(query, params);

  // Update last_contact timestamp on the lead if this is a contact activity
  const contactActivities = ['call', 'email', 'meeting'];
  if (contactActivities.includes(activity_type)) {
    await executeQuery(
      'UPDATE leads SET last_contact = ? WHERE id = ?',
      [activity_date || new Date(), lead_id]
    );
  }

  return res.status(201).json({
    message: 'Activity created successfully',
    activityId: result.insertId
  });
}
