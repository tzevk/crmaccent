import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'crmaccent',
  port: parseInt(process.env.DB_PORT || '3306'),
};

// GET - Fetch all users
export async function GET() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        role,
        department,
        phone,
        is_active,
        created_at,
        updated_at
      FROM users 
      ORDER BY name ASC
    `);
    
    return NextResponse.json(rows);
    
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Return empty array if table doesn't exist yet
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new user
export async function POST(request) {
  let connection;
  
  try {
    const body = await request.json();
    const { name, email, password, role = 'user', department, phone, is_active = true } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);
    
    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password (in production, use bcrypt)
    // For now, we'll store it as plain text (not recommended for production)
    const hashedPassword = password; // Password hashing should be implemented for production

    // Insert new user
    const [result] = await connection.execute(`
      INSERT INTO users (name, email, password, role, department, phone, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [name, email, hashedPassword, role, department, phone, is_active]);

    // Fetch the created user
    const [newUser] = await connection.execute(`
      SELECT 
        id,
        name,
        email,
        role,
        department,
        phone,
        is_active,
        created_at
      FROM users 
      WHERE id = ?
    `, [result.insertId]);

    return NextResponse.json(newUser[0], { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
