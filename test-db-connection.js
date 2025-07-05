const mysql = require('mysql2/promise');

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || '15.124.106.132',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'admin1',
    password: process.env.DB_PASSWORD || 'h4?6J60hd',
    database: process.env.DB_NAME || 'crmaccent',
    connectTimeout: 10000, // 10 seconds
  };

  console.log('Testing connection with config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user
  });

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!');
    
    const [results] = await connection.execute('SELECT 1 as test, NOW() as time');
    console.log('✅ Query successful:', results[0]);
    
    await connection.end();
    console.log('✅ Connection closed');
  } catch (error) {
    console.log('❌ Connection failed:');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('\n🔍 Troubleshooting tips:');
      console.log('1. Check if remote MySQL access is enabled in Plesk');
      console.log('2. Verify firewall allows connections on port 3306');
      console.log('3. Check if the IP/hostname is correct');
      console.log('4. Try using the domain name instead of IP');
    }
  }
}

testConnection();
