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
      `SELECT * FROM proposals WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Proposal not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No data to update' },
        { status: 400 }
      );
    }
    
    // Convert camelCase to snake_case for database fields
    const snakeCaseData = {};
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeCaseData[snakeKey] = updateData[key] || null;
    });
    
    // Build dynamic UPDATE query
    const setClause = Object.keys(snakeCaseData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(snakeCaseData), id];
    
    await connection.execute(
      `UPDATE proposals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    // Fetch updated proposal
    const [rows] = await connection.execute(
      'SELECT * FROM proposals WHERE id = ?',
      [id]
    );
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    // Check if proposal exists
    const [existing] = await connection.execute(
      'SELECT id FROM proposals WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    await connection.execute(
      'DELETE FROM proposals WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ message: 'Proposal deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await connection.end();
  }
}
