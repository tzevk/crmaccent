import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Load environment variables
if (typeof window === 'undefined') {
  require('dotenv').config({ path: '.env.local' });
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

// GET - Fetch single company
export async function GET(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);
    
    const [companies] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (companies.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(companies[0]);
    
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update company
export async function PUT(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    const companyData = await request.json();
    connection = await mysql.createConnection(dbConfig);
    
    // Check if company exists
    const [existingCompany] = await connection.execute(
      'SELECT id FROM companies WHERE id = ?',
      [id]
    );
    
    if (existingCompany.length === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Check if name already exists for other companies
    if (companyData.name) {
      const [duplicateCompany] = await connection.execute(
        'SELECT id FROM companies WHERE name = ? AND id != ?',
        [companyData.name, id]
      );
      
      if (duplicateCompany.length > 0) {
        return NextResponse.json(
          { error: 'Company with this name already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update company
    await connection.execute(`
      UPDATE companies SET 
        name = ?, address = ?, city = ?, state = ?, country = ?, 
        sector = ?, phone = ?, email = ?, website = ?
      WHERE id = ?
    `, [
      companyData.name,
      companyData.address || null,
      companyData.city || null,
      companyData.state || null,
      companyData.country || 'India',
      companyData.sector || null,
      companyData.phone || null,
      companyData.email || null,
      companyData.website || null,
      id
    ]);

    // Fetch updated company
    const [updatedCompany] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    return NextResponse.json(updatedCompany[0]);
    
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Delete company
export async function DELETE(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);
    
    // Check if company has associated leads
    const [leads] = await connection.execute(
      'SELECT COUNT(*) as count FROM leads WHERE company_id = ?',
      [id]
    );
    
    if (leads[0].count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete company with associated leads' },
        { status: 409 }
      );
    }
    
    // Delete company
    const [result] = await connection.execute(
      'DELETE FROM companies WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Company deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
