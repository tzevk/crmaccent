const mysql = require('mysql2/promise');

// Database configuration
const config = {
  host: process.env.DB_HOST || '115.124.106.101',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'tk',
  password: process.env.DB_PASSWORD || 'h4?6J60hd',
  database: process.env.DB_NAME || 'crmaccent'
};

async function checkTableStructures() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully');

    // Check employees table structure
    console.log('\n📋 EMPLOYEES table structure:');
    const [employeeCols] = await connection.execute('DESCRIBE employees');
    employeeCols.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Check departments table structure
    console.log('\n📋 DEPARTMENTS table structure:');
    const [deptCols] = await connection.execute('DESCRIBE departments');
    deptCols.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Check sample data
    console.log('\n📋 Sample employees data:');
    const [sampleEmployees] = await connection.execute('SELECT * FROM employees LIMIT 3');
    console.log(`Found ${sampleEmployees.length} employees`);
    if (sampleEmployees.length > 0) {
      console.log('Column names:', Object.keys(sampleEmployees[0]));
    }

    console.log('\n📋 Sample departments data:');
    const [sampleDepts] = await connection.execute('SELECT * FROM departments LIMIT 5');
    console.log(`Found ${sampleDepts.length} departments`);
    sampleDepts.forEach(dept => {
      console.log(`  ${dept.id}: ${dept.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  checkTableStructures();
}

module.exports = { checkTableStructures };
