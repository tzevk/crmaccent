import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Load environment variables
if (typeof window === 'undefined') {
  require('dotenv').config({ path: '.env.local' });
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

export async function GET(request) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30';
    const assignedTo = searchParams.get('assignedTo');
    
    let dateFilter = '';
    if (timeframe !== 'all') {
      dateFilter = `AND created_at >= DATE_SUB(NOW(), INTERVAL ${timeframe} DAY)`;
    }
    
    let assigneeFilter = '';
    if (assignedTo && assignedTo !== 'All') {
      if (assignedTo === 'unassigned') {
        assigneeFilter = `AND (assigned_to IS NULL OR assigned_to = '')`;
      } else if (assignedTo === 'me') {
        // This would need to be replaced with actual user identification
        assigneeFilter = `AND assigned_to = 'current_user'`;
      } else {
        assigneeFilter = `AND assigned_to = '${assignedTo}'`;
      }
    }
    
    // Get pipeline data grouped by lead stage
    const [pipelineData] = await connection.execute(`
      SELECT 
        lead_stage,
        COUNT(*) as count,
        SUM(COALESCE(estimated_value, 0)) as total_value,
        AVG(COALESCE(estimated_value, 0)) as avg_value,
        MIN(created_at) as oldest_lead,
        MAX(created_at) as newest_lead,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as recent_count
      FROM leads 
      WHERE lead_stage IN ('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost')
      ${dateFilter}
      ${assigneeFilter}
      GROUP BY lead_stage
      ORDER BY 
        CASE lead_stage
          WHEN 'New' THEN 1
          WHEN 'Qualified' THEN 2
          WHEN 'Proposal Sent' THEN 3
          WHEN 'Negotiation' THEN 4
          WHEN 'Closed-Won' THEN 5
          WHEN 'Closed-Lost' THEN 6
          ELSE 7
        END
    `);

    // Get conversion rates between stages
    const [conversionData] = await connection.execute(`
      SELECT 
        'New to Qualified' as conversion,
        (SELECT COUNT(*) FROM leads WHERE lead_stage = 'Qualified' ${dateFilter} ${assigneeFilter}) * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM leads WHERE lead_stage IN ('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') ${dateFilter} ${assigneeFilter}), 0) as rate
      UNION ALL
      SELECT 
        'Qualified to Proposal' as conversion,
        (SELECT COUNT(*) FROM leads WHERE lead_stage IN ('Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') ${dateFilter} ${assigneeFilter}) * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM leads WHERE lead_stage IN ('Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') ${dateFilter} ${assigneeFilter}), 0) as rate
      UNION ALL
      SELECT 
        'Proposal to Close' as conversion,
        (SELECT COUNT(*) FROM leads WHERE lead_stage IN ('Closed-Won', 'Closed-Lost') ${dateFilter} ${assigneeFilter}) * 100.0 / 
        NULLIF((SELECT COUNT(*) FROM leads WHERE lead_stage IN ('Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost') ${dateFilter} ${assigneeFilter}), 0) as rate
    `);

    // Get velocity data (average time in each stage)
    const [velocityData] = await connection.execute(`
      SELECT 
        lead_stage,
        AVG(DATEDIFF(COALESCE(updated_at, NOW()), created_at)) as avg_days_in_stage
      FROM leads 
      WHERE lead_stage IN ('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost')
      ${dateFilter}
      ${assigneeFilter}
      GROUP BY lead_stage
    `);

    return NextResponse.json({
      pipeline: pipelineData,
      conversions: conversionData,
      velocity: velocityData,
      metadata: {
        timeframe,
        assignedTo,
        generated_at: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching pipeline data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline data' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PATCH(request) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    const body = await request.json();
    const { leadId, newStage, notes } = body;
    
    if (!leadId || !newStage) {
      return NextResponse.json(
        { error: 'Lead ID and new stage are required' },
        { status: 400 }
      );
    }
    
    // Validate stage
    const validStages = ['New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost'];
    if (!validStages.includes(newStage)) {
      return NextResponse.json(
        { error: 'Invalid stage' },
        { status: 400 }
      );
    }
    
    // Update lead stage
    const [result] = await connection.execute(
      `UPDATE leads 
       SET lead_stage = ?, 
           updated_at = NOW(),
           notes = COALESCE(CONCAT(COALESCE(notes, ''), '\n', ?), notes)
       WHERE id = ?`,
      [newStage, notes ? `Stage changed to ${newStage}: ${notes}` : null, leadId]
    );
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    // Get updated lead data
    const [leadData] = await connection.execute(
      'SELECT * FROM leads WHERE id = ?',
      [leadId]
    );
    
    return NextResponse.json({
      success: true,
      lead: leadData[0],
      message: `Lead stage updated to ${newStage}`
    });
    
  } catch (error) {
    console.error('Error updating lead stage:', error);
    return NextResponse.json(
      { error: 'Failed to update lead stage' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
