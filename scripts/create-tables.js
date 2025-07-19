const mysql = require('mysql2/promise');

// Database configuration - uses environment variables from .env.local
const config = {
  host: process.env.DB_HOST || '115.124.106.101',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'tk',
  password: process.env.DB_PASSWORD || 'h4?6J60hd',
  database: process.env.DB_NAME || 'crmaccent'
};

async function createBasicTables() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Plesk database...');
    console.log(`   Host: ${config.host}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database successfully');

    // Create users table first (no dependencies)
    console.log('🔄 Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Create departments table (no dependencies)
    console.log('🔄 Creating departments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        head_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Departments table created');

    // Create designations table
    console.log('🔄 Creating designations table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS designations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) UNIQUE NOT NULL,
        department_id INT NULL,
        level INT DEFAULT 1,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Designations table created');

    // Create employees table
    console.log('🔄 Creating employees table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        department VARCHAR(100),
        designation VARCHAR(100),
        reporting_manager_id INT NULL,
        join_date DATE,
        employment_status ENUM('active', 'on_leave', 'terminated', 'resigned') DEFAULT 'active',
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        country VARCHAR(50) DEFAULT 'India',
        user_id INT UNIQUE NULL,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Employees table created');

    // Create clients table
    console.log('🔄 Creating clients table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        country VARCHAR(50),
        company VARCHAR(100),
        website VARCHAR(255),
        status ENUM('active', 'inactive', 'lead', 'customer') NOT NULL DEFAULT 'active',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Clients table created');

    // Create projects table with project_number column
    console.log('🔄 Creating projects table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_number VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        type ENUM('PROPOSAL', 'ONGOING') NOT NULL DEFAULT 'PROPOSAL',
        client_id INT NOT NULL,
        start_date DATE,
        end_date DATE,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
        value DECIMAL(15, 2),
        description TEXT,
        has_quotation BOOLEAN DEFAULT FALSE,
        quotation_number VARCHAR(50),
        quotation_date DATE,
        quotation_amount DECIMAL(15, 2),
        has_po BOOLEAN DEFAULT FALSE,
        po_number VARCHAR(50),
        po_date DATE,
        po_amount DECIMAL(15, 2),
        has_invoice BOOLEAN DEFAULT FALSE,
        invoice_number VARCHAR(50),
        invoice_date DATE,
        invoice_amount DECIMAL(15, 2),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Projects table created');

    // Create leads table
    console.log('🔄 Creating leads table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        enquiry_number VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        phone VARCHAR(20),
        company VARCHAR(100),
        location VARCHAR(100),
        requirement TEXT,
        status ENUM('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost') NOT NULL DEFAULT 'new',
        source VARCHAR(50),
        assigned_to INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);
    console.log('✅ Leads table created');

    // Insert default departments
    console.log('🔄 Inserting default departments...');
    await connection.execute(`
      INSERT IGNORE INTO departments (name, description) VALUES 
      ('Engineering', 'Software development and technical teams'),
      ('Marketing', 'Marketing, branding, and customer outreach'),
      ('Sales', 'Business development and sales operations'),
      ('Human Resources', 'HR, recruitment, and employee management'),
      ('Finance', 'Accounting, finance, and administration'),
      ('Operations', 'General operations and project management')
    `);
    console.log('✅ Default departments inserted');

    // Insert default designations
    console.log('🔄 Inserting default designations...');
    await connection.execute(`
      INSERT IGNORE INTO designations (title, level, description) VALUES 
      ('Software Engineer', 3, 'Software development and programming'),
      ('Senior Software Engineer', 5, 'Senior software development role'),
      ('Technical Lead', 7, 'Technical leadership and team management'),
      ('Marketing Executive', 3, 'Marketing campaigns and brand management'),
      ('Sales Executive', 3, 'Sales and business development'),
      ('HR Executive', 3, 'Human resources and recruitment'),
      ('Project Manager', 6, 'Project planning and management'),
      ('Manager', 6, 'Department or team management role'),
      ('Senior Manager', 7, 'Senior management position'),
      ('Director', 9, 'Director level position')
    `);
    console.log('✅ Default designations inserted');

    // Test table creation
    console.log('🔄 Verifying table creation...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(row => Object.values(row)[0]));

    // Check specific critical tables
    const criticalTables = ['users', 'projects', 'departments', 'employees', 'designations', 'clients', 'leads'];
    for (const table of criticalTables) {
      try {
        const [result] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`✅ Table '${table}' exists with ${result.length} columns`);
      } catch (error) {
        console.log(`❌ Table '${table}' missing or error:`, error.message);
      }
    }

    // Check specific columns that caused errors
    console.log('🔄 Checking specific columns...');
    try {
      const [projectCols] = await connection.execute('DESCRIBE projects');
      const hasProjectNumber = projectCols.some(col => col.Field === 'project_number');
      console.log(`✅ Projects table has project_number column: ${hasProjectNumber}`);
    } catch (error) {
      console.log('❌ Could not check projects table columns');
    }

    console.log('🎉 Database initialization completed successfully!');

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('📝 Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  createBasicTables();
}

module.exports = { createBasicTables };
