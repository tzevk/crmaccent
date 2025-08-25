const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔄 Testing database connection...');
    console.log('📊 Connection details:');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Port: ${dbConfig.port}`);
    console.log(`   Database: ${dbConfig.database}`);
    console.log(`   User: ${dbConfig.user}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');

    // Test basic query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Basic query test passed');

    // Check if leads table exists
    const [tables] = await connection.execute("SHOW TABLES LIKE 'leads'");
    
    if (tables.length > 0) {
      console.log('✅ Leads table exists');
      
      // Get table structure
      const [columns] = await connection.execute('DESCRIBE leads');
      console.log(`📋 Leads table has ${columns.length} columns`);
      
      // Get row count
      const [count] = await connection.execute('SELECT COUNT(*) as total FROM leads');
      console.log(`📊 Total leads in database: ${count[0].total}`);
      
      if (count[0].total > 0) {
        // Show sample lead
        const [sample] = await connection.execute('SELECT enquiry_no, company_name, contact_name, lead_stage FROM leads LIMIT 1');
        console.log('📄 Sample lead:', sample[0]);
      }
    } else {
      console.log('❌ Leads table does not exist');
      console.log('💡 Run the setup script: node scripts/setup-leads-database.js');
    }

    // Check other important tables
    const importantTables = ['followups', 'lead_activities', 'cities', 'users'];
    
    for (const table of importantTables) {
      const [tableExists] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (tableExists.length > 0) {
        const [tableCount] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${tableCount[0].count} records`);
      } else {
        console.log(`❌ ${table}: Table not found`);
      }
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔑 Access denied - check credentials');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - check if database server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗃️  Database not found - check database name');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Host not found - check database host');
    }
    
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
  
  return true;
}

// Run the test
if (require.main === module) {
  testDatabaseConnection().then(success => {
    if (success) {
      console.log('\n🎉 Database test completed successfully!');
    } else {
      console.log('\n💥 Database test failed!');
      process.exit(1);
    }
  });
}

module.exports = { testDatabaseConnection };
