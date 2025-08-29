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
    const { proposalId } = await request.json();
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

      // Check if status allows conversion
      if (!['Awarded', 'Submitted'].includes(proposal.current_status)) {
        throw new Error('Only awarded or submitted proposals can be converted to projects');
      }

      // Generate project number
      const currentYear = new Date().getFullYear();
      const [countRows] = await connection.execute(
        'SELECT COUNT(*) as count FROM projects WHERE project_number LIKE ?',
        [`PRJ_%_${currentYear}`]
      );
      const projectCount = countRows[0].count + 1;
      const projectNumber = `PRJ_${String(projectCount).padStart(3, '0')}_${currentYear}`;

      // Create project from proposal data
      const [projectResult] = await connection.execute(`
        INSERT INTO projects (
          project_number,
          project_name,
          client_name,
          city,
          received_date,
          project_type,
          project_cost,
          currency,
          status,
          proposal_id,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        projectNumber,
        proposal.proposal_title,
        proposal.client_name,
        proposal.client_address || '',
        proposal.proposal_date,
        'Project',
        proposal.estimated_value,
        proposal.currency || 'INR',
        'Ongoing',
        proposalId
      ]);

      const newProjectId = projectResult.insertId;

      // Update proposal to mark as converted
      await connection.execute(`
        UPDATE proposals 
        SET current_status = 'Converted to Project',
            updated_at = NOW()
        WHERE id = ?
      `, [proposalId]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Proposal successfully converted to project',
        project_id: projectNumber,
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
