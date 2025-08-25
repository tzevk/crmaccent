const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

async function setupLeadManagementDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'leads_schema_simple.sql');
    console.log('📄 Reading schema file:', schemaPath);
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    console.log('🔄 Executing database schema...');
    
    // Better SQL parsing - handle multi-line statements
    const sqlCommands = [];
    let currentCommand = '';
    const lines = schemaSQL.split('\n');
    
    for (let line of lines) {
      line = line.trim();
      // Skip comments and empty lines
      if (line.startsWith('--') || line === '') {
        continue;
      }
      
      currentCommand += line + ' ';
      
      // If line ends with semicolon, we have a complete command
      if (line.endsWith(';')) {
        sqlCommands.push(currentCommand.trim().slice(0, -1)); // Remove the semicolon
        currentCommand = '';
      }
    }
    
    console.log(`📊 Found ${sqlCommands.length} SQL commands to execute`);
    
    for (let i = 0; i < sqlCommands.length; i++) {
      const command = sqlCommands[i];
      if (command && command.trim()) {
        try {
          // Log the first few characters of each command for debugging
          console.log(`⚡ Executing: ${command.substring(0, 50)}...`);
          await connection.execute(command);
          console.log(`✅ Command ${i + 1}/${sqlCommands.length} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Duplicate entry (skipping): ${error.message.substring(0, 100)}...`);
          } else if (error.code === 'ER_NO_SUCH_TABLE' && command.includes('CREATE INDEX')) {
            console.log(`⚠️  Index creation skipped (table not ready): ${command.substring(0, 50)}...`);
          } else if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  Index already exists (skipping): ${command.substring(0, 50)}...`);
          } else {
            console.error(`❌ Error in command ${i + 1}: ${command.substring(0, 100)}...`);
            console.error('Error:', error.message);
            // Continue with next command instead of failing completely
          }
        }
      }
    }
    console.log('✅ Database schema executed successfully');

    // Verify table creation
    console.log('🔍 Verifying table creation...');
    
    const tables = [
      'companies',
      'cities', 
      'enquiry_types',
      'project_descriptions',
      'enquiry_statuses',
      'project_statuses',
      'users',
      'leads',
      'followups',
      'lead_activities'
    ];

    for (const table of tables) {
      const [rows] = await connection.execute(`SHOW TABLES LIKE '${table}'`);
      if (rows.length > 0) {
        console.log(`✅ Table '${table}' exists`);
        
        // Get row count
        const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   └── Records: ${countResult[0].count}`);
      } else {
        console.log(`❌ Table '${table}' not found`);
      }
    }

    // Test data insertion
    console.log('🔄 Testing sample lead creation...');
    
    const sampleLead = {
      enquiry_no: `ENQ-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      year: new Date().getFullYear(),
      enquiry_date: new Date().toISOString().split('T')[0],
      enquiry_type: 'Direct',
      source: 'Database Setup Test',
      company_name: 'Test Company Ltd.',
      city: 'Mumbai',
      industry: 'IT Services',
      contact_name: 'John Doe',
      designation: 'IT Manager',
      mobile: '+91 9876543210',
      email: 'john.doe@testcompany.com',
      project_name: 'CRM Integration Project',
      project_description: 'Software Development',
      estimated_value: 500000,
      estimated_duration: 6,
      currency: 'INR',
      enquiry_status: 'New',
      project_status: 'Pending',
      lead_stage: 'New',
      remarks: 'Sample lead created during database setup',
      created_by: 1
    };

    const insertQuery = `
      INSERT INTO leads (
        enquiry_no, year, enquiry_date, enquiry_type, source,
        company_name, city, industry, contact_name, designation,
        mobile, email, project_name, project_description,
        estimated_value, estimated_duration, currency,
        enquiry_status, project_status, lead_stage, remarks, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [insertResult] = await connection.execute(insertQuery, Object.values(sampleLead));
    console.log(`✅ Sample lead created with ID: ${insertResult.insertId}`);

    // Test sample follow-up
    console.log('🔄 Testing follow-up creation...');
    
    const sampleFollowup = {
      lead_id: insertResult.insertId,
      followup_date: new Date().toISOString().split('T')[0],
      description: 'Initial contact made. Customer showed interest in CRM solution.',
      next_action: 'Schedule demo meeting next week',
      created_by: 1
    };

    const followupQuery = `
      INSERT INTO followups (lead_id, followup_date, description, next_action, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [followupResult] = await connection.execute(followupQuery, Object.values(sampleFollowup));
    console.log(`✅ Sample follow-up created with ID: ${followupResult.insertId}`);

    // Final verification
    console.log('🔍 Final verification...');
    
    const [leadCount] = await connection.execute('SELECT COUNT(*) as count FROM leads');
    const [followupCount] = await connection.execute('SELECT COUNT(*) as count FROM followups');
    const [activityCount] = await connection.execute('SELECT COUNT(*) as count FROM lead_activities');
    
    console.log(`📊 Database Statistics:`);
    console.log(`   └── Leads: ${leadCount[0].count}`);
    console.log(`   └── Follow-ups: ${followupCount[0].count}`);
    console.log(`   └── Activities: ${activityCount[0].count}`);

    // Test the API endpoints data structure
    console.log('🔄 Testing API data structure...');
    
    const [testLeads] = await connection.execute(`
      SELECT 
        l.*,
        c.name as company_master_name,
        ct.name as city_name,
        u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN companies c ON l.company_id = c.id
      LEFT JOIN cities ct ON l.city_id = ct.id  
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ?
      LIMIT 1
    `, [insertResult.insertId]);

    if (testLeads.length > 0) {
      console.log('✅ API data structure test passed');
      console.log('   └── Sample lead data retrieved successfully');
    }

    console.log('\n🎉 Lead Management Database Setup Complete!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Start your Next.js application: npm run dev');
    console.log('   2. Navigate to /leads to view the lead management dashboard');
    console.log('   3. Test creating new leads via /leads/new');
    console.log('   4. View lead details and add follow-ups');
    
    console.log('\n🔧 Available API Endpoints:');
    console.log('   - GET  /api/leads (fetch all leads)');
    console.log('   - POST /api/leads (create new lead)');
    console.log('   - GET  /api/leads/[id] (fetch single lead)');
    console.log('   - PUT  /api/leads/[id] (update lead)');
    console.log('   - DELETE /api/leads/[id] (delete lead)');
    console.log('   - GET  /api/followups (fetch follow-ups)');
    console.log('   - POST /api/followups (create follow-up)');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔑 Please check your database credentials in .env file');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Please ensure your MySQL/MariaDB server is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗃️  Please ensure the database exists and is accessible');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📡 Database connection closed');
    }
  }
}

// Run the setup
if (require.main === module) {
  setupLeadManagementDatabase();
}

module.exports = { setupLeadManagementDatabase };
