import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all table schemas
    const tables = ['projects', 'tasks', 'disciplines', 'activities', 'statuses'];
    const schemas = {};

    for (const table of tables) {
      try {
        const schema = await executeQuery(`DESCRIBE ${table}`);
        schemas[`${table}_schema`] = schema;
      } catch (error) {
        schemas[`${table}_error`] = error.message;
      }
    }

    return res.status(200).json({
      success: true,
      ...schemas
    });
  } catch (error) {
    console.error('Schema check error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
