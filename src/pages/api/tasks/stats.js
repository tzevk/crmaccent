import { executeQuery } from '@/lib/db';
import { authenticateEndpoint } from '@/utils/authUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user, error } = await authenticateEndpoint(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    const { user_id, project_id, lead_id } = req.query;
    
    // Base condition for filtering
    let baseCondition = '';
    let params = [];
    
    if (user_id) {
      baseCondition = 'WHERE assigned_to = ?';
      params.push(user_id);
    } else if (project_id) {
      baseCondition = 'WHERE project_id = ?';
      params.push(project_id);
    } else if (lead_id) {
      baseCondition = 'WHERE lead_id = ?';
      params.push(lead_id);
    }

    // Get total tasks count
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total FROM tasks ${baseCondition}
    `, params);
    const totalTasks = totalResult[0]?.total || 0;

    // Get tasks by status
    const statusResult = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM tasks 
      ${baseCondition}
      GROUP BY status
      ORDER BY count DESC
    `, params);

    // Get tasks by priority
    const priorityResult = await executeQuery(`
      SELECT 
        priority,
        COUNT(*) as count
      FROM tasks 
      ${baseCondition}
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
          ELSE 4 
        END
    `, params);

    // Get overdue tasks
    const overdueResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM tasks 
      ${baseCondition} 
      ${baseCondition ? 'AND' : 'WHERE'} due_date < NOW() AND status != 'completed'
    `, params);

    // Get due soon tasks (next 3 days)
    const dueSoonResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM tasks 
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} due_date <= DATE_ADD(NOW(), INTERVAL 3 DAY) 
      AND due_date >= NOW() 
      AND status != 'completed'
    `, params);

    // Get completed today
    const completedTodayResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM tasks 
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} DATE(completed_at) = CURDATE()
    `, params);

    // Get productivity stats (this week vs last week)
    const thisWeekResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM tasks 
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} YEARWEEK(completed_at, 1) = YEARWEEK(CURDATE(), 1)
    `, params);

    const lastWeekResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM tasks 
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} YEARWEEK(completed_at, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)
    `, params);

    // Get upcoming tasks (next 7 days)
    const upcomingResult = await executeQuery(`
      SELECT 
        t.*,
        p.name as project_name,
        l.name as lead_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN leads l ON t.lead_id = l.id
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} due_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
      AND status != 'completed'
      ORDER BY due_date ASC
      LIMIT 10
    `, params);

    // Get task completion trend (last 30 days)
    const trendResult = await executeQuery(`
      SELECT 
        DATE(completed_at) as date,
        COUNT(*) as completed_count
      FROM tasks 
      ${baseCondition}
      ${baseCondition ? 'AND' : 'WHERE'} completed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(completed_at)
      ORDER BY date DESC
    `, params);

    // Calculate productivity metrics
    const thisWeekCount = thisWeekResult[0]?.count || 0;
    const lastWeekCount = lastWeekResult[0]?.count || 0;
    const productivityTrend = lastWeekCount > 0 
      ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100)
      : thisWeekCount > 0 ? 100 : 0;

    const stats = {
      totalTasks,
      overdueTasks: overdueResult[0]?.count || 0,
      dueSoonTasks: dueSoonResult[0]?.count || 0,
      completedToday: completedTodayResult[0]?.count || 0,
      thisWeekCompleted: thisWeekCount,
      lastWeekCompleted: lastWeekCount,
      productivityTrend,
      statusBreakdown: statusResult || [],
      priorityBreakdown: priorityResult || [],
      upcomingTasks: upcomingResult || [],
      completionTrend: trendResult || []
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Task stats API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
