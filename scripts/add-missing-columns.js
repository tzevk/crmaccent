const mysql = require('mysql2/promise');

// Database configuration - uses environment variables from .env.local
const config = {
  host: process.env.DB_HOST || '115.124.106.101',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'tk',
  password: process.env.DB_PASSWORD || 'h4?6J60hd',
  database: process.env.DB_NAME || 'crmaccent'
};

async function addMissingColumns() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Plesk database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully');

    // Check if project_number column exists in projects table
    console.log('🔄 Checking projects table structure...');
    const [projectCols] = await connection.execute('DESCRIBE projects');
    const hasProjectNumber = projectCols.some(col => col.Field === 'project_number');
    
    if (!hasProjectNumber) {
      console.log('🔄 Adding project_number column to projects table...');
      await connection.execute(`
        ALTER TABLE projects 
        ADD COLUMN project_number VARCHAR(20) UNIQUE NULL AFTER id
      `);
      console.log('✅ project_number column added');

      // Generate project numbers for existing projects
      console.log('🔄 Generating project numbers for existing projects...');
      const [existingProjects] = await connection.execute('SELECT id, name FROM projects WHERE project_number IS NULL');
      
      for (let i = 0; i < existingProjects.length; i++) {
        const project = existingProjects[i];
        const projectNumber = `PRJ-${String(project.id).padStart(4, '0')}`;
        await connection.execute(
          'UPDATE projects SET project_number = ? WHERE id = ?',
          [projectNumber, project.id]
        );
      }
      console.log(`✅ Generated project numbers for ${existingProjects.length} existing projects`);

      // Make project_number NOT NULL after populating
      await connection.execute('ALTER TABLE projects MODIFY project_number VARCHAR(20) NOT NULL UNIQUE');
      console.log('✅ project_number column made NOT NULL');
    } else {
      console.log('✅ project_number column already exists');
    }

    // Check if other missing columns exist and add them
    console.log('🔄 Checking for other missing columns...');
    
    const missingColumns = [
      { table: 'projects', column: 'quotation_amount', definition: 'DECIMAL(15, 2) NULL' },
      { table: 'projects', column: 'po_amount', definition: 'DECIMAL(15, 2) NULL' },
      { table: 'projects', column: 'invoice_amount', definition: 'DECIMAL(15, 2) NULL' },
      { table: 'projects', column: 'contact_phone', definition: 'VARCHAR(20) NULL' }
    ];

    for (const { table, column, definition } of missingColumns) {
      try {
        const [tableCols] = await connection.execute(`DESCRIBE ${table}`);
        const hasColumn = tableCols.some(col => col.Field === column);
        
        if (!hasColumn) {
          console.log(`🔄 Adding ${column} to ${table} table...`);
          await connection.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
          console.log(`✅ ${column} column added to ${table}`);
        } else {
          console.log(`✅ ${column} column already exists in ${table}`);
        }
      } catch (error) {
        console.log(`⚠️  Could not add ${column} to ${table}:`, error.message);
      }
    }

    // Verify the changes
    console.log('🔄 Verifying changes...');
    const [updatedCols] = await connection.execute('DESCRIBE projects');
    const finalHasProjectNumber = updatedCols.some(col => col.Field === 'project_number');
    console.log(`✅ Projects table now has project_number column: ${finalHasProjectNumber}`);

    console.log('🎉 Database schema update completed successfully!');

  } catch (error) {
    console.error('❌ Database schema update failed:', error.message);
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
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  addMissingColumns();
}

module.exports = { addMissingColumns };
