const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crmaccent'
    });

    console.log('🔗 Connected to database:', process.env.DB_NAME || 'crmaccent');

    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`  ${index + 1}. ${tableName}`);
    });

    if (tables.length === 0) {
      console.log('❌ No tables found in database');
      return;
    }

    // Check for leads-related tables
    const leadsTables = tables.filter(table => {
      const tableName = Object.values(table)[0].toLowerCase();
      return tableName.includes('lead');
    });

    if (leadsTables.length > 0) {
      console.log('\n🎯 Found leads-related tables:');
      for (const table of leadsTables) {
        const tableName = Object.values(table)[0];
        console.log(`\n📊 Table: ${tableName}`);
        
        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   Records: ${countResult[0].count}`);
        
        // Show structure
        const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log('   Columns:');
        structure.forEach(col => {
          console.log(`     - ${col.Field} (${col.Type})`);
        });
      }
    } else {
      console.log('\n❌ No leads tables found');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

checkDatabase();
