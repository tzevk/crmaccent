import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Designations API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees/designations - Get all designations
async function handleGet(req, res) {
  const { search, department_id } = req.query;

  let query = `
    SELECT 
      d.*,
      dept.name as department_name,
      COUNT(e.id) as employee_count
    FROM 
      designations d
    LEFT JOIN 
      departments dept ON d.department_id = dept.id
    LEFT JOIN
      employees e ON e.designation = d.title
    WHERE 1=1
  `;
  
  const params = [];

  if (search) {
    query += ' AND (d.title LIKE ? OR d.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  if (department_id) {
    query += ' AND d.department_id = ?';
    params.push(department_id);
  }

  query += ' GROUP BY d.id ORDER BY d.title ASC';

  const designations = await executeQuery(query, params);
  
  // Get departments for filtering
  const departments = await executeQuery('SELECT id, name FROM departments ORDER BY name ASC');
  
  return res.status(200).json({
    designations,
    departments,
    message: 'Designations retrieved successfully'
  });
}

// POST /api/employees/designations - Create a new designation
async function handlePost(req, res) {
  const { title, department_id, level, description } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ message: 'Designation title is required' });
  }

  // Check if designation already exists
  const existingDesignation = await executeQuery('SELECT id FROM designations WHERE title = ?', [title]);
  if (existingDesignation.length > 0) {
    return res.status(400).json({ message: 'Designation with this title already exists' });
  }
  
  // If department_id is provided, check if it's valid
  if (department_id) {
    const department = await executeQuery('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (department.length === 0) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }
  }

  // Create designation
  const query = 'INSERT INTO designations (title, department_id, level, description) VALUES (?, ?, ?, ?)';
  const params = [title, department_id || null, level || null, description || null];

  const result = await executeQuery(query, params);
  
  if (result.insertId) {
    const newDesignation = await executeQuery(`
      SELECT 
        d.*,
        dept.name as department_name
      FROM 
        designations d
      LEFT JOIN 
        departments dept ON d.department_id = dept.id
      WHERE 
        d.id = ?
    `, [result.insertId]);
    
    return res.status(201).json({
      message: 'Designation created successfully',
      designation: newDesignation[0]
    });
  }
  
  return res.status(500).json({ message: 'Failed to create designation' });
}
