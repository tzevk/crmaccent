import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up database tables...');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(100),
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          role ENUM('admin', 'manager', 'user') DEFAULT 'user',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await executeQuery(createUsersTable);
    console.log('Users table created successfully');

    // Insert test users (with plain text passwords)
    const insertUsers = `
      INSERT IGNORE INTO users (username, password, email, first_name, last_name, role) VALUES 
      ('admin', 'admin123', 'admin@crmaccent.com', 'Admin', 'User', 'admin'),
      ('manager', 'manager123', 'manager@crmaccent.com', 'Manager', 'User', 'manager'),
      ('testuser', 'user123', 'test@crmaccent.com', 'Test', 'User', 'user')
    `;

    await executeQuery(insertUsers);
    console.log('Test users inserted successfully');

    // Check what was created
    const tables = await executeQuery('SHOW TABLES');
    const userCount = await executeQuery('SELECT COUNT(*) as count FROM users');
    const users = await executeQuery('SELECT id, username, email, first_name, last_name, role FROM users');

    return res.status(200).json({
      message: 'Database setup completed successfully',
      tables: tables,
      userCount: userCount[0].count,
      users: users,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({
      message: 'Database setup failed',
      error: error.message,
      code: error.code,
      sqlState: error.sqlState
    });
  }
}
