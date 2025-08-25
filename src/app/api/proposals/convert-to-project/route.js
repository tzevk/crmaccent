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
    const { proposalId, projectData = {} } = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Get the proposal data
      const [proposalRows] = await connection.execute(
        'SELECT * FROM proposals WHERE id = ?',
        [proposalId]
      );

      if (proposalRows.length === 0) {
        throw new Error('Proposal not found');
      }

      const proposal = proposalRows[0];

      // Check if already converted
      if (proposal.is_converted_to_project) {
        throw new Error('Proposal already converted to project');
      }

      // Check if status allows conversion
      if (proposal.current_status !== 'Awarded') {
        throw new Error('Only awarded proposals can be converted to projects');
      }

      // Generate unique project ID
      const timestamp = Date.now();
      const projectId = `PROJ-${timestamp}`;

      // Create project from proposal data
      const [projectResult] = await connection.execute(`
        INSERT INTO projects (
          project_id,
          project_name,
          client_name,
          contact_person,
          email,
          phone_number,
          address,
          project_type,
          estimated_value,
          currency,
          estimated_duration,
          scope_of_work,
          status,
          start_date,
          expected_completion_date,
          created_from_proposal_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        projectId,
        proposal.project_name || proposal.proposal_title,
        proposal.client_name,
        proposal.contact_person,
        proposal.email,
        proposal.phone_number || null,
        proposal.address || null,
        proposal.project_type || 'General',
        proposal.estimated_value,
        proposal.currency || 'INR',
        proposal.estimated_duration || null,
        proposal.scope_of_work || null,
        'Active',
        projectData.start_date || new Date().toISOString().split('T')[0],
        projectData.expected_completion_date || null,
        proposal.id
      ]);

      const newProjectId = projectResult.insertId;

      // Update proposal to mark as converted
      await connection.execute(`
        UPDATE proposals 
        SET is_converted_to_project = 1, 
            project_id = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [projectId, proposalId]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Proposal successfully converted to project',
        project_id: projectId,
        project_database_id: newProjectId
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error converting proposal to project:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to convert proposal to project' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
