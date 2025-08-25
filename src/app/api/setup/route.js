import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const db = getDb();

    // Create users table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        full_name VARCHAR(100),
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email)
      )
    `);

    // Check if admin user exists
    const [existingUsers] = await db.execute(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
    );

    if (existingUsers[0].count === 0) {
      // Create default admin user (plain text password)
      const defaultPassword = 'admin123';

      await db.execute(
        'INSERT INTO users (username, password_hash, email, full_name, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', defaultPassword, 'admin@crmaccent.com', 'System Administrator', 'admin']
      );

      return Response.json({
        message: 'Database setup completed successfully',
        defaultCredentials: {
          username: 'admin',
          password: 'admin123'
        }
      });
    }

    return Response.json({
      message: 'Database already initialized'
    });

  } catch (error) {
    console.error('Setup error:', error);
    return Response.json(
      { message: 'Setup failed: ' + error.message },
      { status: 500 }
    );
  }
}
