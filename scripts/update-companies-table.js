const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function updateCompaniesTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT) || 3306
    });

    console.log('Updating companies table with new fields...');
    
    // Check current columns
    const [columns] = await connection.execute('DESCRIBE companies');
    const existingColumns = columns.map(col => col.Field);
    console.log('Existing columns:', existingColumns);
    
    const newColumns = [
      { name: 'industry', type: 'VARCHAR(100)' },
      { name: 'company_type', type: 'VARCHAR(50) DEFAULT "Private"' },
      { name: 'founded_year', type: 'INT(4)' },
      { name: 'fax', type: 'VARCHAR(20)' },
      { name: 'postal_code', type: 'VARCHAR(20)' },
      { name: 'employee_count', type: 'VARCHAR(20)' },
      { name: 'annual_revenue', type: 'DECIMAL(15,2)' },
      { name: 'currency', type: 'VARCHAR(10) DEFAULT "INR"' },
      { name: 'business_description', type: 'TEXT' },
      { name: 'primary_contact_name', type: 'VARCHAR(255)' },
      { name: 'primary_contact_designation', type: 'VARCHAR(100)' },
      { name: 'primary_contact_phone', type: 'VARCHAR(20)' },
      { name: 'primary_contact_email', type: 'VARCHAR(255)' },
      { name: 'gst_number', type: 'VARCHAR(20)' },
      { name: 'pan_number', type: 'VARCHAR(20)' },
      { name: 'registration_number', type: 'VARCHAR(50)' },
      { name: 'tax_id', type: 'VARCHAR(50)' },
      { name: 'notes', type: 'TEXT' },
      { name: 'tags', type: 'TEXT' }
    ];
    
    // Add missing columns
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        console.log(`Adding column: ${column.name}`);
        await connection.execute(`ALTER TABLE companies ADD COLUMN ${column.name} ${column.type}`);
      } else {
        console.log(`Column ${column.name} already exists`);
      }
    }
    
    console.log('Companies table updated successfully!');

  } catch (error) {
    console.error('Error updating table:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateCompaniesTable();
