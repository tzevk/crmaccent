import { executeQuery } from '../../../lib/db';

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
    console.error('Employees API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/employees - Get all employees with filtering options
async function handleGet(req, res) {
  const { 
    department, 
    status,
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'id',
    sortOrder = 'ASC'
  } = req.query;

  let query = `
    SELECT 
      e.*,
      d.name as department_name,
      des.title as designation_name
    FROM 
      employees e
    LEFT JOIN 
      departments d ON e.department = d.name
    LEFT JOIN 
      designations des ON e.designation = des.title
    WHERE 1=1
  `;
  
  const params = [];

  // Add filters
  if (department) {
    query += ' AND e.department = ?';
    params.push(department);
  }

  if (status) {
    query += ' AND e.status = ?';
    params.push(status);
  }

  if (search) {
    query += ` AND (
      e.employee_id LIKE ? OR 
      e.first_name LIKE ? OR 
      e.last_name LIKE ? OR
      e.email LIKE ? OR
      e.department LIKE ? OR
      e.designation LIKE ?
    )`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // Add sorting
  const allowedSortFields = ['id', 'first_name', 'last_name', 'email', 'department', 'designation', 'hire_date', 'created_at'];
  const allowedSortOrders = ['ASC', 'DESC'];
  
  if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
    query += ` ORDER BY e.${sortBy} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY e.id ASC';
  }

  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const employees = await executeQuery(query, params);

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total
    FROM employees e
    WHERE 1=1
    ${department ? ' AND e.department = ?' : ''}
    ${status ? ' AND e.status = ?' : ''}
    ${search ? ` AND (
      e.employee_id LIKE ? OR 
      e.first_name LIKE ? OR 
      e.last_name LIKE ? OR
      e.email LIKE ? OR
      e.department LIKE ? OR
      e.designation LIKE ?
    )` : ''}
  `;
  
  const countParams = [];
  if (department) countParams.push(department);
  if (status) countParams.push(status);
  if (search) {
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }

  const countResult = await executeQuery(countQuery, countParams);
  const totalCount = countResult[0].total;

  // Fetch departments list for filtering
  const departments = await executeQuery('SELECT DISTINCT name FROM departments ORDER BY name ASC');

  // Fetch designations list for filtering
  const designations = await executeQuery('SELECT DISTINCT title FROM designations ORDER BY title ASC');
  
  return res.status(200).json({
    success: true,
    employees,
    departments: departments.map(d => d.name),
    designations: designations.map(d => d.title),
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPreviousPage: parseInt(page) > 1
    }
  });
}

// POST /api/employees - Create a new employee
async function handlePost(req, res) {
  const {
    first_name,
    last_name,
    email,
    phone,
    designation,
    department,
    username,
    password,
    role = 'employee',
    status = 'active',
    hire_date,
    salary,
    address,
    date_of_birth,
    emergency_contact,
    profile_image,
    created_by
  } = req.body;
  
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
  
  // Check if email already exists
  const emailCheck = await executeQuery('SELECT id FROM employees WHERE email = ?', [email]);
  if (emailCheck.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: 'Email already in use by another employee' 
    });
  }
  
  // Check if username already exists (if provided)
  if (username) {
    const usernameCheck = await executeQuery('SELECT id FROM employees WHERE username = ?', [username]);
    if (usernameCheck.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Username already in use by another employee' 
      });
    }
  }

  // Generate employee ID
  const year = new Date().getFullYear();
  const employeeIdResult = await executeQuery(
    'SELECT COUNT(*) as count FROM employees WHERE employee_id LIKE ?', 
    [`EMP-${year}-%`]
  );
  const nextNumber = (employeeIdResult[0].count + 1).toString().padStart(4, '0');
  const employee_id = `EMP-${year}-${nextNumber}`;

  // Insert the new employee
  const query = `
    INSERT INTO employees (
      employee_id, first_name, last_name, email, phone, designation, department, 
      username, password, role, status, hire_date, salary, address, date_of_birth, 
      emergency_contact, profile_image, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const params = [
    employee_id, first_name, last_name, email, phone || null, 
    designation || null, department || null, username || null,
    password || null, role, status, hire_date || null, 
    salary || null, address || null, date_of_birth || null,
    emergency_contact || null, profile_image || null, created_by || null
  ];

  const result = await executeQuery(query, params);
  
  if (result.insertId) {
    // Get the created employee with joined data
    const newEmployee = await executeQuery(
      `SELECT 
        e.*,
        d.name as department_name,
        des.title as designation_name
      FROM 
        employees e
      LEFT JOIN 
        departments d ON e.department = d.name
      LEFT JOIN 
        designations des ON e.designation = des.title
      WHERE 
        e.id = ?`, 
      [result.insertId]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: newEmployee[0]
    });
  } else {
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create employee' 
    });
  }
}