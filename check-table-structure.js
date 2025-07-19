const mysql = require('mysql2/promise');

async function checkTableStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crmaccent'
    });
    
    console.log('Checking project_tasks table structure:');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'crmaccent' AND TABLE_NAME = 'project_tasks'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.table(columns);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

require('dotenv').config({ path: '.env.local' });
checkTableStructure();
