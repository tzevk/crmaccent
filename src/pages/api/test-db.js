import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Test database connection by running a simple query
    console.log('Testing database connection...');
    const testQuery = 'SELECT 1 as test_value';
    const result = await executeQuery(testQuery);
    
    // Also check if users table exists and count users
    const countQuery = 'SELECT COUNT(*) as user_count FROM users';
    const countResult = await executeQuery(countQuery);
    const userCount = countResult[0].user_count;

    return res.status(200).json({
      message: 'Database connection successful',
      mode: 'PRODUCTION',
      connection: 'OK',
      user_count: userCount,
      timestamp: new Date().toISOString(),
      test_result: result[0]
    });

  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({
      message: 'Database connection failed',
      mode: 'PRODUCTION',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
