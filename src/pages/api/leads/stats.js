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
        COUNT(CASE WHEN followup1_date IS NOT NULL OR followup2_date IS NOT NULL OR followup3_date IS NOT NULL THEN 1 END) as leads_with_followup,
        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_today,
        0 as total_value,
        COUNT(CASE WHEN DATE(updated_at) >= DATE_SUB(CURDATE(), INTERVAL 2 DAY) THEN 1 END) as recent_activity
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
        new_today: totals.new_today,
        total_value: totals.total_value,
        recent_activity: totals.recent_activity,
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
