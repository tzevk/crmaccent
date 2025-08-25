import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

async function getConnection() {
  return await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'crmaccent',
    port: process.env.DB_PORT || 3306
  });
}

// GET /api/projects - return list of projects
export async function GET(request) {
  let connection;
  try {
    connection = await getConnection();

    // allow optional ?limit= and ?status= query params
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || 50;
    const status = url.searchParams.get('status');

    let sql = `SELECT id, project_id, project_name, project_type, client_name, completion_percentage, project_status, start_date, expected_completion_date, created_at FROM projects`;
    const params = [];
    if (status) {
      sql += ` WHERE project_status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await connection.execute(sql, params);

    return NextResponse.json({ projects: rows });
  } catch (error) {
    console.error('Projects API error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
