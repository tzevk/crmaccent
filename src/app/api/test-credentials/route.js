import mysql from 'mysql2/promise';

export async function POST(request) {
  try {
    const { username, password, host, port, database } = await request.json();
    
    // Test the provided credentials
    const testConfig = {
      host: host || process.env.DB_HOST,
      port: parseInt(port) || parseInt(process.env.DB_PORT) || 3306,
      user: username || process.env.DB_USER,
      password: password || process.env.DB_PASSWORD,
      database: database || process.env.DB_NAME,
      connectTimeout: 10000,
      acquireTimeout: 10000,
    };
    
    console.log('Testing credentials:', {
      ...testConfig,
      password: '***HIDDEN***'
    });
    
    const connection = await mysql.createConnection(testConfig);
    const [result] = await connection.execute('SELECT USER() as user, DATABASE() as db, CONNECTION_ID() as connection_id');
    await connection.end();
    
    return Response.json({
      status: 'SUCCESS ✅',
      message: 'Database connection successful!',
      result: result[0],
      testedConfig: {
        ...testConfig,
        password: '***HIDDEN***'
      }
    });
    
  } catch (error) {
    return Response.json({
      status: 'FAILED ❌',
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      suggestion: getErrorSuggestion(error.code)
    }, { status: 400 });
  }
}

function getErrorSuggestion(code) {
  switch (code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Check if username and password are correct. Verify the user exists and has proper permissions.';
    case 'ER_BAD_DB_ERROR':
      return 'Database does not exist. Check the database name.';
    case 'ECONNREFUSED':
      return 'Cannot connect to database server. Check host and port.';
    case 'ETIMEDOUT':
      return 'Connection timeout. Check network connectivity.';
    default:
      return 'Unknown database error.';
  }
}

export async function GET() {
  return Response.json({
    message: 'POST to this endpoint with credentials to test',
    example: {
      method: 'POST',
      body: {
        username: 'your_username',
        password: 'your_password',
        host: 'your_host',
        port: 3306,
        database: 'your_database'
      }
    }
  });
}
