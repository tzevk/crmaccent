import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all departments
      const departments = await executeQuery('SELECT * FROM departments ORDER BY name');
      
      res.status(200).json({
        success: true,
        departments
      });
    } catch (error) {
      console.error('Departments API Error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error', 
        error: error.message 
      });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
