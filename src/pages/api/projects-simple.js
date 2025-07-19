import { executeQuery } from '../../lib/db.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const projects = await executeQuery('SELECT * FROM projects LIMIT 10');
      res.status(200).json({ projects });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
