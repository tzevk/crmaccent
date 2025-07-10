import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const userId = parseInt(id);

  if (req.method === 'GET') {
    // Get user by ID
    try {
      // Check which columns actually exist in the users table
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
      
      const query = `
        SELECT ${selectColumns.join(', ')}
        FROM users 
        WHERE id = ?
      `;
      
      const users = await executeQuery(query, [userId]);
      
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.status(200).json({
        user: users[0],
        message: 'User retrieved successfully'
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Failed to retrieve user' });
    }
  }

  if (req.method === 'PUT') {
    // Update user
    const { username, email, first_name, last_name, role, is_active, department, job_title } = req.body;

    // Validate required fields
    if (!username || !email || !first_name || !last_name || !role) {
      return res.status(400).json({ 
        message: 'Required fields missing: username, email, first_name, last_name, role' 
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
      // Check if username or email already exists for other users
      const checkQuery = 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?';
      const existingUsers = await executeQuery(checkQuery, [username, email, userId]);
      
      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          message: 'Username or email already exists' 
        });
      }

      // Update fields that are actually in the database schema
      let updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?, 
            is_active = ?, updated_at = NOW()
      `;
      
      let params = [username, email, first_name, last_name, role, is_active ? 1 : 0];

      // Add department and job_title conditionally
      // First check if these columns exist in the database
      try {
        const columnCheck = await executeQuery(
          "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('department', 'job_title')"
        );
        
        const hasColumn = (name) => columnCheck.some(col => col.COLUMN_NAME === name);
        
        if (department !== undefined && hasColumn('department')) {
          updateQuery += ", department = ?";
          params.push(department);
        }
        
        if (job_title !== undefined && hasColumn('job_title')) {
          updateQuery += ", job_title = ?";
          params.push(job_title);
        }
      } catch (error) {
        console.error("Error checking for columns:", error);
        // Continue with the update without these fields
      }
      
      // Complete the query with WHERE clause
      updateQuery += " WHERE id = ?";
      params.push(userId);
      
      // Execute the update
      await executeQuery(updateQuery, params);

      // Get the updated user
      const getUserQuery = `
        SELECT id, username, email, first_name, last_name, role, 
               is_active, created_at, updated_at, 
               department, job_title, last_login_at
        FROM users 
        WHERE id = ?
      `;
      const updatedUsers = await executeQuery(getUserQuery, [userId]);
      
      if (updatedUsers.length === 0) {
        return res.status(404).json({ message: 'User not found after update' });
      }
      
      return res.status(200).json({
        message: 'User updated successfully',
        user: updatedUsers[0]
      });

    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ 
        message: 'Failed to update user',
        error: 'Database error'
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      // First check if user exists
      const checkQuery = 'SELECT id FROM users WHERE id = ?';
      const existingUsers = await executeQuery(checkQuery, [userId]);
      
      if (existingUsers.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete the user
      const deleteQuery = 'DELETE FROM users WHERE id = ?';
      await executeQuery(deleteQuery, [userId]);
      
      return res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ 
        message: 'Failed to delete user',
        error: 'Database error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
