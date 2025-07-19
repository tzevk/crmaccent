import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  // Validate ID
  if (!id || isNaN(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res, id);
      case 'PUT':
        return await handlePut(req, res, id);
      case 'DELETE':
        return await handleDelete(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Employee API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees/[id] - Get a specific employee
async function handleGet(req, res, id) {
  const query = `
    SELECT 
      e.*,
      d.name as department_name,
      des.title as designation_title
    FROM 
      employees e
    LEFT JOIN 
      departments d ON e.department = d.name
    LEFT JOIN 
      designations des ON e.designation = des.title
    WHERE 
      e.id = ?
  `;

  const employee = await executeQuery(query, [id]);
  
  if (employee.length === 0) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  return res.status(200).json({ 
    success: true,
    employee: employee[0] 
  });
}

// PUT /api/employees/[id] - Update a specific employee
async function handlePut(req, res, id) {
  const {
    first_name,
    last_name,
    email,
    phone,
    designation,
    department,
    username,
    password,
    role,
    status,
    hire_date,
    salary,
    address,
    date_of_birth,
    emergency_contact,
    profile_image
  } = req.body;

  // Check if employee exists
  const existingEmployee = await executeQuery('SELECT * FROM employees WHERE id = ?', [id]);
  if (existingEmployee.length === 0) {
    return res.status(404).json({ 
      success: false,
      message: 'Employee not found' 
    });
  }

  // Validation
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ 
      success: false,
      message: 'First name, last name, and email are required' 
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email format' 
    });
  }

  // Check if email already exists (excluding current employee)
  const emailCheck = await executeQuery(
    'SELECT id FROM employees WHERE email = ? AND id != ?', 
    [email, id]
  );
  if (emailCheck.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Email already in use by another employee' 
    });
  }

  // Check if username already exists (excluding current employee, if username provided)
  if (username) {
    const usernameCheck = await executeQuery(
      'SELECT id FROM employees WHERE username = ? AND id != ?', 
      [username, id]
    );
    if (usernameCheck.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already in use by another employee' 
      });
    }
  }

  // Build update query dynamically
  const updateFields = [];
  const params = [];

  if (first_name !== undefined) {
    updateFields.push('first_name = ?');
    params.push(first_name);
  }
  if (last_name !== undefined) {
    updateFields.push('last_name = ?');
    params.push(last_name);
  }
  if (email !== undefined) {
    updateFields.push('email = ?');
    params.push(email);
  }
  if (phone !== undefined) {
    updateFields.push('phone = ?');
    params.push(phone);
  }
  if (designation !== undefined) {
    updateFields.push('designation = ?');
    params.push(designation);
  }
  if (department !== undefined) {
    updateFields.push('department = ?');
    params.push(department);
  }
  if (username !== undefined) {
    updateFields.push('username = ?');
    params.push(username);
  }
  if (password !== undefined) {
    updateFields.push('password = ?');
    params.push(password);
  }
  if (role !== undefined) {
    updateFields.push('role = ?');
    params.push(role);
  }
  if (status !== undefined) {
    updateFields.push('status = ?');
    params.push(status);
  }
  if (hire_date !== undefined) {
    updateFields.push('hire_date = ?');
    params.push(hire_date);
  }
  if (salary !== undefined) {
    updateFields.push('salary = ?');
    params.push(salary);
  }
  if (address !== undefined) {
    updateFields.push('address = ?');
    params.push(address);
  }
  if (date_of_birth !== undefined) {
    updateFields.push('date_of_birth = ?');
    params.push(date_of_birth);
  }
  if (emergency_contact !== undefined) {
    updateFields.push('emergency_contact = ?');
    params.push(emergency_contact);
  }
  if (profile_image !== undefined) {
    updateFields.push('profile_image = ?');
    params.push(profile_image);
  }

  // Always update the updated_at timestamp
  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`;

  const result = await executeQuery(query, params);
  
  if (result.affectedRows > 0) {
    // Get the updated employee
    const updatedEmployee = await executeQuery(
      `SELECT 
        e.*,
        d.name as department_name,
        des.title as designation_title
      FROM 
        employees e
      LEFT JOIN 
        departments d ON e.department = d.name
      LEFT JOIN 
        designations des ON e.designation = des.title
      WHERE 
        e.id = ?`, 
      [id]
    );
    
    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee[0]
    });
  } else {
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update employee' 
    });
  }
}

// DELETE /api/employees/[id] - Delete a specific employee
async function handleDelete(req, res, id) {
  // Check if employee exists
  const existingEmployee = await executeQuery('SELECT * FROM employees WHERE id = ?', [id]);
  if (existingEmployee.length === 0) {
    return res.status(404).json({ 
      success: false,
      message: 'Employee not found' 
    });
  }

  // Check if employee is referenced in other tables (projects, etc.)
  const projectReferences = await executeQuery(
    'SELECT COUNT(*) as count FROM project_team WHERE user_id = ?', 
    [id]
  );
  
  if (projectReferences[0].count > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Cannot delete employee: Referenced in active projects. Please reassign or remove from projects first.' 
    });
  }

  // Soft delete - update status to 'inactive' instead of hard delete
  const result = await executeQuery(
    'UPDATE employees SET status = ?, updated_at = NOW() WHERE id = ?', 
    ['inactive', id]
  );
  
  if (result.affectedRows > 0) {
    return res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } else {
    return res.status(500).json({ 
      success: false,
      message: 'Failed to deactivate employee' 
    });
  }
}
