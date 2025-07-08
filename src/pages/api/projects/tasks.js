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
    console.error('Tasks API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects/tasks - Get tasks with optional filtering
async function handleGet(req, res) {
  const { 
    project_id,
    status, 
    priority,
    assigned_to,
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  let query = `
    SELECT 
      pt.*,
      p.name as project_name,
      u.first_name as assigned_to_name,
      u.last_name as assigned_to_lastname,
      creator.first_name as created_by_name,
      creator.last_name as created_by_lastname
    FROM project_tasks pt
    LEFT JOIN projects p ON pt.project_id = p.id
    LEFT JOIN users u ON pt.assigned_to = u.id
    LEFT JOIN users creator ON pt.created_by = creator.id
    WHERE 1=1
  `;
  
  const params = [];

  // Add filters
  if (project_id) {
    query += ' AND pt.project_id = ?';
    params.push(project_id);
  }

  if (status && status !== 'all') {
    query += ' AND pt.status = ?';
    params.push(status);
  }

  if (priority && priority !== 'all') {
    query += ' AND pt.priority = ?';
    params.push(priority);
  }

  if (assigned_to) {
    query += ' AND pt.assigned_to = ?';
    params.push(assigned_to);
  }

  if (search) {
    query += ' AND (pt.title LIKE ? OR pt.description LIKE ? OR p.name LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Add sorting
  const allowedSortFields = ['created_at', 'title', 'status', 'priority', 'due_date', 'estimated_hours'];
  const allowedSortOrders = ['ASC', 'DESC'];
  
  if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
    query += ` ORDER BY pt.${sortBy} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY pt.created_at DESC';
  }

  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const tasks = await executeQuery(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM project_tasks pt
    LEFT JOIN projects p ON pt.project_id = p.id
    WHERE 1=1
  `;
  
  const countParams = [];
  if (project_id) {
    countQuery += ' AND pt.project_id = ?';
    countParams.push(project_id);
  }
  if (status && status !== 'all') {
    countQuery += ' AND pt.status = ?';
    countParams.push(status);
  }
  if (priority && priority !== 'all') {
    countQuery += ' AND pt.priority = ?';
    countParams.push(priority);
  }
  if (assigned_to) {
    countQuery += ' AND pt.assigned_to = ?';
    countParams.push(assigned_to);
  }
  if (search) {
    countQuery += ' AND (pt.title LIKE ? OR pt.description LIKE ? OR p.name LIKE ?)';
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern, searchPattern);
  }

  const countResult = await executeQuery(countQuery, countParams);
  const totalCount = countResult[0].total;

  return res.status(200).json({
    tasks,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPreviousPage: parseInt(page) > 1
    }
  });
}

// POST /api/projects/tasks - Create a new task
async function handlePost(req, res) {
  const {
    project_id,
    title,
    description,
    status = 'todo',
    priority = 'medium',
    assigned_to,
    estimated_hours = 0,
    start_date,
    due_date,
    parent_task_id,
    order_index = 0,
    tags,
    created_by
  } = req.body;

  // Validation
  if (!project_id) {
    return res.status(400).json({ message: 'Project ID is required' });
  }
  if (!title) {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const query = `
    INSERT INTO project_tasks (
      project_id, title, description, status, priority, assigned_to, estimated_hours,
      start_date, due_date, parent_task_id, order_index, tags, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    project_id,
    title, 
    description || null, 
    status, 
    priority, 
    assigned_to || null,
    estimated_hours,
    start_date || null,
    due_date || null,
    parent_task_id || null,
    order_index,
    tags || null, 
    created_by || null
  ];

  const result = await executeQuery(query, params);

  // Log activity
  if (result.insertId) {
    await executeQuery(
      'INSERT INTO project_activities (project_id, task_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [project_id, result.insertId, 'task_created', 'Task created', `Task "${title}" was created`, created_by || null]
    );
  }

  return res.status(201).json({
    message: 'Task created successfully',
    taskId: result.insertId
  });
}

// PUT /api/projects/tasks - Update a task
async function handlePut(req, res) {
  const { id, updated_by, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  // Get current task to check for status changes
  const currentTask = await executeQuery('SELECT * FROM project_tasks WHERE id = ?', [id]);
  if (currentTask.length === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Handle completion date
  if (updateData.status === 'completed' && currentTask[0].status !== 'completed') {
    updateData.completed_date = new Date().toISOString().split('T')[0];
  } else if (updateData.status !== 'completed') {
    updateData.completed_date = null;
  }

  const allFields = Object.keys(updateData);
  const setClause = allFields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE project_tasks SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...allFields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Log activity
  if (updateData.status && updateData.status !== currentTask[0].status) {
    if (updateData.status === 'completed') {
      await executeQuery(
        'INSERT INTO project_activities (project_id, task_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [currentTask[0].project_id, id, 'task_completed', 'Task completed', `Task "${currentTask[0].title}" was completed`, updated_by]
      );
    } else {
      await executeQuery(
        'INSERT INTO project_activities (project_id, task_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [currentTask[0].project_id, id, 'status_change', 'Task status updated', `Task status changed to ${updateData.status}`, updated_by]
      );
    }
  } else {
    await executeQuery(
      'INSERT INTO project_activities (project_id, task_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [currentTask[0].project_id, id, 'comment', 'Task updated', `Task information was updated`, updated_by]
    );
  }

  return res.status(200).json({
    message: 'Task updated successfully'
  });
}

// DELETE /api/projects/tasks - Delete a task
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  const result = await executeQuery('DELETE FROM project_tasks WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json({
    message: 'Task deleted successfully'
  });
}
