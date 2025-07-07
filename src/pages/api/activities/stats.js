import { executeQuery } from '../../../lib/db';
import { authenticateEndpoint } from '../../../utils/authUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { user, error } = await authenticateEndpoint(req, res);
    if (error) {
      return res.status(error.status).json({ message: error.message });
    }

    // Get total activities count
    const totalResult = await executeQuery(`
      SELECT COUNT(*) as total FROM lead_activities
    `);
    const totalActivities = totalResult[0]?.total || 0;

    // Get today's activities
    const todayResult = await executeQuery(`
      SELECT COUNT(*) as today FROM lead_activities 
      WHERE DATE(activity_date) = CURDATE()
    `);
    const todayActivities = todayResult[0]?.today || 0;

    // Get this week's activities
    const weekResult = await executeQuery(`
      SELECT COUNT(*) as week FROM lead_activities 
      WHERE YEARWEEK(activity_date, 1) = YEARWEEK(CURDATE(), 1)
    `);
    const weeklyActivities = weekResult[0]?.week || 0;

    // Get this month's activities
    const monthResult = await executeQuery(`
      SELECT COUNT(*) as month FROM lead_activities 
      WHERE YEAR(activity_date) = YEAR(CURDATE()) 
      AND MONTH(activity_date) = MONTH(CURDATE())
    `);
    const monthlyActivities = monthResult[0]?.month || 0;

    // Get activities by type
    const typeResult = await executeQuery(`
      SELECT 
        activity_type as type,
        COUNT(*) as count
      FROM lead_activities 
      GROUP BY activity_type 
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get recent activities with related data
    const recentResult = await executeQuery(`
      SELECT 
        la.*,
        l.name as lead_name,
        l.company as lead_company,
        u.first_name as created_by_name,
        u.last_name as created_by_lastname
      FROM lead_activities la
      LEFT JOIN leads l ON la.lead_id = l.id
      LEFT JOIN users u ON la.created_by = u.id
      ORDER BY la.activity_date DESC
      LIMIT 20
    `);

    // Activity types distribution for master activities
    const masterTypesResult = await executeQuery(`
      SELECT 
        activity_type as type,
        COUNT(*) as count,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count
      FROM activities 
      GROUP BY activity_type 
      ORDER BY count DESC
    `);

    const stats = {
      totalActivities,
      todayActivities,
      weeklyActivities,
      monthlyActivities,
      byType: typeResult || [],
      recentActivities: recentResult || [],
      masterTypes: masterTypesResult || []
    };

    return res.status(200).json(stats);

  } catch (error) {
    console.error('Activity stats API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
