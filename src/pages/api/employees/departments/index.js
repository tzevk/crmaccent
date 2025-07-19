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
    console.error('Departments API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees/departments - Get all departments
async function handleGet(req, res) {
  const { search } = req.query;

  let query = `
    SELECT 
      d.*,
      CONCAT(e.first_name, ' ', e.last_name) as head_name,
      COUNT(emp.id) as employee_count
    FROM 
      departments d
    LEFT JOIN 
      employees e ON d.head_id = e.id
    LEFT JOIN
      employees emp ON emp.department = d.name
    WHERE 1=1
  `;
  
  const params = [];

  if (search) {
    query += ' AND (d.name LIKE ? OR d.description LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  query += ' GROUP BY d.id ORDER BY d.name ASC';

  const departments = await executeQuery(query, params);
  
  return res.status(200).json({
    departments,
    message: 'Departments retrieved successfully'
  });
}

// POST /api/employees/departments - Create a new department
async function handlePost(req, res) {
  const { name, description, head_id } = req.body;
  
  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  // Check if department already exists
  const existingDept = await executeQuery('SELECT id FROM departments WHERE name = ?', [name]);
  if (existingDept.length > 0) {
    return res.status(400).json({ message: 'Department with this name already exists' });
  }
  
  // If head_id is provided, check if it's valid
  if (head_id) {
    const headEmployee = await executeQuery('SELECT id FROM employees WHERE id = ?', [head_id]);
    if (headEmployee.length === 0) {
      return res.status(400).json({ message: 'Invalid department head ID' });
    }
  }

  // Create department
  const query = 'INSERT INTO departments (name, description, head_id) VALUES (?, ?, ?)';
  const params = [name, description || null, head_id || null];

  const result = await executeQuery(query, params);
  
  if (result.insertId) {
    const newDepartment = await executeQuery('SELECT * FROM departments WHERE id = ?', [result.insertId]);
    
    return res.status(201).json({
      message: 'Department created successfully',
      department: newDepartment[0]
    });
  }
  
  return res.status(500).json({ message: 'Failed to create department' });
}
