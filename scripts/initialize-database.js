const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crmaccent',
  multipleStatements: true
};

async function initializeDatabase() {
  let connection;
  
  try {
    // First connect without specifying database to create it if needed
    console.log('🔄 Connecting to MySQL server...');
    const serverConfig = { ...config };
    delete serverConfig.database;
    connection = await mysql.createConnection(serverConfig);
    console.log('✅ MySQL server connected successfully');

    // Create database if it doesn't exist
    console.log(`🔄 Creating database '${config.database}' if not exists...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    console.log(`✅ Database '${config.database}' ready`);
    
    // Close connection and reconnect with database specified
    await connection.end();
    console.log('🔄 Reconnecting with database...');
    connection = await mysql.createConnection(config);
    console.log(`✅ Connected to database '${config.database}'`);

    // Read and execute main schema
    console.log('🔄 Executing main schema...');
    const mainSchemaPath = path.join(__dirname, '..', 'database', 'setup.sql');
    const mainSchema = fs.readFileSync(mainSchemaPath, 'utf8');
    
    // Split by semicolon and clean each statement
    const statements = mainSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('DELIMITER'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`  Executing statement ${i + 1}/${statements.length}...`);
          await connection.query(statement);
        } catch (error) {
          console.log(`  ⚠️ Statement ${i + 1} failed (might be expected):`, error.message);
        }
      }
    }
    console.log('✅ Main schema tables processed');

    // Read and execute employee schema
    console.log('🔄 Executing employee schema...');
    const employeeSchemaPath = path.join(__dirname, '..', 'database', 'employee_schema.sql');
    const employeeSchema = fs.readFileSync(employeeSchemaPath, 'utf8');
    
    // Split by semicolon and clean each statement
    const employeeStatements = employeeSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    for (let i = 0; i < employeeStatements.length; i++) {
      const statement = employeeStatements[i];
      if (statement && statement !== '*/') {
        try {
          console.log(`  Executing employee statement ${i + 1}/${employeeStatements.length}...`);
          await connection.query(statement);
        } catch (error) {
          console.log(`  ⚠️ Employee statement ${i + 1} failed (might be expected):`, error.message);
        }
      }
    }
    console.log('✅ Employee schema processed');

    // Test table creation
    console.log('🔄 Verifying table creation...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(row => Object.values(row)[0]));

    // Check specific tables
    const criticalTables = ['users', 'projects', 'departments', 'employees', 'designations'];
    for (const table of criticalTables) {
      try {
        const [result] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`✅ Table '${table}' exists with ${result.length} columns`);
      } catch (error) {
        console.log(`❌ Table '${table}' missing or error:`, error.message);
      }
    }

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📝 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = { initializeDatabase };
