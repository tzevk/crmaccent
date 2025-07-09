import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await handleGet(req, res);
  } else if (req.method === 'POST') {
    return await handlePost(req, res);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleGet(req, res) {
  try {
    // Get companies with project counts using client_id field from projects table
    const companies = await executeQuery(`
      SELECT 
        c.id, 
        c.name,
        c.email,
        c.phone,
        c.address,
        c.city,
        c.state,
        c.postal_code,
        c.country,
        c.website,
        c.industry,
        c.created_at,
        (SELECT COUNT(*) FROM projects WHERE client_id = c.id) AS projects_count
      FROM companies c
      ORDER BY c.name ASC
    `);

    return res.status(200).json({
      companies,
      count: companies.length
    });
  } catch (error) {
    // Handle error silently in production
    return res.status(500).json({ 
      message: 'Failed to fetch companies', 
      error: error.message 
    });
  }
}

async function handlePost(req, res) {
  try {
    const { 
      name, 
      email, 
      phone, 
      address, 
      city, 
      state, 
      postal_code, 
      country, 
      website, 
      industry, 
      created_by 
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    // Insert new company with all fields
    const result = await executeQuery(
      `INSERT INTO companies (
        name,
        email,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        website,
        industry,
        created_by,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phone, address, city, state, postal_code, country, website, industry, created_by]
    );

    return res.status(201).json({
      message: 'Company created successfully',
      id: result.insertId
    });
  } catch (error) {
    // Handle error silently in production
    return res.status(500).json({ 
      message: 'Failed to create company', 
      error: error.message 
    });
  }
}
