import mysql from 'mysql2/promise';

export async function GET() {
  const diagnostics = [];
  
  // Test 1: Basic connectivity to the host
  diagnostics.push({
    test: "1. Host Connectivity",
    description: "Testing if we can reach the database server"
  });
  
  // Test 2: Port connectivity
  try {
    const net = await import('net');
    const socket = new net.Socket();
    
    const portTest = new Promise((resolve, reject) => {
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.end();
        resolve("Port 3306 is open and accessible");
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error("Connection timeout - port may be blocked"));
      });
      
      socket.on('error', (err) => {
        reject(err);
      });
      
      socket.connect(parseInt(process.env.DB_PORT || '3306'), process.env.DB_HOST);
    });
    
    const portResult = await portTest;
    diagnostics.push({
      test: "2. Port Connectivity",
      status: "SUCCESS ✅",
      result: portResult
    });
    
  } catch (error) {
    diagnostics.push({
      test: "2. Port Connectivity", 
      status: "FAILED ❌",
      error: error.message
    });
  }
  
  // Test 3: Try connecting without specifying database
  try {
    const connectionWithoutDB = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
      // No database specified
    });
    
    const [rows] = await connectionWithoutDB.execute('SELECT USER() as current_user, @@hostname as server_host');
    await connectionWithoutDB.end();
    
    diagnostics.push({
      test: "3. Authentication (without database)",
      status: "SUCCESS ✅",
      result: "User authentication works!",
      userInfo: rows[0]
    });
    
  } catch (error) {
    diagnostics.push({
      test: "3. Authentication (without database)",
      status: "FAILED ❌", 
      error: {
        message: error.message,
        code: error.code
      }
    });
  }
  
  // Test 4: Check if database exists
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === process.env.DB_NAME);
    
    await connection.end();
    
    diagnostics.push({
      test: "4. Database Existence",
      status: dbExists ? "SUCCESS ✅" : "WARNING ⚠️",
      result: dbExists ? `Database '${process.env.DB_NAME}' exists` : `Database '${process.env.DB_NAME}' not found`,
      availableDatabases: databases.map(db => db.Database)
    });
    
  } catch (error) {
    diagnostics.push({
      test: "4. Database Existence",
      status: "FAILED ❌",
      error: error.message
    });
  }
  
  // Test 5: Try with the specific database
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const [rows] = await connection.execute('SELECT DATABASE() as current_db, USER() as current_user');
    await connection.end();
    
    diagnostics.push({
      test: "5. Full Connection (with database)",
      status: "SUCCESS ✅",
      result: "Full database connection successful!",
      connectionInfo: rows[0]
    });
    
  } catch (error) {
    diagnostics.push({
      test: "5. Full Connection (with database)",
      status: "FAILED ❌",
      error: {
        message: error.message,
        code: error.code,
        errno: error.errno
      }
    });
  }
  
  return Response.json({
    message: "Comprehensive Database Diagnostics",
    configuration: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      passwordProvided: !!process.env.DB_PASSWORD
    },
    diagnostics: diagnostics,
    timestamp: new Date().toISOString()
  });
}
