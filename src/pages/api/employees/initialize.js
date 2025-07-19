import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create tables in correct order to handle dependencies
    
    // 1. Create departments table first (no dependencies)
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        head_id INT NULL,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Create designations table (depends on departments)
    await executeQuery(`
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

    // 3. Create employees table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id VARCHAR(20) UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        profile_image VARCHAR(255),
        
        -- Employment details
        department VARCHAR(100),
        designation VARCHAR(100),
        reporting_manager_id INT NULL,
        hire_date DATE,
        salary DECIMAL(10, 2),
        status ENUM('active', 'on_leave', 'terminated', 'resigned', 'inactive') DEFAULT 'active',
        role ENUM('admin', 'manager', 'employee', 'intern') DEFAULT 'employee',
        
        -- Login credentials (optional)
        username VARCHAR(50) UNIQUE,
        password VARCHAR(255),
        
        -- Personal details
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        city VARCHAR(50),
        state VARCHAR(50),
        postal_code VARCHAR(20),
        country VARCHAR(50) DEFAULT 'India',
        emergency_contact VARCHAR(100),
        
        -- Linked user account (optional)
        user_id INT UNIQUE NULL,
        
        -- System fields
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 4. Add foreign key for department head after employees table exists
    try {
      await executeQuery(`
        ALTER TABLE departments 
        ADD CONSTRAINT fk_departments_head 
        FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL
      `);
    } catch (err) {
      // Ignore if constraint already exists
      if (!err.message.includes('already exists')) {
        console.warn('Department head foreign key warning:', err.message);
      }
    }

    // 5. Create employee education table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS employee_education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        degree VARCHAR(100),
        institution VARCHAR(100),
        start_year INT,
        end_year INT,
        description TEXT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 6. Create employee experience table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS employee_experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        company VARCHAR(100),
        position VARCHAR(100),
        start_date DATE,
        end_date DATE,
        description TEXT,
        is_current BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 7. Create employee documents table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS employee_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        document_type ENUM('id_proof', 'address_proof', 'education', 'experience', 'contract', 'other') NOT NULL,
        document_name VARCHAR(100) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INT DEFAULT 0,
        mime_type VARCHAR(100),
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // 8. Create employee salaries table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS employee_salaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        basic_salary DECIMAL(10,2),
        allowances DECIMAL(10,2) DEFAULT 0,
        deductions DECIMAL(10,2) DEFAULT 0,
        gross_salary DECIMAL(10,2),
        effective_date DATE NOT NULL,
        created_by INT,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    try {
      await executeQuery('CREATE INDEX idx_employees_department ON employees(department)');
      await executeQuery('CREATE INDEX idx_employees_designation ON employees(designation)');
      await executeQuery('CREATE INDEX idx_employees_status ON employees(employment_status)');
      await executeQuery('CREATE INDEX idx_employees_email ON employees(email)');
      await executeQuery('CREATE INDEX idx_employees_employee_id ON employees(employee_id)');
    } catch (err) {
      // Indexes might already exist, ignore errors
      console.warn('Index creation warning:', err.message);
    }

    // Insert default departments
    const defaultDepartments = [
      { name: 'Engineering', description: 'Software development and technical teams' },
      { name: 'Marketing', description: 'Marketing, branding, and customer outreach' },
      { name: 'Sales', description: 'Business development and sales operations' },
      { name: 'Human Resources', description: 'HR, recruitment, and employee management' },
      { name: 'Finance', description: 'Accounting, finance, and administration' },
      { name: 'Operations', description: 'General operations and project management' }
    ];
    
    for (const dept of defaultDepartments) {
      try {
        await executeQuery(
          'INSERT IGNORE INTO departments (name, description) VALUES (?, ?)',
          [dept.name, dept.description]
        );
      } catch (err) {
        // Ignore duplicate key errors
        if (!err.message.includes('Duplicate entry')) {
          console.warn('Department insert warning:', err.message);
        }
      }
    }

    // Insert default designations
    const designations = [
      { title: 'Software Engineer', department: 'Engineering', level: 3, description: 'Software development and programming' },
      { title: 'Senior Software Engineer', department: 'Engineering', level: 5, description: 'Senior software development role' },
      { title: 'Technical Lead', department: 'Engineering', level: 7, description: 'Technical leadership and team management' },
      { title: 'Marketing Executive', department: 'Marketing', level: 3, description: 'Marketing campaigns and brand management' },
      { title: 'Sales Executive', department: 'Sales', level: 3, description: 'Sales and business development' },
      { title: 'HR Executive', department: 'Human Resources', level: 3, description: 'Human resources and recruitment' },
      { title: 'Project Manager', department: 'Operations', level: 6, description: 'Project planning and management' },
      { title: 'Manager', department: null, level: 6, description: 'Department or team management role' },
      { title: 'Senior Manager', department: null, level: 7, description: 'Senior management position' },
      { title: 'Director', department: null, level: 9, description: 'Director level position' }
    ];
    
    for (const desig of designations) {
      try {
        let deptId = null;
        
        if (desig.department) {
          const deptResult = await executeQuery(
            'SELECT id FROM departments WHERE name = ?',
            [desig.department]
          );
          
          if (deptResult.length > 0) {
            deptId = deptResult[0].id;
          }
        }
        
        await executeQuery(
          'INSERT IGNORE INTO designations (title, department_id, level, description) VALUES (?, ?, ?, ?)',
          [desig.title, deptId, desig.level, desig.description]
        );
      } catch (err) {
        // Ignore duplicate key errors
        if (!err.message.includes('Duplicate entry')) {
          console.warn('Designation insert warning:', err.message);
        }
      }
    }

    // Check if users table has employee_id column and add it if needed
    try {
      const userColumns = await executeQuery(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND TABLE_SCHEMA = DATABASE()
      `);
      
      const columnNames = userColumns.map(col => col.COLUMN_NAME.toLowerCase());
      
      // Add employee_id column if it doesn't exist
      if (!columnNames.includes('employee_id')) {
        await executeQuery(`
          ALTER TABLE users 
          ADD COLUMN employee_id INT UNIQUE NULL,
          ADD CONSTRAINT fk_users_employee 
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
        `);
      }
    } catch (err) {
      console.warn('User table modification warning:', err.message);
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Employee management system initialized successfully',
      details: {
        tablesCreated: [
          'departments',
          'designations', 
          'employees',
          'employee_education',
          'employee_experience', 
          'employee_documents',
          'employee_salaries'
        ],
        defaultDataInserted: true,
        indexesCreated: true
      }
    });
    
  } catch (error) {
    console.error('Employee system initialization error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to initialize employee management system', 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
}
