import { executeQuery } from '../../../lib/db.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Project Timeline API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/projects/timeline - Get timeline data for projects
async function handleGet(req, res) {
  const { projectId, startDate, endDate } = req.query;

  // Get project milestones and activities
  let timelineQuery = `
    SELECT 
      'project' as event_type,
      p.id as project_id,
      p.name as project_name,
      p.project_number,
      p.status,
      p.priority,
      p.start_date as event_date,
      'Project Started' as event_title,
      p.description as event_description,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      c.name as client_name
    FROM projects p
    LEFT JOIN users u ON p.created_by = u.id
    LEFT JOIN companies c ON p.client_id = c.id
    WHERE p.start_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'task' as event_type,
      pt.project_id,
      p.name as project_name,
      p.project_number,
      pt.status,
      pt.priority,
      pt.due_date as event_date,
      CONCAT('Task: ', pt.task_name) as event_title,
      pt.description as event_description,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      c.name as client_name
    FROM project_tasks pt
    LEFT JOIN projects p ON pt.project_id = p.id
    LEFT JOIN users u ON pt.assigned_to = u.id
    LEFT JOIN companies c ON p.client_id = c.id
    WHERE pt.due_date IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'log' as event_type,
      l.entity_id as project_id,
      p.name as project_name,
      p.project_number,
      NULL as status,
      NULL as priority,
      l.created_at as event_date,
      l.action as event_title,
      l.details as event_description,
      CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
      c.name as client_name
    FROM logs l
    LEFT JOIN projects p ON l.entity_id = p.id AND l.entity_type = 'project'
    LEFT JOIN users u ON l.user_id = u.id
    LEFT JOIN companies c ON p.client_id = c.id
    WHERE l.entity_type = 'project'
  `;

  const params = [];
  let whereConditions = [];

  if (projectId) {
    whereConditions.push('project_id = ?');
    params.push(projectId, projectId, projectId); // Three times for the three UNION parts
  }

  if (startDate) {
    whereConditions.push('event_date >= ?');
    params.push(startDate, startDate, startDate);
  }

  if (endDate) {
    whereConditions.push('event_date <= ?');
    params.push(endDate, endDate, endDate);
  }

  // Apply WHERE conditions if any exist
  if (whereConditions.length > 0) {
    const conditions = whereConditions.join(' AND ');
    timelineQuery = timelineQuery.replace(
      /WHERE (p\.start_date IS NOT NULL|pt\.due_date IS NOT NULL|l\.entity_type = 'project')/g,
      `WHERE $1 AND ${conditions}`
    );
  }

  timelineQuery += ' ORDER BY event_date DESC, event_type';

  const timelineData = await executeQuery(timelineQuery, params);

  // Get project statistics if projectId is specified
  let projectStats = null;
  if (projectId) {
    const statsQuery = `
      SELECT 
        p.*,
        c.name as client_name,
        CONCAT(u.first_name, ' ', u.last_name) as manager_name,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id) as total_tasks,
        (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id AND pt.status = 'completed') as completed_tasks,
        COALESCE((SELECT SUM(pt.estimated_hours) FROM project_tasks pt WHERE pt.project_id = p.id), 0) as total_estimated_hours,
        COALESCE((SELECT SUM(pt.actual_hours) FROM project_tasks pt WHERE pt.project_id = p.id), 0) as total_actual_hours,
        CASE 
          WHEN COALESCE((SELECT SUM(pt.estimated_hours) FROM project_tasks pt WHERE pt.project_id = p.id), 0) > 0 
          THEN ROUND((COALESCE((SELECT SUM(pt.actual_hours) FROM project_tasks pt WHERE pt.project_id = p.id), 0) / (SELECT SUM(pt.estimated_hours) FROM project_tasks pt WHERE pt.project_id = p.id)) * 100, 2)
          ELSE 0
        END as hours_completion_percentage,
        CASE 
          WHEN (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id) > 0 
          THEN ROUND(((SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id AND pt.status = 'completed') / (SELECT COUNT(*) FROM project_tasks pt WHERE pt.project_id = p.id)) * 100, 2)
          ELSE 0
        END as task_completion_percentage
      FROM projects p
      LEFT JOIN companies c ON p.client_id = c.id
      LEFT JOIN users u ON p.project_manager_id = u.id
      WHERE p.id = ?
    `;
    
    const statsResult = await executeQuery(statsQuery, [projectId]);
    projectStats = statsResult[0] || null;
  }

  // Process timeline data to group by date
  const groupedTimeline = {};
  timelineData.forEach(event => {
    const date = event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : 'No Date';
    if (!groupedTimeline[date]) {
      groupedTimeline[date] = [];
    }
    groupedTimeline[date].push(event);
  });

  return res.status(200).json({
    timeline: timelineData,
    groupedTimeline,
    projectStats,
    summary: {
      totalEvents: timelineData.length,
      dateRange: {
        start: timelineData.length > 0 ? timelineData[timelineData.length - 1].event_date : null,
        end: timelineData.length > 0 ? timelineData[0].event_date : null
      },
      eventTypes: {
        projects: timelineData.filter(e => e.event_type === 'project').length,
        tasks: timelineData.filter(e => e.event_type === 'task').length,
        activities: timelineData.filter(e => e.event_type === 'log').length
      }
    }
  });
}
