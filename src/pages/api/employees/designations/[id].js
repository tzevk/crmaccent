import { executeQuery } from '../../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'Invalid designation ID' });
  }

  const designationId = parseInt(id);

  try {
    switch (method) {
      case 'GET':
        return await handleGet(designationId, res);
      case 'PUT':
        return await handlePut(designationId, req, res);
      case 'DELETE':
        return await handleDelete(designationId, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Designation [${id}] API Error:`, error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees/designations/[id] - Get a single designation
async function handleGet(id, res) {
  // Get the designation
  const designationQuery = `
    SELECT 
      d.*,
      dept.name as department_name
    FROM 
      designations d
    LEFT JOIN 
      departments dept ON d.department_id = dept.id
    WHERE 
      d.id = ?
  `;
  
  const designation = await executeQuery(designationQuery, [id]);
  
  if (designation.length === 0) {
    return res.status(404).json({ message: 'Designation not found' });
  }

  // Get employees with this designation
  const employeesQuery = `
    SELECT 
      id, employee_id, first_name, last_name, email, department, join_date, employment_status
    FROM 
      employees
    WHERE 
      designation = ?
    ORDER BY 
      first_name, last_name
  `;
  
  const employees = await executeQuery(employeesQuery, [designation[0].title]);

  return res.status(200).json({
    designation: designation[0],
    employees,
    employee_count: employees.length
  });
}

// PUT /api/employees/designations/[id] - Update a designation
async function handlePut(id, req, res) {
  const { title, department_id, level, description } = req.body;
  
  // Validation
  if (!title) {
    return res.status(400).json({ message: 'Designation title is required' });
  }

  // Check if designation exists
  const existingDesignation = await executeQuery('SELECT * FROM designations WHERE id = ?', [id]);
  if (existingDesignation.length === 0) {
    return res.status(404).json({ message: 'Designation not found' });
  }

  // Check if the title is already in use by another designation
  const titleCheck = await executeQuery('SELECT id FROM designations WHERE title = ? AND id != ?', [title, id]);
  if (titleCheck.length > 0) {
    return res.status(400).json({ message: 'Designation title already in use' });
  }
  
  // If department_id is provided, check if it's valid
  if (department_id) {
    const department = await executeQuery('SELECT id FROM departments WHERE id = ?', [department_id]);
    if (department.length === 0) {
      return res.status(400).json({ message: 'Invalid department ID' });
    }
  }
  
  // Update the designation
  const query = 'UPDATE designations SET title = ?, department_id = ?, level = ?, description = ? WHERE id = ?';
  const params = [title, department_id || null, level || null, description || null, id];

  const result = await executeQuery(query, params);
  
  if (result.affectedRows > 0) {
    // If designation title has changed, update all employee records with the new title
    if (title !== existingDesignation[0].title) {
      await executeQuery(
        'UPDATE employees SET designation = ? WHERE designation = ?',
        [title, existingDesignation[0].title]
      );
    }
    
    // Get the updated designation
    const updatedDesignation = await executeQuery(`
      SELECT 
        d.*,
        dept.name as department_name
      FROM 
        designations d
      LEFT JOIN 
        departments dept ON d.department_id = dept.id
      WHERE 
        d.id = ?
    `, [id]);
    
    return res.status(200).json({
      message: 'Designation updated successfully',
      designation: updatedDesignation[0]
    });
  }
  
  return res.status(500).json({ message: 'Failed to update designation' });
}

// DELETE /api/employees/designations/[id] - Delete a designation
async function handleDelete(id, res) {
  // Check if designation exists
  const designation = await executeQuery('SELECT * FROM designations WHERE id = ?', [id]);
  if (designation.length === 0) {
    return res.status(404).json({ message: 'Designation not found' });
  }

  // Check if there are employees with this designation
  const employeesCount = await executeQuery(
    'SELECT COUNT(*) as count FROM employees WHERE designation = ?', 
    [designation[0].title]
  );
  
  if (employeesCount[0].count > 0) {
    return res.status(400).json({ 
      message: `Cannot delete designation: ${employeesCount[0].count} employee(s) have this designation` 
    });
  }

  // Delete the designation
  const result = await executeQuery('DELETE FROM designations WHERE id = ?', [id]);
  
  if (result.affectedRows > 0) {
    return res.status(200).json({
      message: 'Designation deleted successfully',
    });
  }
  
  return res.status(500).json({ message: 'Failed to delete designation' });
}
