import { executeQuery } from '../../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '../../../../utils/authUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check permissions for viewing project statistics
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.PROJECT_VIEW);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  try {
    // Get overall project statistics
    const projectStatsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_projects,
        SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END) as on_hold_projects,
        SUM(CASE WHEN status = 'planning' THEN 1 ELSE 0 END) as planning_projects,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_projects,
        SUM(budget) as total_budget,
        SUM(cost) as total_cost,
        AVG(progress_percentage) as average_progress
      FROM projects
    `;

    const projectStats = await executeQuery(projectStatsQuery);

    // Get status breakdown
    const statusBreakdownQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(budget) as total_budget,
        AVG(progress_percentage) as avg_progress
      FROM projects
      GROUP BY status
      ORDER BY count DESC
    `;

    const statusBreakdown = await executeQuery(statusBreakdownQuery);

    // Get priority breakdown
    const priorityBreakdownQuery = `
      SELECT 
        priority,
        COUNT(*) as count,
        SUM(budget) as total_budget
      FROM projects
      GROUP BY priority
      ORDER BY 
        CASE priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `;

    const priorityBreakdown = await executeQuery(priorityBreakdownQuery);

    // Get projects by month (last 12 months)
    const projectsByMonthQuery = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        SUM(budget) as total_budget
      FROM projects
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month ASC
    `;

    const projectsByMonth = await executeQuery(projectsByMonthQuery);

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
    `;

    const taskStats = await executeQuery(taskStatsQuery);

    // Get overdue projects
    const overdueProjectsQuery = `
      SELECT COUNT(*) as overdue_count
      FROM projects
      WHERE end_date < CURDATE() AND status NOT IN ('completed', 'cancelled')
    `;

    const overdueProjects = await executeQuery(overdueProjectsQuery);

    // Get top performing projects (by progress)
    const topProjectsQuery = `
      SELECT 
        id,
        name,
        status,
        priority,
        progress_percentage,
        budget,
        cost
      FROM projects
      WHERE status IN ('active', 'completed')
      ORDER BY progress_percentage DESC, budget DESC
      LIMIT 5
    `;

    const topProjects = await executeQuery(topProjectsQuery);

    // Get recent project activities
    const recentActivitiesQuery = `
      SELECT 
        pa.*,
        p.name as project_name,
        u.first_name as user_name,
        u.last_name as user_lastname
      FROM project_activities pa
      JOIN projects p ON pa.project_id = p.id
      LEFT JOIN users u ON pa.created_by = u.id
      ORDER BY pa.activity_date DESC
      LIMIT 10
    `;

    const recentActivities = await executeQuery(recentActivitiesQuery);

    // Get team workload (projects per manager)
    const teamWorkloadQuery = `
      SELECT 
        u.first_name,
        u.last_name,
        COUNT(p.id) as project_count,
        SUM(CASE WHEN p.status = 'active' THEN 1 ELSE 0 END) as active_projects,
        SUM(p.budget) as total_budget
      FROM users u
      LEFT JOIN projects p ON u.id = p.project_manager_id
      GROUP BY u.id, u.first_name, u.last_name
      HAVING project_count > 0
      ORDER BY active_projects DESC, project_count DESC
      LIMIT 10
    `;

    const teamWorkload = await executeQuery(teamWorkloadQuery);

    return res.status(200).json({
      projectStats: projectStats[0] || {},
      statusBreakdown: statusBreakdown || [],
      priorityBreakdown: priorityBreakdown || [],
      projectsByMonth: projectsByMonth || [],
      taskStats: taskStats[0] || {},
      overdueProjects: overdueProjects[0]?.overdue_count || 0,
      topProjects: topProjects || [],
      recentActivities: recentActivities || [],
      teamWorkload: teamWorkload || []
    });

  } catch (error) {
    console.error('Projects stats error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch project statistics', 
      error: error.message 
    });
  }
}
