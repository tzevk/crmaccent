import mysql from 'mysql2/promise';

const commonConfigurations = [
  {
    name: "Current Configuration",
    config: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  },
  {
    name: "Username with _admin suffix",
    config: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER + '_admin',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  },
  {
    name: "Database name with username prefix",
    config: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_USER + '_' + process.env.DB_NAME
    }
  },
  {
    name: "Username with database prefix",
    config: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_NAME + '_' + process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
  }
];

export async function GET() {
  const results = [];
  
  for (const { name, config } of commonConfigurations) {
    try {
      console.log(`\n🔧 Testing: ${name}`);
      console.log(`   Host: ${config.host}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      
      const connection = await mysql.createConnection(config);
      await connection.ping();
      const [rows] = await connection.execute('SELECT 1 as test, DATABASE() as current_db, USER() as current_user');
      await connection.end();
      
      results.push({
        configuration: name,
        status: 'SUCCESS ✅',
        details: config,
        testResult: rows[0]
      });
      
      console.log(`   ✅ SUCCESS!`);
      
    } catch (error) {
      results.push({
        configuration: name,
        status: 'FAILED ❌',
        details: config,
        error: {
          message: error.message,
          code: error.code,
          errno: error.errno
        }
      });
      
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }
  
  return Response.json({
    message: 'Database configuration test results',
    currentIP: '45.127.45.4',
    note: 'If all configurations fail, you need to whitelist IP 45.127.45.4 in your Plesk panel',
    results: results,
    timestamp: new Date().toISOString()
  });
}
