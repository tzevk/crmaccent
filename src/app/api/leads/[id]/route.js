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

export async function GET(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    console.log('Fetching lead with ID:', id);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected for lead fetch');
    
    // Get specific lead with joined data
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
      WHERE l.id = ?
    `, [id]);

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    // Get follow-ups for this lead
    const [followups] = await connection.execute(`
      SELECT f.*, u.full_name as created_by_name
      FROM followups f
      LEFT JOIN users u ON f.created_by = u.id
      WHERE f.lead_id = ?
      ORDER BY f.followup_date DESC
    `, [id]);

    const leadData = {
      ...leads[0],
      followups: followups
    };

    return NextResponse.json(leadData);
    
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function PUT(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    const leadData = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Update lead data
      const [result] = await connection.execute(`
        UPDATE leads SET
          enquiry_date = ?,
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
        leadData.enquiry_date,
        leadData.enquiry_type,
        leadData.source,
        leadData.company_name,
        leadData.city,
        leadData.industry,
        leadData.contact_name,
        leadData.designation,
        leadData.mobile,
        leadData.email,
        leadData.address,
        leadData.project_name,
        leadData.project_description,
        leadData.estimated_value,
        leadData.estimated_duration,
        leadData.currency,
        leadData.enquiry_status,
        leadData.project_status,
        leadData.lead_stage,
        leadData.assigned_to,
        leadData.remarks,
        id
      ]);

      if (result.affectedRows === 0) {
        throw new Error('Lead not found');
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Lead updated successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to update lead' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function DELETE(request, { params }) {
  let connection;
  
  try {
    const { id } = await params;
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // First delete associated follow-ups
      await connection.execute('DELETE FROM followups WHERE lead_id = ?', [id]);
      
      // Then delete the lead
      const [result] = await connection.execute('DELETE FROM leads WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        throw new Error('Lead not found');
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Lead deleted successfully'
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to delete lead' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
