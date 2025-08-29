import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT)
};

export async function GET(request, { params }) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { id } = await params;
    
    const [rows] = await connection.execute(
      `SELECT p.*
       FROM projects p
       WHERE p.id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' }, 
        { status: 404 }
      );
    }

    // Parse project_team JSON
    const project = {
      ...rows[0],
      project_team: rows[0].project_team ? JSON.parse(rows[0].project_team) : []
    };
    
    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function PUT(request, { params }) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Remove id and timestamps from update data
    const { id: _, created_at, updated_at, ...updateData } = body;
    
    // Handle project_team as JSON
    if (updateData.project_team && Array.isArray(updateData.project_team)) {
      updateData.project_team = JSON.stringify(updateData.project_team);
    }
    
    // Build dynamic update query
    const fields = Object.keys(updateData);
    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(updateData);
    
    const [existing] = await connection.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    await connection.execute(
      `UPDATE projects SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project updated successfully' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}

export async function DELETE(request, { params }) {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    const { id } = await params;
    
    const [existing] = await connection.execute(
      'SELECT id FROM projects WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }
    
    await connection.execute(
      'DELETE FROM projects WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Project deleted successfully' 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
