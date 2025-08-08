const mysql = require('mysql2/promise');
require('dotenv').config();

async function clearAllLeads() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crmaccent'
    });

    console.log('🔗 Connected to database');

    // Get current count
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM leads');
    const currentCount = countResult[0].count;
    
    console.log(`📊 Current leads count: ${currentCount}`);

    if (currentCount === 0) {
      console.log('✅ No leads to delete. Database is already clean.');
      return;
    }

    // Confirm deletion
    console.log(`⚠️  About to DELETE ALL ${currentCount} leads from the database`);
    console.log('🗑️  This action cannot be undone!');

    // Delete all leads
    const [result] = await connection.execute('DELETE FROM leads');
    
    console.log(`✅ Successfully deleted ${result.affectedRows} leads`);

    // Reset auto increment (optional)
    await connection.execute('ALTER TABLE leads AUTO_INCREMENT = 1');
    console.log('🔄 Reset auto increment counter');

    // Verify deletion
    const [verifyResult] = await connection.execute('SELECT COUNT(*) as count FROM leads');
    const finalCount = verifyResult[0].count;
    
    console.log(`📊 Final leads count: ${finalCount}`);
    
    if (finalCount === 0) {
      console.log('🎉 All leads successfully cleared from database!');
    } else {
      console.log('❌ Warning: Some leads may still exist');
    }

  } catch (error) {
    console.error('❌ Error clearing leads:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  clearAllLeads()
    .then(() => {
      console.log('🏁 Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = clearAllLeads;
