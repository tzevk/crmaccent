import { executeQuery } from '../../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS, getUserFromToken, hasPermission } from '../../../../utils/authUtils';
import { logUserActivity, logAuditTrail, LOG_ACTIONS, LOG_CATEGORIES, LOG_SEVERITY } from '../../../../utils/logUtils';

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
    if (error.message.includes('authentication') || error.message.includes('Session')) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects - Get projects with optional filtering
async function handleGet(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.PROJECT_VIEW);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { 
    status, 
    priority,
    client_id,
    search, 
    page = 1, 
    limit = 20,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  let query = `
    SELECT 
      p.*,
      creator.first_name as created_by_name,
      creator.last_name as created_by_lastname
    FROM projects p
    LEFT JOIN users creator ON p.created_by = creator.id
    WHERE 1=1
  `;

  const params = [];

  if (status && status !== 'all') {
    query += ' AND p.status = ?';
    params.push(status);
  }

  if (priority && priority !== 'all') {
    query += ' AND p.priority = ?';
    params.push(priority);
  }

  if (client_id) {
    query += ' AND p.client_id = ?';
    params.push(client_id);
  }

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
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
  if (client_id) {
    countQuery += ' AND p.client_id = ?';
    countParams.push(client_id);
  }
  if (search) {
    countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern);
  }

  const countResult = await executeQuery(countQuery, countParams);
  const totalCount = countResult[0].total;

  // Log project list view
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.PROJECT_VIEW,
    entityType: 'projects',
    entityId: null,
    description: `Viewed projects list (${projects.length} of ${totalCount} total)`,
    category: LOG_CATEGORIES.PROJECT,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { 
      count: projects.length, 
      totalCount, 
      filters: { status, priority, client_id, search },
      pagination: { page, limit }
    }
  });

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
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.PROJECT_CREATE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    name,
    description,
    client_id,
    status = 'planning',
    priority = 'medium',
    start_date,
    end_date,
    budget = 0,
    cost = 0,
    progress_percentage = 0
  } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Project name is required' });
  }

  const query = `
    INSERT INTO projects (
      name, description, client_id, status, priority, start_date, end_date,
      budget, cost, progress_percentage, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name,
    description || null,
    client_id || null,
    status,
    priority,
    start_date || null,
    end_date || null,
    budget,
    cost,
    progress_percentage,
    user.id
  ];

  const result = await executeQuery(query, params);

  // Log project creation
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.PROJECT_CREATE,
    entityType: 'project',
    entityId: result.insertId,
    description: `Created project: ${name}`,
    category: LOG_CATEGORIES.PROJECT,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { name, client_id, status, priority, budget, start_date, end_date }
  });

  await logAuditTrail({
    userId: user.id,
    action: 'PROJECT_CREATE',
    tableName: 'projects',
    recordId: result.insertId,
    operationType: 'CREATE',
    newValue: { name, description, client_id, status, priority, start_date, end_date, budget, cost, progress_percentage },
    req,
    riskLevel: 'low'
  });

  return res.status(201).json({
    message: 'Project created successfully',
    projectId: result.insertId
  });
}

// PUT /api/projects - Update a project
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.PROJECT_EDIT);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  // Check if project exists
  const existingProject = await executeQuery('SELECT * FROM projects WHERE id = ?', [id]);
  if (existingProject.length === 0) {
    return res.status(404).json({ message: 'Project not found' });
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

  // Log project update
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.PROJECT_UPDATE,
    entityType: 'project',
    entityId: parseInt(id),
    description: `Updated project (ID: ${id})`,
    category: LOG_CATEGORIES.PROJECT,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { updatedFields: fields, updateData }
  });

  await logAuditTrail({
    userId: user.id,
    action: 'PROJECT_UPDATE',
    tableName: 'projects',
    recordId: parseInt(id),
    operationType: 'UPDATE',
    oldValue: existingProject[0],
    newValue: updateData,
    req,
    riskLevel: 'low'
  });

  return res.status(200).json({
    message: 'Project updated successfully'
  });
}

// DELETE /api/projects - Delete a project
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.PROJECT_DELETE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }

  // Check if project has associated tasks
  const taskCount = await executeQuery(
    'SELECT COUNT(*) as count FROM project_tasks WHERE project_id = ?',
    [id]
  );

  if (taskCount[0].count > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete project with associated tasks. Delete tasks first.' 
    });
  }

  const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.status(200).json({
    message: 'Project deleted successfully'
  });
}
