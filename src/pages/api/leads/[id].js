import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
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

// GET /api/leads/[id] - Get a single lead with activities
async function handleGet(req, res, id) {
  // Get lead details
  const leadQuery = `
    SELECT 
      l.*,
      u.first_name as created_by_name,
      u.last_name as created_by_lastname
    FROM leads l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE l.id = ?
  `;

  const leadResult = await executeQuery(leadQuery, [id]);

  if (leadResult.length === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  const lead = leadResult[0];

  // Get lead activities
  const activitiesQuery = `
    SELECT 
      la.*,
      u.first_name as created_by_name,
      u.last_name as created_by_lastname
    FROM lead_activities la
    LEFT JOIN users u ON la.created_by = u.id
    WHERE la.lead_id = ?
    ORDER BY la.activity_date DESC
  `;

  const activities = await executeQuery(activitiesQuery, [id]);

  return res.status(200).json({
    lead,
    activities
  });
}

// PUT /api/leads/[id] - Update a specific lead
async function handlePut(req, res, id) {
  const { updated_by, ...updateData } = req.body;

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  // Log activity if status changed
  if (updateData.status) {
    await executeQuery(
      'INSERT INTO lead_activities (lead_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, 'status_change', 'Status updated', `Lead status changed to ${updateData.status}`, updated_by]
    );
  } else {
    // Log general update
    await executeQuery(
      'INSERT INTO lead_activities (lead_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, 'note', 'Lead updated', `Lead information was updated`, updated_by]
    );
  }

  return res.status(200).json({
    message: 'Lead updated successfully'
  });
}

// DELETE /api/leads/[id] - Delete a specific lead
async function handleDelete(req, res, id) {
  const result = await executeQuery('DELETE FROM leads WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  return res.status(200).json({
    message: 'Lead deleted successfully'
  });
}
