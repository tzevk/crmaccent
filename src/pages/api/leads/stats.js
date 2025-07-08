import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get basic lead counts by status
    const statusStats = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM leads 
      GROUP BY status
    `);

    // Get leads by source
    const sourceStats = await executeQuery(`
      SELECT 
        source,
        COUNT(*) as count
      FROM leads 
      GROUP BY source
    `);

    // Get total lead value
    const valueStats = await executeQuery(`
      SELECT 
        SUM(value) as total_value,
        AVG(value) as average_value,
        COUNT(*) as total_leads
      FROM leads
    `);

    // Get leads created in the last 30 days
    const recentLeads = await executeQuery(`
      SELECT COUNT(*) as count
      FROM leads 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);

    // Get conversion rate (converted leads / total leads)
    const conversionStats = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM leads WHERE status = 'converted') as converted_count,
        COUNT(*) as total_count,
        ROUND(
          (SELECT COUNT(*) FROM leads WHERE status = 'converted') * 100.0 / COUNT(*), 
          2
        ) as conversion_rate
      FROM leads
    `);

    // Get monthly lead creation trend (last 6 months)
    const monthlyTrend = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM leads 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY month DESC
    `);

    // Get hot leads that need attention
    const hotLeads = await executeQuery(`
      SELECT COUNT(*) as count
      FROM leads 
      WHERE status = 'hot'
    `);

    // Get leads with upcoming follow-ups (next 7 days)
    const upcomingFollowUps = await executeQuery(`
      SELECT COUNT(*) as count
      FROM leads 
      WHERE next_follow_up BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
    `);

    return res.status(200).json({
      statusBreakdown: statusStats,
      sourceBreakdown: sourceStats,
      valueStats: valueStats[0],
      recentLeads: recentLeads[0].count,
      conversionStats: conversionStats[0],
      monthlyTrend,
      hotLeads: hotLeads[0].count,
      upcomingFollowUps: upcomingFollowUps[0].count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Lead stats error:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch lead statistics', 
      error: error.message 
    });
  }
}
