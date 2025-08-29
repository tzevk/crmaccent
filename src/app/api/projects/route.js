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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') || 100;
    
    let query = `
      SELECT p.*
      FROM projects p
      WHERE 1=1
    `;
    let params = [];
    
    if (status && status !== 'All') {
      query += ' AND p.status = ?';
      params.push(status);
    }
    
    if (type && type !== 'All') {
      query += ' AND p.project_type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ` AND (p.project_name LIKE ? OR p.client_name LIKE ? OR p.project_number LIKE ?)`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ?';
    params.push(parseInt(limit, 10));
    
    const [rows] = await connection.execute(query, params);
    
    // Parse project_team JSON for each row
    const projects = rows.map(row => ({
      ...row,
      project_team: row.project_team ? JSON.parse(row.project_team) : []
    }));
    
    return NextResponse.json({ 
      success: true, 
      projects: projects 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch projects',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}

export async function POST(request) {
  let connection;
  try {
    connection = await getConnection();
    const body = await request.json();
    const {
      project_number,
      project_name,
      client_name,
      city,
      received_date,
      project_type = 'Project',
      project_cost,
      currency = 'INR',
      start_date,
      end_date,
      duration,
      manhours,
      project_head,
      project_manager,
      project_lead,
      area_engineer,
      project_team = [],
      status = 'Ongoing',
      proposal_id
    } = body;

    // Validate required fields
    if (!project_number || !project_name || !client_name) {
      return NextResponse.json(
        { success: false, error: 'Project number, name, and client name are required' },
        { status: 400 }
      );
    }

    // Check if project number already exists
    const [existing] = await connection.execute(
      'SELECT id FROM projects WHERE project_number = ?',
      [project_number]
    );
    
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Project number already exists' },
        { status: 400 }
      );
    }

    const [result] = await connection.execute(
      `INSERT INTO projects (
        project_number, project_name, client_name, city, received_date,
        project_type, project_cost, currency, start_date, end_date, duration,
        manhours, project_head, project_manager, project_lead, area_engineer,
        project_team, status, proposal_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_number, project_name, client_name, city, received_date,
        project_type, project_cost, currency, start_date, end_date, duration,
        manhours, project_head, project_manager, project_lead, area_engineer,
        JSON.stringify(project_team), status, proposal_id
      ]
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Project created successfully',
      project_id: result.insertId 
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create project',
        details: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}
