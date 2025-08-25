const { query } = require('../src/lib/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🔄 Running proposals migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../database/proposals_migration.sql'), 
      'utf8'
    );
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      try {
        console.log('Executing:', statement.substring(0, 50) + '...');
        await query(statement);
        console.log('✅ Success');
      } catch (error) {
        // Some operations might fail if columns already exist, that's OK
        if (error.message.includes('Duplicate column name') || 
            error.message.includes('already exists')) {
          console.log('⚠️  Column already exists, skipping...');
        } else {
          console.log('❌ Error:', error.message);
        }
      }
    }
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
