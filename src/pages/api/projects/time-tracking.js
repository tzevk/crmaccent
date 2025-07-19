import { executeQuery } from '../../../lib/db.js';

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
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Time Tracking API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects/time-tracking - Get time tracking data for a project
async function handleGet(req, res) {
  const { projectId, taskId, userId, startDate, endDate } = req.query;

  let query = `
    SELECT 
      pt.*,
      p.name as project_name,
      p.project_number,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) as user_name
    FROM project_tasks pt
    LEFT JOIN projects p ON pt.project_id = p.id
    LEFT JOIN users u ON pt.assigned_to = u.id
    WHERE 1=1
  `;
  
  const params = [];

  if (projectId) {
    query += ' AND pt.project_id = ?';
    params.push(projectId);
  }

  if (taskId) {
    query += ' AND pt.id = ?';
    params.push(taskId);
  }

  if (userId) {
    query += ' AND pt.assigned_to = ?';
    params.push(userId);
  }

  if (startDate) {
    query += ' AND pt.created_at >= ?';
    params.push(startDate);
  }

  if (endDate) {
    query += ' AND pt.created_at <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY pt.created_at DESC';

  const timeEntries = await executeQuery(query, params);

  // Calculate summary statistics
  const totalEstimated = timeEntries.reduce((sum, entry) => sum + (parseFloat(entry.estimated_hours) || 0), 0);
  const totalActual = timeEntries.reduce((sum, entry) => sum + (parseFloat(entry.actual_hours) || 0), 0);
  const completionRate = totalEstimated > 0 ? (totalActual / totalEstimated * 100).toFixed(2) : 0;

  return res.status(200).json({
    timeEntries,
    summary: {
      totalEstimatedHours: totalEstimated,
      totalActualHours: totalActual,
      completionRate: parseFloat(completionRate),
      totalTasks: timeEntries.length,
      completedTasks: timeEntries.filter(entry => entry.status === 'completed').length
    }
  });
}

// POST /api/projects/time-tracking - Log time for a task
async function handlePost(req, res) {
  const {
    project_id,
    task_id,
    actual_hours,
    notes,
    user_id,
    work_date = new Date().toISOString().split('T')[0]
  } = req.body;

  if (!task_id || !actual_hours) {
    return res.status(400).json({ message: 'Task ID and actual hours are required' });
  }

  // Update the task's actual hours
  const updateQuery = `
    UPDATE project_tasks 
    SET 
      actual_hours = COALESCE(actual_hours, 0) + ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  await executeQuery(updateQuery, [actual_hours, task_id]);

  // Log the time entry activity
  await executeQuery(
    'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [
      user_id, 
      'Time logged', 
      'project_task', 
      task_id, 
      JSON.stringify({
        hours_logged: actual_hours,
        work_date,
        notes: notes || null
      })
    ]
  );

  return res.status(201).json({
    message: 'Time logged successfully'
  });
}

// PUT /api/projects/time-tracking - Update time entry or task hours
async function handlePut(req, res) {
  const {
    task_id,
    estimated_hours,
    actual_hours,
    user_id
  } = req.body;

  if (!task_id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }

  const fields = [];
  const params = [];

  if (estimated_hours !== undefined) {
    fields.push('estimated_hours = ?');
    params.push(estimated_hours);
  }

  if (actual_hours !== undefined) {
    fields.push('actual_hours = ?');
    params.push(actual_hours);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(task_id);

  const query = `UPDATE project_tasks SET ${fields.join(', ')} WHERE id = ?`;
  
  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Log the update
  await executeQuery(
    'INSERT INTO logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
    [user_id, 'Task time updated', 'project_task', task_id, `Time estimates updated for task`]
  );

  return res.status(200).json({
    message: 'Task time updated successfully'
  });
}
