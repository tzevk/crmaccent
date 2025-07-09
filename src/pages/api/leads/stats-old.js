import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get basic lead counts by enquiry status
    const enquiryStatusStats = await executeQuery(`
      SELECT 
        enquiry_status,
        COUNT(*) as count
      FROM leads 
      GROUP BY enquiry_status
    `);

    // Get leads by project status
    const projectStatusStats = await executeQuery(`
      SELECT 
        project_status,
        COUNT(*) as count
      FROM leads 
      GROUP BY project_status
    `);

    // Get leads by enquiry type
    const enquiryTypeStats = await executeQuery(`
      SELECT 
        enquiry_type,
        COUNT(*) as count
      FROM leads 
      GROUP BY enquiry_type
    `);

    // Get leads by type (New, Existing, Renewal)
    const typeStats = await executeQuery(`
      SELECT 
        type,
        COUNT(*) as count
      FROM leads 
      GROUP BY type
    `);

    // Get leads by year
    const yearStats = await executeQuery(`
      SELECT 
        year,
        COUNT(*) as count
      FROM leads 
      GROUP BY year
      ORDER BY year DESC
    `);

    // Get total counts
    const totalStats = await executeQuery(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(DISTINCT company_name) as total_companies,
        COUNT(CASE WHEN enquiry_status = 'Won' THEN 1 END) as won_leads,
        COUNT(CASE WHEN enquiry_status = 'Lost' THEN 1 END) as lost_leads,
        COUNT(CASE WHEN enquiry_status = 'Working' THEN 1 END) as active_leads,
        COUNT(CASE WHEN enquiry_status = 'New' THEN 1 END) as new_leads,
        COUNT(CASE WHEN followup1_date IS NOT NULL OR followup2_date IS NOT NULL OR followup3_date IS NOT NULL THEN 1 END) as leads_with_followup
      FROM leads
    `);

    // Get recent activity (last 30 days)
    const recentActivity = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM leads 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get top companies by lead count
    const topCompanies = await executeQuery(`
      SELECT 
        company_name,
        COUNT(*) as lead_count
      FROM leads 
      GROUP BY company_name
      ORDER BY lead_count DESC
      LIMIT 10
    `);

    // Get follow-up required leads
    const followupRequired = await executeQuery(`
      SELECT COUNT(*) as count
      FROM leads 
      WHERE enquiry_status = 'Follow-up'
      OR (followup1_date IS NOT NULL AND followup1_date < NOW())
      OR (followup2_date IS NOT NULL AND followup2_date < NOW())
      OR (followup3_date IS NOT NULL AND followup3_date < NOW())
    `);

    // Calculate conversion rate
    const [totals] = totalStats;
    const conversionRate = totals.total_leads > 0 
      ? ((totals.won_leads / totals.total_leads) * 100).toFixed(1)
      : 0;

    // Format response
    const stats = {
      summary: {
        total_leads: totals.total_leads,
        total_companies: totals.total_companies,
        new_leads: totals.new_leads,
        active_leads: totals.active_leads,
        won_leads: totals.won_leads,
        lost_leads: totals.lost_leads,
        leads_with_followup: totals.leads_with_followup,
        followup_required: followupRequired[0].count,
        conversion_rate: parseFloat(conversionRate)
      },
      enquiryStatusBreakdown: enquiryStatusStats.reduce((acc, item) => {
        acc[item.enquiry_status] = item.count;
        return acc;
      }, {}),
      projectStatusBreakdown: projectStatusStats.reduce((acc, item) => {
        acc[item.project_status] = item.count;
        return acc;
      }, {}),
      enquiryTypeBreakdown: enquiryTypeStats.reduce((acc, item) => {
        acc[item.enquiry_type] = item.count;
        return acc;
      }, {}),
      typeBreakdown: typeStats.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {}),
      yearBreakdown: yearStats.reduce((acc, item) => {
        acc[item.year] = item.count;
        return acc;
      }, {}),
      recentActivity: recentActivity.map(item => ({
        date: item.date,
        count: item.count
      })),
      topCompanies: topCompanies.map(item => ({
        company: item.company_name,
        leadCount: item.lead_count
      }))
    };

    res.status(200).json(stats);

  } catch (error) {
    console.error('Stats API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch lead statistics', 
      error: error.message 
    });
  }
}
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
