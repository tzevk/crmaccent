import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users with optional filtering
    try {
      const { role, status, search, department } = req.query;
      
      // First check which columns actually exist in the users table
      const tableInfo = await executeQuery(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
      `);
      
      const columnNames = tableInfo.map(col => col.COLUMN_NAME.toLowerCase());
      
      // Build the SELECT clause dynamically based on existing columns
      const baseColumns = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at', 'updated_at'];
      const optionalColumns = ['department', 'job_title', 'last_login_at'];
      
      const selectColumns = [
        ...baseColumns.filter(col => columnNames.includes(col.toLowerCase())),
        ...optionalColumns.filter(col => columnNames.includes(col.toLowerCase()))
      ];
      
      let query = `
        SELECT ${selectColumns.join(', ')}
        FROM users 
        WHERE 1=1
      `;
      
      let params = [];
      
      // Add filters conditionally
      if (role && ['admin', 'manager', 'user'].includes(role)) {
        query += ' AND role = ?';
        params.push(role);
      }
      
      if (status && ['active', 'inactive'].includes(status)) {
        const isActive = status === 'active' ? 1 : 0;
        query += ' AND is_active = ?';
        params.push(isActive);
      }
      
      if (department && columnNames.includes('department')) {
        query += ' AND department = ?';
        params.push(department);
      }
      
      if (search) {
        query += ` AND (
          username LIKE ? OR 
          email LIKE ? OR 
          first_name LIKE ? OR 
          last_name LIKE ? OR
          CONCAT(first_name, ' ', last_name) LIKE ?
        )`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
      }
      
      // Add sorting
      query += ' ORDER BY created_at DESC';
      
      const users = await executeQuery(query, params);
      
      return res.status(200).json({
        users: users,
        message: 'Users retrieved successfully'
      });
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({ message: 'Failed to retrieve users' });
    }
  }

  if (req.method === 'POST') {
    // Add new user
    const { username, email, first_name, last_name, role, password, department, job_title } = req.body;

    // Validation
    if (!username || !email || !first_name || !last_name || !role || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: username, email, first_name, last_name, role, password' 
      });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: admin, manager, user' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    try {
      // Check if username or email already exists
      const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const existingUsers = await executeQuery(checkQuery, [username, email]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          message: 'Username or email already exists' 
        });
      }
      
      // First check if department and job_title columns exist in the table
      let additionalColumns = "";
      let additionalValues = "";
      const params = [username, email, first_name, last_name, role, password];
      
      try {
        const columnCheck = await executeQuery(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('department', 'job_title')"
        );
        
        const hasColumn = (name) => columnCheck.some(col => col.COLUMN_NAME === name);
        
        if (department && hasColumn('department')) {
          additionalColumns += ", department";
          additionalValues += ", ?";
          params.push(department);
        }
        
        if (job_title && hasColumn('job_title')) {
          additionalColumns += ", job_title";
          additionalValues += ", ?";
          params.push(job_title);
        }
      } catch (error) {
        console.error("Error checking for columns:", error);
        // Continue with the insert without these fields
      }

      // Insert new user
      const insertQuery = `
        INSERT INTO users (username, email, first_name, last_name, role, password, is_active, created_at, updated_at${additionalColumns}) 
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW()${additionalValues})
      `;
      
      const result = await executeQuery(insertQuery, params);

      // Get the created user (without password)
      const getUserQuery = `
        SELECT id, username, email, first_name, last_name, role, 
               is_active, created_at, updated_at, 
               department, job_title, last_login_at
        FROM users 
        WHERE id = ?
      `;
      const newUsers = await executeQuery(getUserQuery, [result.insertId]);
      const newUser = newUsers[0];

      return res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Create user error:', error);
      return res.status(500).json({ 
        message: 'Failed to create user',
        error: 'Database error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}