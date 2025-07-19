const mysql = require('mysql2/promise');

async function testDatabase() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crmaccent'
    });
    
    console.log('✅ Database connection successful');
    
    // Check if logs table exists
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'crmaccent' 
      AND TABLE_NAME IN ('projects', 'project_tasks', 'logs', 'users', 'companies')
    `);
    
    console.log('📊 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });
    
    // Create logs table if it doesn't exist
    const tableNames = tables.map(t => t.TABLE_NAME);
    
    if (!tableNames.includes('logs')) {
      console.log('📝 Creating logs table...');
      await connection.execute(`
        CREATE TABLE logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          action VARCHAR(255) NOT NULL,
          entity_type VARCHAR(50) NOT NULL,
          entity_id INT,
          details TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('✅ Logs table created');
    }
    
    // Test a simple query
    const [projects] = await connection.execute('SELECT COUNT(*) as count FROM projects');
    console.log(`📦 Projects in database: ${projects[0].count}`);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    
    // If database doesn't exist, try to create it
    if (error.code === 'ER_BAD_DB_ERROR') {
      try {
        console.log('🔄 Trying to create database...');
        const tempConnection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || ''
        });
        
        await tempConnection.execute('CREATE DATABASE IF NOT EXISTS crmaccent');
        console.log('✅ Database crmaccent created');
        await tempConnection.end();
        
        // Retry with new database
        console.log('🔄 Retrying connection...');
        await testDatabase();
        
      } catch (createError) {
        console.error('❌ Failed to create database:', createError.message);
      }
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testDatabase();
