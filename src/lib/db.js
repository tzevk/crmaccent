import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  acquireTimeout: 60000,
  // Additional options for Plesk/remote connections
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  connectTimeout: 60000,
};

let pool;

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
      console.log('Database pool created successfully');
    } catch (error) {
      console.error('Failed to create database pool:', error);
      throw error;
    }
  }
  return pool;
}

export async function executeQuery(query, params = []) {
  let connection;
  try {
    const pool = await getConnection();
    connection = await pool.getConnection();
    console.log('Database connection established');
    
    const [results] = await connection.execute(query, params);
    console.log('Query executed successfully');
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Connection config (sanitized):', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: dbConfig.ssl
    });
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
