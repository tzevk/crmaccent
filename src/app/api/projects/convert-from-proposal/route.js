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
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { proposalId } = await request.json();
    
    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'Proposal ID is required' },
        { status: 400 }
      );
    }
    
    // Get proposal details
    const [proposalRows] = await connection.execute(
      'SELECT * FROM proposals WHERE id = ?',
      [proposalId]
    );
    
    if (proposalRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    const proposal = proposalRows[0];
    
    // Generate project number
    const currentYear = new Date().getFullYear();
    const [countRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM projects WHERE project_number LIKE ?',
      [`PRJ_%_${currentYear}`]
    );
    const projectCount = countRows[0].count + 1;
    const projectNumber = `PRJ_${String(projectCount).padStart(3, '0')}_${currentYear}`;
    
    // Create project from proposal
    const [result] = await connection.execute(
      `INSERT INTO projects (
        project_number, project_name, client_name, city, received_date,
        project_type, project_cost, currency, status, proposal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );
    
    // Update proposal status
    await connection.execute(
      'UPDATE proposals SET current_status = ? WHERE id = ?',
      ['Converted to Project', proposalId]
    );
    
    return NextResponse.json({
      success: true,
      message: 'Proposal converted to project successfully',
      project_id: result.insertId,
      project_number: projectNumber
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to convert proposal to project' },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
