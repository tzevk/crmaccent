import { executeQuery } from '../../../lib/db';

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
    console.error('Projects API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects - Get all projects with optional filtering
async function handleGet(req, res) {
  const { 
    status, 
    priority,
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  let query = `
    SELECT 
      p.*,
      CONCAT(u.first_name, ' ', u.last_name) as manager_name,
      c.name as client_name,
      c.name as company_name,
      (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id) as total_tasks,
      (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id AND pt.status = 'completed') as completed_tasks
    FROM projects p
    LEFT JOIN users u ON p.project_manager_id = u.id
    LEFT JOIN companies c ON p.client_id = c.id
    WHERE 1=1
  `;
  
  const params = [];

  // Add filters
  if (status && status !== 'all') {
    query += ' AND p.status = ?';
    params.push(status);
  }

  if (priority && priority !== 'all') {
    query += ' AND p.priority = ?';
    params.push(priority);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Add sorting
  const allowedSortFields = ['created_at', 'name', 'status', 'priority', 'start_date', 'end_date', 'budget'];
  const allowedSortOrders = ['ASC', 'DESC'];
  
  if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
    query += ` ORDER BY p.${sortBy} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY p.created_at DESC';
  }

  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const projects = await executeQuery(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM projects p
    LEFT JOIN companies c ON p.client_id = c.id
    WHERE 1=1
  `;
  
  const countParams = [];
  if (status && status !== 'all') {
    countQuery += ' AND p.status = ?';
    countParams.push(status);
  }
  if (priority && priority !== 'all') {
    countQuery += ' AND p.priority = ?';
    countParams.push(priority);
  }
  if (search) {
    countQuery += ' AND (p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)';
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern, searchPattern);
  }

  const countResult = await executeQuery(countQuery, countParams);
  const totalCount = countResult[0].total;

  return res.status(200).json({
    projects,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPreviousPage: parseInt(page) > 1
    }
  });
}

// POST /api/projects - Create a new project
async function handlePost(req, res) {
  const {
    name,
    description,
    client_id,
    lead_id,
    status = 'planning',
    priority = 'medium',
    start_date,
    end_date,
    estimated_hours = 0,
    budget = 0,
    project_manager_id,
    team_members,
    tags,
    notes,
    created_by,
    project_number // Optional - will be generated if not provided
  } = req.body;
  
  // Generate a unique project number if not provided
  const generatedProjectNumber = project_number || `PROJ-${Date.now().toString().slice(-6)}`;

  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const query = `
    INSERT INTO projects (
      project_number, name, description, client_id, lead_id, status, priority, start_date, end_date,
      estimated_hours, budget, project_manager_id, team_members, tags, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    generatedProjectNumber,
    name, 
    description || null, 
    client_id || null,
    lead_id || null,
    status, 
    priority, 
    start_date || null,
    end_date || null,
    estimated_hours, 
    budget,
    project_manager_id || null,
    team_members ? JSON.stringify(team_members) : null,
    tags || null, 
    notes || null, 
    created_by || null
  ];

  const result = await executeQuery(query, params);

  // Log activity
  if (result.insertId) {
    await executeQuery(
      'INSERT INTO project_activities (project_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'milestone', 'Project created', `Project "${name}" was created`, created_by || null]
    );
  }

  return res.status(201).json({
    message: 'Project created successfully',
    projectId: result.insertId
  });
}

// PUT /api/projects - Update a project
async function handlePut(req, res) {
  const { id, updated_by, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  // Handle team_members JSON conversion
  if (updateData.team_members && Array.isArray(updateData.team_members)) {
    updateData.team_members = JSON.stringify(updateData.team_members);
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE projects SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  // Log activity
  if (updateData.status) {
    await executeQuery(
      'INSERT INTO project_activities (project_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, 'status_change', 'Project status updated', `Project status changed to ${updateData.status}`, updated_by]
    );
  } else {
    await executeQuery(
      'INSERT INTO project_activities (project_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [id, 'comment', 'Project updated', `Project information was updated`, updated_by]
    );
  }

  return res.status(200).json({
    message: 'Project updated successfully'
  });
}

// DELETE /api/projects - Delete a project
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.status(200).json({
    message: 'Project deleted successfully'
  });
}
