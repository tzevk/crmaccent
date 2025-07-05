import { executeQuery } from '../../lib/db';
import { getAllUsers } from '../../lib/dummy-data';

// Demo mode flag
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (DEMO_MODE) {
    // Return demo data
    const dummyUsers = getAllUsers();
    return res.status(200).json({ 
      message: 'Demo mode - using dummy data',
      mode: 'DEMO',
      users: dummyUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      })),
      timestamp: new Date().toISOString(),
      note: 'In demo mode. Set DEMO_MODE=false in environment to use real database.'
    });
  }

  try {
    console.log('Testing database connection...');
    
    // Test the database connection and show tables
    const basicTest = await executeQuery('SELECT 1 as test');
    const tables = await executeQuery('SHOW TABLES');
    
    if (basicTest && basicTest.length > 0) {
      return res.status(200).json({ 
        message: 'Database connection successful',
        mode: 'PRODUCTION',
        basicTest: basicTest[0],
        tables: tables,
        timestamp: new Date().toISOString(),
        config: {
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          port: process.env.DB_PORT
        }
      });
    } else {
      return res.status(500).json({ 
        message: 'Database connection failed - no results returned'
      });
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      message: 'Database connection failed',
      mode: 'PRODUCTION',
      error: error.message,
      code: error.code,
      sqlState: error.sqlState,
      config: {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: process.env.DB_PORT
      }
    });
  }
}
