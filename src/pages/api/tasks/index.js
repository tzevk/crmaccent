import { executeQuery } from '../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '../../../utils/authUtils';
import { logUserActivity } from '../../../utils/logUtils';

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
    console.error('Tasks API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/tasks - Get tasks with filtering and pagination
async function handleGet(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { 
    project_id,
    lead_id,
    status,
    priority,
    assigned_to,
    created_by,
    due_date_from,
    due_date_to,
    search,
    page = 1,
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    my_tasks_only = false
  } = req.query;

  let query = `
    SELECT 
      t.*,
      p.name as project_name,
      l.name as lead_name,
      l.company as lead_company,
      u_assigned.first_name as assigned_to_name,
      u_assigned.last_name as assigned_to_lastname,
      u_created.first_name as created_by_name,
      u_created.last_name as created_by_lastname,
      CASE 
        WHEN t.due_date < NOW() AND t.status != 'completed' THEN 'overdue'
        WHEN t.due_date <= DATE_ADD(NOW(), INTERVAL 1 DAY) AND t.status != 'completed' THEN 'due_soon'
        ELSE 'normal'
      END as urgency_status
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN leads l ON t.lead_id = l.id
    LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
    LEFT JOIN users u_created ON t.created_by = u_created.id
  `;

  const conditions = [];
  const params = [];

  // Apply filters
  if (project_id) {
    conditions.push('t.project_id = ?');
    params.push(project_id);
  }

  if (lead_id) {
    conditions.push('t.lead_id = ?');
    params.push(lead_id);
  }

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }

  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }

  if (assigned_to) {
    conditions.push('t.assigned_to = ?');
    params.push(assigned_to);
  }

  if (created_by) {
    conditions.push('t.created_by = ?');
    params.push(created_by);
  }

  if (my_tasks_only === 'true') {
    conditions.push('t.assigned_to = ?');
    params.push(user.id);
  }

  if (due_date_from) {
    conditions.push('t.due_date >= ?');
    params.push(due_date_from);
  }

  if (due_date_to) {
    conditions.push('t.due_date <= ?');
    params.push(due_date_to);
  }

  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Add sorting
  const validSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
  const sortColumn = validSortColumns.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
  const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  
  query += ` ORDER BY ${sortColumn} ${order}`;

  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

  const tasks = await executeQuery(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total 
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN leads l ON t.lead_id = l.id
  `;
  
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }

  const countResult = await executeQuery(countQuery, params);
  const total = countResult[0]?.total || 0;

  return res.status(200).json({
    success: true,
    tasks,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit))
    }
  });
}

// POST /api/tasks - Create a new task
async function handlePost(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    title,
    description,
    project_id,
    lead_id,
    assigned_to,
    priority = 'medium',
    status = 'pending',
    due_date,
    estimated_hours,
    tags
  } = req.body;

  // Validation
  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  // Verify referenced entities exist
  if (project_id) {
    const projectExists = await executeQuery('SELECT id FROM projects WHERE id = ?', [project_id]);
    if (projectExists.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
  }

  if (lead_id) {
    const leadExists = await executeQuery('SELECT id FROM leads WHERE id = ?', [lead_id]);
    if (leadExists.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }
  }

  if (assigned_to) {
    const userExists = await executeQuery('SELECT id FROM users WHERE id = ?', [assigned_to]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }
  }

  const query = `
    INSERT INTO tasks (
      title, description, project_id, lead_id, assigned_to, 
      created_by, priority, status, due_date, estimated_hours, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    title,
    description || null,
    project_id || null,
    lead_id || null,
    assigned_to || null,
    user.id,
    priority,
    status,
    due_date || null,
    estimated_hours || null,
    tags ? JSON.stringify(tags) : null
  ];

  const result = await executeQuery(query, params);

  // Log the activity
  await logUserActivity(
    user.id,
    'task_created',
    'Task Management',
    `Created task: ${title}`,
    { taskId: result.insertId, title }
  );

  return res.status(201).json({
    success: true,
    message: 'Task created successfully',
    taskId: result.insertId
  });
}

// PUT /api/tasks - Update a task
async function handlePut(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  // Check if task exists
  const existingTask = await executeQuery('SELECT * FROM tasks WHERE id = ?', [id]);
  if (existingTask.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Build dynamic update query
  const allowedFields = ['title', 'description', 'project_id', 'lead_id', 'assigned_to', 'priority', 'status', 'due_date', 'estimated_hours', 'actual_hours', 'tags', 'completed_at'];
  const fields = Object.keys(updateData).filter(key => 
    allowedFields.includes(key) && updateData[key] !== undefined
  );

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update' });
  }

  // Handle status change to completed
  if (updateData.status === 'completed' && existingTask[0].status !== 'completed') {
    updateData.completed_at = new Date().toISOString();
  } else if (updateData.status !== 'completed') {
    updateData.completed_at = null;
  }

  // Process tags if provided
  if (updateData.tags && Array.isArray(updateData.tags)) {
    updateData.tags = JSON.stringify(updateData.tags);
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Log the activity
  await logUserActivity(
    user.id,
    'task_updated',
    'Task Management',
    `Updated task: ${existingTask[0].title}`,
    { taskId: id, updates: fields }
  );

  return res.status(200).json({
    success: true,
    message: 'Task updated successfully'
  });
}

// DELETE /api/tasks - Delete a task
async function handleDelete(req, res) {
  const { user, error } = await authenticateEndpoint(req, res);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  // Check if task exists
  const existingTask = await executeQuery('SELECT title FROM tasks WHERE id = ?', [id]);
  if (existingTask.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const result = await executeQuery('DELETE FROM tasks WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Log the activity
  await logUserActivity(
    user.id,
    'task_deleted',
    'Task Management',
    `Deleted task: ${existingTask[0].title}`,
    { taskId: id }
  );

  return res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
}
