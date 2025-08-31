import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection with a simple query
    const result = await query('SELECT 1 as test');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: result 
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: error.message 
      },
      { status: 500 }
    );
  }
}