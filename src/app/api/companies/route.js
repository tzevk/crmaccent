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

// GET - Fetch all companies
export async function GET(request) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    
    let query = `
      SELECT 
        id, name, industry, sector, company_type, founded_year,
        phone, email, website, fax, address, city, state, country, postal_code,
        employee_count, annual_revenue, currency, business_description,
        primary_contact_name, primary_contact_designation, primary_contact_phone, primary_contact_email,
        gst_number, pan_number, registration_number, tax_id, notes, tags,
        created_at, updated_at
      FROM companies 
    `;
    let params = [];
    
    if (search) {
      query += ` WHERE name LIKE ? OR city LIKE ? OR sector LIKE ? OR industry LIKE ?`;
      params = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    
    query += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [companies] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) as total FROM companies`;
    let countParams = [];
    
    if (search) {
      countQuery += ` WHERE name LIKE ? OR city LIKE ? OR sector LIKE ? OR industry LIKE ?`;
      countParams = [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`];
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    const total = countResult[0].total;

    return NextResponse.json({
      companies,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Create new company
export async function POST(request) {
  let connection;
  
  try {
    const companyData = await request.json();
    connection = await mysql.createConnection(dbConfig);
    
    // Validate required fields
    if (!companyData.name) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }
    
    // Check if company already exists
    const [existingCompany] = await connection.execute(
      'SELECT id FROM companies WHERE name = ?',
      [companyData.name]
    );
    
    if (existingCompany.length > 0) {
      return NextResponse.json(
        { error: 'Company with this name already exists' },
        { status: 409 }
      );
    }
    
    // Insert new company
    const [result] = await connection.execute(`
      INSERT INTO companies (
        name, industry, sector, company_type, founded_year,
        phone, email, website, fax, address, city, state, country, postal_code,
        employee_count, annual_revenue, currency, business_description,
        primary_contact_name, primary_contact_designation, primary_contact_phone, primary_contact_email,
        gst_number, pan_number, registration_number, tax_id, notes, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyData.name,
      companyData.industry || null,
      companyData.sector || null,
      companyData.company_type || 'Private',
      companyData.founded_year || null,
      companyData.phone || null,
      companyData.email || null,
      companyData.website || null,
      companyData.fax || null,
      companyData.address || null,
      companyData.city || null,
      companyData.state || null,
      companyData.country || 'India',
      companyData.postal_code || null,
      companyData.employee_count || null,
      companyData.annual_revenue || null,
      companyData.currency || 'INR',
      companyData.business_description || null,
      companyData.primary_contact_name || null,
      companyData.primary_contact_designation || null,
      companyData.primary_contact_phone || null,
      companyData.primary_contact_email || null,
      companyData.gst_number || null,
      companyData.pan_number || null,
      companyData.registration_number || null,
      companyData.tax_id || null,
      companyData.notes || null,
      companyData.tags || null
    ]);

    // Fetch the created company
    const [newCompany] = await connection.execute(
      'SELECT * FROM companies WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newCompany[0], { status: 201 });
    
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Update company
export async function PUT(request) {
  let connection;
  
  try {
    const companyData = await request.json();
    const { id } = companyData;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required for update' },
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);

    // Update company
    const [result] = await connection.execute(`
      UPDATE companies SET
        name = ?, industry = ?, sector = ?, company_type = ?, founded_year = ?,
        phone = ?, email = ?, website = ?, fax = ?, address = ?, city = ?, state = ?, country = ?, postal_code = ?,
        employee_count = ?, annual_revenue = ?, currency = ?, business_description = ?,
        primary_contact_name = ?, primary_contact_designation = ?, primary_contact_phone = ?, primary_contact_email = ?,
        gst_number = ?, pan_number = ?, registration_number = ?, tax_id = ?, notes = ?, tags = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      companyData.name,
      companyData.industry || null,
      companyData.sector || null,
      companyData.company_type || 'Private',
      companyData.founded_year || null,
      companyData.phone || null,
      companyData.email || null,
      companyData.website || null,
      companyData.fax || null,
      companyData.address || null,
      companyData.city || null,
      companyData.state || null,
      companyData.country || 'India',
      companyData.postal_code || null,
      companyData.employee_count || null,
      companyData.annual_revenue || null,
      companyData.currency || 'INR',
      companyData.business_description || null,
      companyData.primary_contact_name || null,
      companyData.primary_contact_designation || null,
      companyData.primary_contact_phone || null,
      companyData.primary_contact_email || null,
      companyData.gst_number || null,
      companyData.pan_number || null,
      companyData.registration_number || null,
      companyData.tax_id || null,
      companyData.notes || null,
      companyData.tags || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Company updated successfully'
    });
    
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
export async function DELETE(request) {
  let connection;
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Company ID is required for deletion' },
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);

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

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });
    
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
