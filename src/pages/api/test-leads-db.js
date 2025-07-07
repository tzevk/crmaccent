import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Testing leads database structure...');
    
    // Check if leads tables exist
    const tables = await executeQuery("SHOW TABLES LIKE '%lead%'");
    
    // Get leads table structure
    const leadsStructure = await executeQuery('DESCRIBE leads');
    
    // Get lead_activities table structure
    const activitiesStructure = await executeQuery('DESCRIBE lead_activities');
    
    // Get lead_sources table structure
    const sourcesStructure = await executeQuery('DESCRIBE lead_sources');
    
    // Count records in each table
    const leadCount = await executeQuery('SELECT COUNT(*) as count FROM leads');
    const activityCount = await executeQuery('SELECT COUNT(*) as count FROM lead_activities');
    const sourceCount = await executeQuery('SELECT COUNT(*) as count FROM lead_sources');
    
    // Get sample sources
    const sources = await executeQuery('SELECT * FROM lead_sources LIMIT 5');

    return res.status(200).json({
      message: 'Leads database test completed successfully',
      tables: tables.map(t => Object.values(t)[0]),
      structure: {
        leads: leadsStructure,
        activities: activitiesStructure,
        sources: sourcesStructure
      },
      counts: {
        leads: leadCount[0].count,
        activities: activityCount[0].count,
        sources: sourceCount[0].count
      },
      sampleSources: sources,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Leads database test error:', error);
    return res.status(500).json({
      message: 'Leads database test failed',
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
}
