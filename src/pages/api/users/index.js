import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users
    try {
      console.log('Fetching users from database');
      const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC';
      const users = await executeQuery(query);
      
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
    const { username, email, first_name, last_name, role, password } = req.body;

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
      console.log('Production mode: Adding user to database');
      
      // Check if username or email already exists
      const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
      const existingUsers = await executeQuery(checkQuery, [username, email]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          message: 'Username or email already exists' 
        });
      }

      // Store password as plain text (for simplicity)
      // Insert new user
      const insertQuery = `
        INSERT INTO users (username, email, first_name, last_name, role, password, is_active, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `;
      
      const result = await executeQuery(insertQuery, [
        username, email, first_name, last_name, role, password
      ]);

      // Get the created user (without password)
      const getUserQuery = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = ?';
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