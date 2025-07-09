import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Additional options for Plesk/remote connections
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false,
  connectTimeout: 30000,
};

// Use direct connections instead of pooling for Plesk compatibility
export async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [results] = await connection.execute(query, params);
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
      await connection.end();
    }
  }
}
