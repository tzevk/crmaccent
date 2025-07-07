import { executeQuery } from '../../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '../../../../utils/authUtils';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Activities API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/activities - Get all activities
async function handleGet(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { search, type } = req.query;
  
  let query = `
    SELECT 
      id,
      activity_name,
      activity_type,
      description,
      is_active,
      created_at,
      updated_at
    FROM activities
  `;
  
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push('(activity_name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (type) {
    conditions.push('activity_type = ?');
    params.push(type);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY activity_name ASC';
  
  const activities = await executeQuery(query, params);
  
  return res.status(200).json({
    success: true,
    activities,
    count: activities.length
  });
}

// POST /api/activities - Create a new activity
async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    activity_name,
    activity_type = 'general',
    description,
    is_active = true
  } = req.body;

  // Validation
  if (!activity_name) {
    return res.status(400).json({ message: 'Activity name is required' });
  }

  // Check if activity already exists
  const existingActivity = await executeQuery(
    'SELECT id FROM activities WHERE activity_name = ?',
    [activity_name]
  );

  if (existingActivity.length > 0) {
    return res.status(400).json({ message: 'Activity already exists' });
  }

  const query = `
    INSERT INTO activities (
      activity_name, activity_type, description, is_active
    ) VALUES (?, ?, ?, ?)
  `;

  const params = [
    activity_name,
    activity_type,
    description || null,
    is_active
  ];

  const result = await executeQuery(query, params);

  return res.status(201).json({
    success: true,
    message: 'Activity created successfully',
    activityId: result.insertId
  });
}

// PUT /api/activities - Update an activity
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Activity ID is required' });
  }

  // Check if activity exists
  const existingActivity = await executeQuery('SELECT * FROM activities WHERE id = ?', [id]);
  if (existingActivity.length === 0) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Check for duplicate activity name if updating name
  if (updateData.activity_name) {
    const duplicateCheck = await executeQuery(
      'SELECT id FROM activities WHERE activity_name = ? AND id != ?',
      [updateData.activity_name, id]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({ message: 'Activity name already exists' });
    }
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE activities SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Activity updated successfully'
  });
}

// DELETE /api/activities - Delete an activity
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.body; // Changed from req.query to req.body

  if (!id) {
    return res.status(400).json({ message: 'Activity ID is required' });
  }

  // Check if activity is being used
  const usageCheck = await executeQuery(
    'SELECT COUNT(*) as count FROM project_activities WHERE activity_type = (SELECT activity_name FROM activities WHERE id = ?)',
    [id]
  );

  if (usageCheck[0].count > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete activity as it is being used in project activities' 
    });
  }

  const result = await executeQuery('DELETE FROM activities WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Activity not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Activity deleted successfully'
  });
}
