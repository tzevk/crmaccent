import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if employees table exists
    const checkEmployeeTable = await executeQuery(`
      SELECT COUNT(*) as table_exists 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'employees'
    `);
    
    if (checkEmployeeTable[0].table_exists === 0) {
      return res.status(400).json({ 
        message: 'Migration failed: Employees table does not exist. Please run the employee schema migration first.' 
      });
    }
    
    // Get the current users table structure
    const userColumns = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
    `);
    
    const columnNames = userColumns.map(col => col.COLUMN_NAME.toLowerCase());
    
    // Check if we already have the employee_id column
    const hasEmployeeIdColumn = columnNames.includes('employee_id');
    
    // Create a backup of the users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users_backup_before_simplification
      SELECT * FROM users
    `);
    
    // Add employee_id column if it doesn't exist
    if (!hasEmployeeIdColumn) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN employee_id INT UNIQUE,
        ADD FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
      `);
    }
    
    // List of columns we want to keep in the simplified users table
    const columnsToKeep = [
      'id', 'username', 'email', 'password', 'role', 'is_active',
      'employee_id', 'created_at', 'updated_at', 'last_login_at'
    ];
    
    // Get list of columns to remove (excluding the ones we want to keep)
    const columnsToRemove = columnNames.filter(
      col => !columnsToKeep.includes(col) && col !== 'id'
    );
    
    // First migrate users with relevant information to the employees table
    // For each user with information like department, job_title, etc.
    if (columnNames.includes('first_name') && columnNames.includes('last_name')) {
      // Get all users that don't already have an employee record
      const users = await executeQuery(`
        SELECT id, username, email, first_name, last_name, 
               ${columnNames.includes('department') ? 'department,' : ''} 
               ${columnNames.includes('job_title') ? 'job_title,' : ''} 
               ${columnNames.includes('phone') ? 'phone,' : ''} 
               role, is_active
        FROM users
        WHERE id NOT IN (SELECT user_id FROM employees WHERE user_id IS NOT NULL)
      `);
      
      for (const user of users) {
        // Only create employee record if we have a name
        if (user.first_name || user.last_name) {
          // Generate a unique employee ID
          const yearMonth = new Date().toISOString().slice(2, 7).replace('-', '');
          const randomPart = Math.floor(1000 + Math.random() * 9000);
          const employeeId = `EMP-${yearMonth}-${randomPart}`;
          
          // Create employee record
          const result = await executeQuery(`
            INSERT INTO employees (
              employee_id, first_name, last_name, email, 
              ${user.phone ? 'phone,' : ''} 
              ${user.department ? 'department,' : ''} 
              ${user.job_title ? 'designation,' : ''} 
              user_id, employment_status
            ) VALUES (
              ?, ?, ?, ?,
              ${user.phone ? '?,' : ''} 
              ${user.department ? '?,' : ''} 
              ${user.job_title ? '?,' : ''} 
              ?, ?
            )
          `, [
            employeeId,
            user.first_name || '',
            user.last_name || '',
            user.email,
            ...(user.phone ? [user.phone] : []),
            ...(user.department ? [user.department] : []),
            ...(user.job_title ? [user.job_title] : []),
            user.id,
            user.is_active ? 'active' : 'inactive'
          ]);
          
          // Update the user record with the new employee_id
          if (result.insertId) {
            await executeQuery(`
              UPDATE users 
              SET employee_id = ?
              WHERE id = ?
            `, [result.insertId, user.id]);
          }
        }
      }
    }
    
    // Now drop any columns we don't need anymore
    if (columnsToRemove.length > 0) {
      await executeQuery(`
        ALTER TABLE users 
        ${columnsToRemove.map(col => `DROP COLUMN ${col}`).join(', ')}
      `);
    }
    
    // Ensure we have the necessary columns
    // Check and add last_login_at if it doesn't exist
    if (!columnNames.includes('last_login_at')) {
      await executeQuery(`
        ALTER TABLE users 
        ADD COLUMN last_login_at TIMESTAMP NULL
      `);
    }
    
    return res.status(200).json({ 
      message: 'User table simplified successfully',
      columns_removed: columnsToRemove,
      migration_success: true
    });
  } catch (error) {
    console.error('Simplify users table error:', error);
    return res.status(500).json({ 
      message: 'Failed to simplify users table', 
      error: error.message 
    });
  }
}
