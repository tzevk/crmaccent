import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ message: 'Project ID is required' });
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
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects/[id] - Get a single project with details
async function handleGet(req, res, id) {
  // Get project details
  const projectQuery = `
    SELECT 
      p.*,
      u.first_name as manager_name,
      u.last_name as manager_lastname,
      l.contact_name as lead_name,
      l.company_name as lead_company,
      l.contact_email as lead_email,
      creator.first_name as created_by_name,
      creator.last_name as created_by_lastname
    FROM projects p
    LEFT JOIN users u ON p.project_manager_id = u.id
    LEFT JOIN leads l ON p.lead_id = l.id
    LEFT JOIN users creator ON p.created_by = creator.id
    WHERE p.id = ?
  `;

  const projectResult = await executeQuery(projectQuery, [id]);

  if (projectResult.length === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  const project = projectResult[0];

  // Parse team_members JSON if it exists
  if (project.team_members) {
    try {
      project.team_members = JSON.parse(project.team_members);
    } catch (e) {
      project.team_members = [];
    }
  } else {
    project.team_members = [];
  }

  // Get project tasks
  const tasksQuery = `
    SELECT 
      pt.id,
      pt.project_id,
      pt.task_name as title,
      pt.description,
      pt.status,
      pt.priority,
      pt.assigned_to,
      pt.start_date,
      pt.due_date,
      pt.completed_date,
      pt.estimated_hours,
      pt.actual_hours,
      pt.progress_percentage,
      pt.parent_task_id,
      pt.created_by,
      pt.created_at,
      pt.updated_at,
      u.first_name as assigned_to_name,
      u.last_name as assigned_to_lastname
    FROM project_tasks pt
    LEFT JOIN users u ON pt.assigned_to = u.id
    WHERE pt.project_id = ?
    ORDER BY pt.created_at DESC
  `;

  const tasks = await executeQuery(tasksQuery, [id]);

  // Get project activities
  const activitiesQuery = `
    SELECT 
      pa.*,
      u.first_name as created_by_name,
      u.last_name as created_by_lastname,
      pt.task_name as task_title
    FROM project_activities pa
    LEFT JOIN users u ON pa.created_by = u.id
    LEFT JOIN project_tasks pt ON pa.task_id = pt.id
    WHERE pa.project_id = ?
    ORDER BY pa.activity_date DESC
    LIMIT 20
  `;

  const activities = await executeQuery(activitiesQuery, [id]);

  // Get project milestones
  const milestonesQuery = `
    SELECT *
    FROM project_milestones
    WHERE project_id = ?
    ORDER BY order_index ASC, due_date ASC
  `;

  const milestones = await executeQuery(milestonesQuery, [id]);

  // Get time logs summary
  const timeLogsQuery = `
    SELECT 
      SUM(hours) as total_hours,
      SUM(CASE WHEN is_billable = 1 THEN hours * hourly_rate ELSE 0 END) as billable_amount,
      COUNT(*) as total_entries
    FROM project_time_logs
    WHERE project_id = ?
  `;

  const timeLogsSummary = await executeQuery(timeLogsQuery, [id]);

  // Get task statistics
  const taskStatsQuery = `
    SELECT 
      COUNT(*) as total_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
      SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
      SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) as todo_tasks,
      SUM(estimated_hours) as total_estimated_hours,
      SUM(actual_hours) as total_actual_hours
    FROM project_tasks
    WHERE project_id = ?
  `;

  const taskStats = await executeQuery(taskStatsQuery, [id]);

  return res.status(200).json({
    project,
    tasks,
    activities,
    milestones,
    timeLogsSummary: timeLogsSummary[0] || { total_hours: 0, billable_amount: 0, total_entries: 0 },
    taskStats: taskStats[0] || { total_tasks: 0, completed_tasks: 0, in_progress_tasks: 0, todo_tasks: 0, total_estimated_hours: 0, total_actual_hours: 0 }
  });
}

// PUT /api/projects/[id] - Update a specific project
async function handlePut(req, res, id) {
  const { updated_by, ...updateData } = req.body;

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

// DELETE /api/projects/[id] - Delete a specific project
async function handleDelete(req, res, id) {
  const result = await executeQuery('DELETE FROM projects WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Project not found' });
  }

  return res.status(200).json({
    message: 'Project deleted successfully'
  });
}
