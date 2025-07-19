import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all companies ordered by name
      const companies = await executeQuery('SELECT * FROM companies ORDER BY name');
      
      res.status(200).json({
        success: true,
        companies
      });
    } catch (error) {
      console.error('Companies API Error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error', 
        error: error.message 
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, email, phone, address, city, state, postal_code, country, website, industry, created_by } = req.body;
      
      // Validation
      if (!name) {
        return res.status(400).json({ 
          success: false,
          message: 'Company name is required' 
        });
      }

      // Check if company already exists
      const existingCompany = await executeQuery('SELECT id FROM companies WHERE name = ?', [name]);
      if (existingCompany.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Company with this name already exists',
          existingCompany: existingCompany[0]
        });
      }

      // Create new company
      const insertQuery = `
        INSERT INTO companies (name, email, phone, address, city, state, postal_code, country, website, industry, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        name,
        email || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        postal_code || null,
        country || null,
        website || null,
        industry || null,
        created_by || null
      ];

      const result = await executeQuery(insertQuery, params);
      
      if (result.insertId) {
        // Get the created company
        const newCompany = await executeQuery('SELECT * FROM companies WHERE id = ?', [result.insertId]);
        
        return res.status(201).json({
          success: true,
          message: 'Company created successfully',
          company: newCompany[0]
        });
      } else {
        return res.status(500).json({ 
          success: false,
          message: 'Failed to create company' 
        });
      }
      
    } catch (error) {
      console.error('Companies POST Error:', error);
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
