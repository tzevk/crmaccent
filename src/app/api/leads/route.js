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

export async function GET(request) {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // Get all leads with joined data for better display
    const [leads] = await connection.execute(`
      SELECT 
        l.*,
        c.name as company_master_name,
        ct.name as city_master_name,
        u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN companies c ON l.company_id = c.id
      LEFT JOIN cities ct ON l.city_id = ct.id  
      LEFT JOIN users u ON l.assigned_to = u.id
      ORDER BY l.created_at DESC
    `);

    return NextResponse.json(leads);
    
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request) {
  let connection;
  
  try {
    const leadData = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Generate enquiry number
      const currentYear = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-6);
      const enquiryNo = `ENQ-${currentYear}-${timestamp}`;

      // Insert new lead
      const [result] = await connection.execute(`
        INSERT INTO leads (
          enquiry_no,
          year,
          enquiry_date,
          enquiry_type,
          source,
          company_name,
          city,
          industry,
          contact_name,
          designation,
          mobile,
          email,
          address,
          project_name,
          project_description,
          estimated_value,
          estimated_duration,
          currency,
          enquiry_status,
          project_status,
          lead_stage,
          assigned_to,
          remarks,
          created_by,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        enquiryNo,
        currentYear,
        leadData.enquiry_date || new Date().toISOString().split('T')[0],
        leadData.enquiry_type || 'Direct',
        leadData.source || null,
        leadData.company_name,
        leadData.city || null,
        leadData.industry || null,
        leadData.contact_name,
        leadData.designation || null,
        leadData.mobile || null,
        leadData.email || null,
        leadData.address || null,
        leadData.project_name || null,
        leadData.project_description || null,
        leadData.estimated_value || 0,
        leadData.estimated_duration || null,
        leadData.currency || 'INR',
        leadData.enquiry_status || 'New',
        leadData.project_status || 'Pending',
        leadData.lead_stage || 'New',
        leadData.assigned_to || null,
        leadData.remarks || null,
        leadData.created_by || 1
      ]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Lead created successfully',
        lead_id: result.insertId,
        enquiry_no: enquiryNo
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to create lead' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(request) {
  let connection;
  
  try {
    const leadData = await request.json();
    const { id } = leadData;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required for update' },
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);

    // Update lead
    const [result] = await connection.execute(`
      UPDATE leads SET
        enquiry_type = ?,
        source = ?,
        company_name = ?,
        city = ?,
        industry = ?,
        contact_name = ?,
        designation = ?,
        mobile = ?,
        email = ?,
        address = ?,
        project_name = ?,
        project_description = ?,
        estimated_value = ?,
        estimated_duration = ?,
        currency = ?,
        enquiry_status = ?,
        project_status = ?,
        lead_stage = ?,
        assigned_to = ?,
        remarks = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      leadData.enquiry_type || 'Direct',
      leadData.source || null,
      leadData.company_name,
      leadData.city || null,
      leadData.industry || null,
      leadData.contact_name,
      leadData.designation || null,
      leadData.mobile || null,
      leadData.email || null,
      leadData.address || null,
      leadData.project_name || null,
      leadData.project_description || null,
      leadData.estimated_value || 0,
      leadData.estimated_duration || null,
      leadData.currency || 'INR',
      leadData.enquiry_status || 'New',
      leadData.project_status || 'Pending',
      leadData.lead_stage || 'New',
      leadData.assigned_to || null,
      leadData.remarks || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(request) {
  let connection;
  
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required for deletion' },
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);

    // Delete lead
    const [result] = await connection.execute(
      'DELETE FROM leads WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
