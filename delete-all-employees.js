const { query } = require('./src/lib/db');

async function deleteAllEmployees() {
  try {
    console.log('Deleting all employees from the database...');
    
    const result = await query('DELETE FROM employees');
    
    console.log(`Successfully deleted ${result.affectedRows} employees`);
    console.log('All employee records have been cleared.');
    
    // Reset the auto-increment counter
    await query('ALTER TABLE employees AUTO_INCREMENT = 1');
    console.log('Reset auto-increment counter to 1');
    
  } catch (error) {
    console.error('Error deleting employees:', error);
  }
}

deleteAllEmployees();
