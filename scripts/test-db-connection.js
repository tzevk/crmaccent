#!/usr/bin/env node

// scripts/test-db-connection.js
// Simple script to test database connection

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crmaccent',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  connectTimeout: 30000
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing database connection...');
    console.log('🔧 Config (safe):', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      ssl: !!dbConfig.ssl,
      hasPassword: !!dbConfig.password
    });
    
    console.log('🚀 Attempting connection...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    console.log('📊 Testing simple query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows[0]);
    
    // Test database existence and show tables
    console.log('📋 Checking database tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]));
    
    console.log('🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your database credentials (DB_USER, DB_PASSWORD)');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('💡 Check if your database server is running and accessible');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error(`💡 Database '${dbConfig.database}' does not exist. Create it first.`);
    } else {
      console.error('💡 Check your database configuration and network connectivity');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔐 Connection closed');
    }
  }
}

// Run the test
testConnection();
