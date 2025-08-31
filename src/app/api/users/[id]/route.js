import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '3306'),
};

// GET - Fetch single user
export async function GET(request, { params }) {
  let connection;
  
  try {
    const { id } = params;
    
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
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(rows[0]);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PATCH - Update user
export async function PATCH(request, { params }) {
  let connection;
  
  try {
    const { id } = params;
    const body = await request.json();
    
    connection = await mysql.createConnection(dbConfig);
    
    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(body.name);
    }
    
    if (body.email !== undefined) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      
      // Check if email is already taken by another user
      const [emailCheck] = await connection.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [body.email, id]
      );
      
      if (emailCheck.length > 0) {
        return NextResponse.json(
          { error: 'Email already taken by another user' },
          { status: 409 }
        );
      }
      
      updateFields.push('email = ?');
      updateValues.push(body.email);
    }
    
    if (body.password !== undefined) {
      // Hash password (in production, use bcrypt)
      const hashedPassword = body.password; // Password hashing should be implemented for production
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    
    if (body.role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(body.role);
    }
    
    if (body.department !== undefined) {
      updateFields.push('department = ?');
      updateValues.push(body.department);
    }
    
    if (body.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(body.phone);
    }
    
    if (body.is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(body.is_active);
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    // Execute update
    await connection.execute(`
      UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `, updateValues);

    // Fetch updated user
    const [updatedUser] = await connection.execute(`
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
      WHERE id = ?
    `, [id]);

    return NextResponse.json(updatedUser[0]);
    
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Delete user
export async function DELETE(request, { params }) {
  let connection;
  
  try {
    const { id } = params;
    
    connection = await mysql.createConnection(dbConfig);
    
    // Check if user exists
    const [existingUser] = await connection.execute(
      'SELECT id, name FROM users WHERE id = ?',
      [id]
    );
    
    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user
    await connection.execute('DELETE FROM users WHERE id = ?', [id]);

    return NextResponse.json({ 
      message: `User "${existingUser[0].name}" deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Check for foreign key constraint errors
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        { error: 'Cannot delete user - they are referenced in other records' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
