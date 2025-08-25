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

export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get pipeline data grouped by lead stage
    const [pipelineData] = await connection.execute(`
      SELECT 
        lead_stage,
        COUNT(*) as count,
        SUM(estimated_value) as total_value,
        AVG(estimated_value) as avg_value
      FROM leads 
      WHERE lead_stage IN ('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost')
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

    return NextResponse.json(pipelineData);
    
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
