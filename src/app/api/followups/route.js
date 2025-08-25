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

export async function POST(request) {
  let connection;
  
  try {
    const followupData = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Insert new follow-up
      const [result] = await connection.execute(`
        INSERT INTO followups (
          lead_id,
          followup_date,
          description,
          next_action,
          created_by,
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `, [
        followupData.lead_id,
        followupData.followup_date,
        followupData.description,
        followupData.next_action || null,
        followupData.created_by || 1
      ]);

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Follow-up added successfully',
        followup_id: result.insertId
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }
    
  } catch (error) {
    console.error('Error adding follow-up:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to add follow-up' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function GET(request) {
  let connection;
  
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    
    connection = await mysql.createConnection(dbConfig);
    
    let query = `
      SELECT f.*, u.name as created_by_name
      FROM followups f
      LEFT JOIN users u ON f.created_by = u.id
    `;
    let params = [];
    
    if (leadId) {
      query += ' WHERE f.lead_id = ?';
      params.push(leadId);
    }
    
    query += ' ORDER BY f.followup_date DESC';
    
    const [followups] = await connection.execute(query, params);

    return NextResponse.json(followups);
    
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
