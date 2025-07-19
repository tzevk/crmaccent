const mysql = require('mysql2/promise');

// Database configuration
const config = {
  host: process.env.DB_HOST || '115.124.106.101',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'tk',
  password: process.env.DB_PASSWORD || 'h4?6J60hd',
  database: process.env.DB_NAME || 'crmaccent'
};

async function checkLeadsSchema() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully');

    // Check leads table structure
    console.log('\n📋 LEADS table structure:');
    const [leadsCols] = await connection.execute('DESCRIBE leads');
    leadsCols.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
    });

    // Check companies/clients table structure
    console.log('\n📋 COMPANIES/CLIENTS table structure:');
    try {
      const [companiesCols] = await connection.execute('DESCRIBE companies');
      companiesCols.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
    } catch (error) {
      console.log('  Companies table not found, checking clients table...');
      const [clientsCols] = await connection.execute('DESCRIBE clients');
      clientsCols.forEach(col => {
        console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key} - ${col.Default}`);
      });
    }

    // Sample leads data
    console.log('\n📋 Sample leads data:');
    const [sampleLeads] = await connection.execute('SELECT * FROM leads LIMIT 3');
    console.log(`Found ${sampleLeads.length} leads`);
    if (sampleLeads.length > 0) {
      console.log('Lead columns:', Object.keys(sampleLeads[0]));
    }

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
  checkLeadsSchema();
}

module.exports = { checkLeadsSchema };
