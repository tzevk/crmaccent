// Simple API endpoint for project statistics

import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Basic statistics query that works with our schema
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        COUNT(DISTINCT created_by) as team_members,
        SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as this_month
      FROM projects
    `;

    const results = await executeQuery(query);
    
    const stats = results[0] || {
      active: 0,
      completed: 0,
      this_month: 0,
      team_members: 0,
      total: 0
    };
    
    // Map database results to the expected format in the frontend
    return res.status(200).json({
      active: stats.active || 0,
      completed: stats.completed || 0,
      thisMonth: stats.this_month || 0,
      teamMembers: stats.team_members || 0,
      total: stats.total || 0
    });
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch project statistics',
      error: error.message
    });
  }
}
