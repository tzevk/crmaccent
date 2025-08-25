import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT)
};

export async function POST(request) {
  let connection;
  
  try {
    const { leadId, projectData = {} } = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Get the lead data
      const [leadRows] = await connection.execute(
        'SELECT * FROM leads WHERE id = ?',
        [leadId]
      );

      if (leadRows.length === 0) {
        throw new Error('Lead not found');
      }

      const lead = leadRows[0];

      // Check if already converted to project
      if (lead.status === 'converted') {
        throw new Error('Lead already converted to project');
      }

      // Check if lead is qualified for conversion
      if (!['qualified', 'proposal'].includes(lead.status)) {
        throw new Error('Only qualified or proposal-stage leads can be converted to projects');
      }

      // Generate unique project number
      const timestamp = Date.now();
      const projectNumber = `PROJ-${timestamp}`;

      // Create project from lead data
      const [projectResult] = await connection.execute(`
        INSERT INTO projects (
          project_number,
          name,
          type,
          client_id,
          start_date,
          end_date,
          status,
          value,
          description,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        projectNumber,
        lead.requirement || lead.project_description || `Project for ${lead.company || lead.company_name}`,
        'ONGOING', // Set as ongoing project
        null, // Will need to create client record if needed
        projectData.start_date || new Date().toISOString().split('T')[0],
        projectData.end_date || null,
        'planning', // Initial project status
        lead.value || 0,
        lead.requirement || lead.project_description || lead.notes,
        1 // Default created by
      ]);

      const newProjectId = projectResult.insertId;

      // Update lead to mark as converted
      await connection.execute(`
        UPDATE leads 
        SET status = 'converted',
            updated_at = NOW()
        WHERE id = ?
      `, [leadId]);

      // Create lead activity for tracking
      try {
        await connection.execute(`
          INSERT INTO lead_activities (
            lead_id,
            activity_type,
            description,
            activity_date,
            created_by,
            created_at
          ) VALUES (?, ?, ?, NOW(), ?, NOW())
        `, [
          leadId,
          'status_change',
          `Lead converted to project: "${projectNumber}"`,
          1 // Default user
        ]);
      } catch (activityError) {
        console.warn('Failed to create lead activity:', activityError.message);
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Lead successfully converted to project',
        project_id: newProjectId,
        project_number: projectNumber
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error converting lead to project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to convert lead to project' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
