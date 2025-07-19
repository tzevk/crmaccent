import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  const departmentId = parseInt(id);

  try {
    switch (method) {
      case 'GET':
        return await handleGet(departmentId, res);
      case 'PUT':
        return await handlePut(departmentId, req, res);
      case 'DELETE':
        return await handleDelete(departmentId, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Department [${id}] API Error:`, error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees/departments/[id] - Get a single department
async function handleGet(id, res) {
  // Get the department
  const departmentQuery = `
    SELECT 
      d.*,
      CONCAT(e.first_name, ' ', e.last_name) as head_name
    FROM 
      departments d
    LEFT JOIN 
      employees e ON d.head_id = e.id
    WHERE 
      d.id = ?
  `;
  
  const department = await executeQuery(departmentQuery, [id]);
  
  if (department.length === 0) {
    return res.status(404).json({ message: 'Department not found' });
  }

  // Get employees in this department
  const employeesQuery = `
    SELECT 
      id, employee_id, first_name, last_name, email, designation, join_date, employment_status
    FROM 
      employees
    WHERE 
      department = ?
    ORDER BY 
      first_name, last_name
  `;
  
  const employees = await executeQuery(employeesQuery, [department[0].name]);

  return res.status(200).json({
    department: department[0],
    employees,
    employee_count: employees.length
  });
}

// PUT /api/employees/departments/[id] - Update a department
async function handlePut(id, req, res) {
  const { name, description, head_id } = req.body;
  
  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  // Check if department exists
  const existingDept = await executeQuery('SELECT * FROM departments WHERE id = ?', [id]);
  if (existingDept.length === 0) {
    return res.status(404).json({ message: 'Department not found' });
  }

  // Check if the name is already in use by another department
  const nameCheck = await executeQuery('SELECT id FROM departments WHERE name = ? AND id != ?', [name, id]);
  if (nameCheck.length > 0) {
    return res.status(400).json({ message: 'Department name already in use' });
  }
  
  // If head_id is provided, check if it's valid
  if (head_id) {
    const headEmployee = await executeQuery('SELECT id FROM employees WHERE id = ?', [head_id]);
    if (headEmployee.length === 0) {
      return res.status(400).json({ message: 'Invalid department head ID' });
    }
  }
  
  // Update the department
  const query = 'UPDATE departments SET name = ?, description = ?, head_id = ? WHERE id = ?';
  const params = [name, description || null, head_id || null, id];

  const result = await executeQuery(query, params);
  
  if (result.affectedRows > 0) {
    // If department name has changed, update all employee records with the new name
    if (name !== existingDept[0].name) {
      await executeQuery(
        'UPDATE employees SET department = ? WHERE department = ?',
        [name, existingDept[0].name]
      );
    }
    
    // Get the updated department
    const updatedDepartment = await executeQuery(`
      SELECT 
        d.*,
        CONCAT(e.first_name, ' ', e.last_name) as head_name
      FROM 
        departments d
      LEFT JOIN 
        employees e ON d.head_id = e.id
      WHERE 
        d.id = ?
    `, [id]);
    
    return res.status(200).json({
      message: 'Department updated successfully',
      department: updatedDepartment[0]
    });
  }
  
  return res.status(500).json({ message: 'Failed to update department' });
}

// DELETE /api/employees/departments/[id] - Delete a department
async function handleDelete(id, res) {
  // Check if department exists
  const department = await executeQuery('SELECT * FROM departments WHERE id = ?', [id]);
  if (department.length === 0) {
    return res.status(404).json({ message: 'Department not found' });
  }

  // Check if there are employees in this department
  const employeesCount = await executeQuery(
    'SELECT COUNT(*) as count FROM employees WHERE department = ?', 
    [department[0].name]
  );
  
  if (employeesCount[0].count > 0) {
    return res.status(400).json({ 
      message: `Cannot delete department: ${employeesCount[0].count} employee(s) are assigned to this department` 
    });
  }

  // Delete the department
  const result = await executeQuery('DELETE FROM departments WHERE id = ?', [id]);
  
  if (result.affectedRows > 0) {
    return res.status(200).json({
      message: 'Department deleted successfully',
    });
  }
  
  return res.status(500).json({ message: 'Failed to delete department' });
}
