// lib/db.js
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 60000,
  connectionLimit: 5,        // Respect limits on shared hosting
  queueLimit: 0,             // No queue limit
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a global connection pool
const pool = mysql.createPool(dbConfig);

// Main function to run queries
export async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.error('Connection config (safe):', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: !!dbConfig.ssl
    });
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// For transactions or manual control
export async function getDbConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('❌ Error creating manual DB connection:', error);
    throw error;
  }
}

// Graceful shutdown
export async function closePool() {
  try {
    await pool.end();
    console.log('✅ DB pool closed successfully');
  } catch (error) {
    console.error('❌ Error closing DB pool:', error);
  }
}