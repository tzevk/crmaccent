const mysql = require('mysql2/promise');

async function setupAdmin() {
  // Default database configuration
  const dbConfig = {
    host: '115.124.106.101',
    port: 3306,
    user: 'tanvi',
    password: 'tanvi3105', // Default for local development
    database: 'crmaccent',
    multipleStatements: true
  };

  console.log('Connecting to database...');
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE,
        full_name VARCHAR(100),
        role ENUM('admin', 'manager', 'user') DEFAULT 'user',
        status ENUM('active', 'inactive') DEFAULT 'active',
        employee_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_username (username),
        INDEX idx_email (email),
        INDEX idx_employee_id (employee_id)
      )
    `);
    
    // Check if admin exists
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM users WHERE email = ?',
      ['admin@crmaccent.com']
    );
    
    if (existing[0].count === 0) {
      // Insert admin user
      await connection.execute(
        'INSERT INTO users (username, password_hash, email, full_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin@crmaccent.com', 'admin123', 'admin@crmaccent.com', 'System Administrator', 'admin', 'active']
      );
      console.log('✅ Admin user created successfully!');
    } else {
      // Update existing admin user
      await connection.execute(
        'UPDATE users SET password_hash = ?, status = ? WHERE email = ?',
        ['admin123', 'active', 'admin@crmaccent.com']
      );
      console.log('✅ Admin user updated successfully!');
    }
    
    // Display credentials
    console.log('\n🔑 Working Login Credentials:');
    console.log('Username: admin@crmaccent.com');
    console.log('Password: admin123');
    
    // Verify the user was created/updated
    const [users] = await connection.execute(
      'SELECT username, email, full_name, role, status FROM users WHERE email = ?',
      ['admin@crmaccent.com']
    );
    
    console.log('\n📋 User Details:');
    console.log(users[0]);
    
    await connection.end();
    console.log('\n✅ Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Try these solutions:');
      console.log('1. Make sure MySQL is running');
      console.log('2. Update database credentials in the script');
      console.log('3. Create a .env file with proper DB credentials');
    }
  }
}

setupAdmin();
