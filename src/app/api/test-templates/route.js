import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  let connection;
  try {
    const db = getDb();
    connection = await db.getConnection();

    // Test the database connection and check if tables exist
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'proposal_templates'
    `);

    const [sections_tables] = await connection.query(`
      SHOW TABLES LIKE 'proposal_template_sections'
    `);

    const tablesExist = {
      proposal_templates: tables.length > 0,
      proposal_template_sections: sections_tables.length > 0
    };

    let templateCount = 0;
    if (tablesExist.proposal_templates) {
      const [count] = await connection.query('SELECT COUNT(*) as count FROM proposal_templates');
      templateCount = count[0].count;
    }

    return NextResponse.json({
      success: true,
      database_connected: true,
      tables_exist: tablesExist,
      template_count: templateCount,
      message: 'Database connection successful'
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      database_connected: false,
      error: error.message,
      message: 'Database connection failed'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
