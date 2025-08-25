import { getDb } from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection with:');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    
    const db = getDb();
    const connection = await db.getConnection();
    
    // Test basic connection
    await connection.ping();
    
    // Test query execution
    const [rows] = await connection.execute('SELECT 1 as test');
    
    connection.release();
    
    return Response.json({ 
      status: 'success',
      message: 'Database connection successful',
      testQuery: rows[0],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Detailed database error:', error);
    
    let errorDetails = {
      status: 'error',
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      timestamp: new Date().toISOString()
    };
    
    // Provide specific guidance based on error type
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorDetails.suggestion = 'Access denied. Check username, password, and IP whitelist in your database server.';
    } else if (error.code === 'ECONNREFUSED') {
      errorDetails.suggestion = 'Connection refused. Check if the database server is running and accessible.';
    } else if (error.code === 'ETIMEDOUT') {
      errorDetails.suggestion = 'Connection timeout. Check network connectivity and firewall settings.';
    } else if (error.code === 'ENOTFOUND') {
      errorDetails.suggestion = 'Host not found. Check the database host address.';
    }
    
    return Response.json(errorDetails, { status: 500 });
  }
}
