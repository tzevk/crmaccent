import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const companies = await executeQuery(
      'SELECT id, name FROM companies ORDER BY name ASC'
    );

    res.status(200).json({
      companies,
      count: companies.length
    });

  } catch (error) {
    console.error('Companies API error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch companies', 
      error: error.message 
    });
  }
}
