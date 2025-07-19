import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create companies table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        postal_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'India',
        website VARCHAR(255),
        industry VARCHAR(100),
        
        -- Business details
        registration_number VARCHAR(50),
        tax_id VARCHAR(50),
        company_type ENUM('private', 'public', 'partnership', 'llc', 'sole_proprietorship') DEFAULT 'private',
        established_date DATE,
        employees_count INT,
        
        -- Contact person
        contact_person_name VARCHAR(100),
        contact_person_email VARCHAR(100),
        contact_person_phone VARCHAR(20),
        contact_person_designation VARCHAR(100),
        
        -- System fields
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_name (name),
        INDEX idx_email (email),
        INDEX idx_city (city),
        INDEX idx_status (status)
      )
    `);

    // Insert some default companies for testing
    const defaultCompanies = [
      {
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        phone: '+1-555-0101',
        city: 'San Francisco',
        state: 'California',
        country: 'USA',
        industry: 'Technology'
      },
      {
        name: 'Global Manufacturing Ltd.',
        email: 'info@globalmanufacturing.com',
        phone: '+44-20-1234-5678',
        city: 'London',
        country: 'UK',
        industry: 'Manufacturing'
      },
      {
        name: 'Healthcare Partners',
        email: 'admin@healthcarepartners.com',
        phone: '+1-555-0202',
        city: 'New York',
        state: 'New York',
        country: 'USA',
        industry: 'Healthcare'
      }
    ];

    for (const company of defaultCompanies) {
      // Check if company already exists
      const existing = await executeQuery('SELECT id FROM companies WHERE name = ?', [company.name]);
      if (existing.length === 0) {
        await executeQuery(`
          INSERT INTO companies (name, email, phone, city, state, country, industry) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          company.name,
          company.email,
          company.phone,
          company.city,
          company.state,
          company.country,
          company.industry
        ]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Companies system initialized successfully',
      details: {
        tablesCreated: ['companies'],
        defaultDataInserted: true,
        indexesCreated: true
      }
    });
    
  } catch (error) {
    console.error('Companies system initialization error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to initialize companies system', 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}
