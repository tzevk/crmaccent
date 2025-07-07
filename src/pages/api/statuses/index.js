import { executeQuery } from '../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '../../../utils/authUtils';

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
    console.error('Statuses API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/statuses - Get all statuses
async function handleGet(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { search, category } = req.query;
  
  let query = `
    SELECT 
      id,
      status_name,
      status_category,
      color_code,
      description,
      is_active,
      created_at,
      updated_at
    FROM statuses
  `;
  
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push('(status_name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (category) {
    conditions.push('status_category = ?');
    params.push(category);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY status_category ASC, status_name ASC';
  
  const statuses = await executeQuery(query, params);
  
  return res.status(200).json({
    success: true,
    statuses,
    count: statuses.length
  });
}

// POST /api/statuses - Create a new status
async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    status_name,
    status_category,
    color_code = '#6B7280',
    description,
    is_active = true
  } = req.body;

  // Validation
  if (!status_name || !status_category) {
    return res.status(400).json({ message: 'Status name and category are required' });
  }

  // Validate status category
  const validCategories = ['project', 'task', 'inquiry', 'general'];
  if (!validCategories.includes(status_category)) {
    return res.status(400).json({ 
      message: 'Invalid status category. Must be one of: project, task, inquiry, general' 
    });
  }

  // Check if status already exists in this category
  const existingStatus = await executeQuery(
    'SELECT id FROM statuses WHERE status_name = ? AND status_category = ?',
    [status_name, status_category]
  );

  if (existingStatus.length > 0) {
    return res.status(400).json({ message: 'Status already exists in this category' });
  }

  const query = `
    INSERT INTO statuses (
      status_name, status_category, color_code, description, is_active
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    status_name,
    status_category,
    color_code,
    description || null,
    is_active
  ];

  const result = await executeQuery(query, params);

  return res.status(201).json({
    success: true,
    message: 'Status created successfully',
    statusId: result.insertId
  });
}

// PUT /api/statuses - Update a status
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Status ID is required' });
  }

  // Check if status exists
  const existingStatus = await executeQuery('SELECT * FROM statuses WHERE id = ?', [id]);
  if (existingStatus.length === 0) {
    return res.status(404).json({ message: 'Status not found' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Validate status category if updating
  if (updateData.status_category) {
    const validCategories = ['project', 'task', 'inquiry', 'general'];
    if (!validCategories.includes(updateData.status_category)) {
      return res.status(400).json({ 
        message: 'Invalid status category. Must be one of: project, task, inquiry, general' 
      });
    }
  }

  // Check for duplicate status name if updating name or category
  if (updateData.status_name || updateData.status_category) {
    const name = updateData.status_name || existingStatus[0].status_name;
    const category = updateData.status_category || existingStatus[0].status_category;
    
    const duplicateCheck = await executeQuery(
      'SELECT id FROM statuses WHERE status_name = ? AND status_category = ? AND id != ?',
      [name, category, id]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({ message: 'Status already exists in this category' });
    }
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE statuses SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Status not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Status updated successfully'
  });
}

// DELETE /api/statuses - Delete a status
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_SYSTEM);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Status ID is required' });
  }

  // Get status details to check usage
  const statusDetails = await executeQuery('SELECT * FROM statuses WHERE id = ?', [id]);
  if (statusDetails.length === 0) {
    return res.status(404).json({ message: 'Status not found' });
  }

  const status = statusDetails[0];

  // Check if status is being used based on category
  let usageCount = 0;
  
  if (status.status_category === 'project') {
    const projectUsage = await executeQuery(
      'SELECT COUNT(*) as count FROM projects WHERE status = ?',
      [status.status_name]
    );
    usageCount = projectUsage[0].count;
  } else if (status.status_category === 'task') {
    const taskUsage = await executeQuery(
      'SELECT COUNT(*) as count FROM project_tasks WHERE status = ?',
      [status.status_name]
    );
    usageCount = taskUsage[0].count;
  }

  if (usageCount > 0) {
    return res.status(400).json({ 
      message: `Cannot delete status as it is being used by ${usageCount} ${status.status_category}(s)` 
    });
  }

  const result = await executeQuery('DELETE FROM statuses WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Status not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Status deleted successfully'
  });
}
