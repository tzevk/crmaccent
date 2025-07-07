import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up comprehensive project management database...');

    // Drop existing tables to avoid conflicts (in correct order)
    const dropTables = [
      'project_team',
      'salaries', 
      'manuals',
      'activities',
      'project_scopes',
      'inquiries',
      'employees',
      'disciplines',
      'activity_master'
    ];

    for (const table of dropTables) {
      try {
        await executeQuery(`DROP TABLE IF EXISTS ${table}`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} didn't exist or couldn't be dropped:`, error.message);
      }
    }

    // Drop the existing projects table separately to handle dependencies
    try {
      await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
      await executeQuery('DROP TABLE IF EXISTS projects');
      await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
      console.log('Dropped existing projects table');
    } catch (error) {
      console.log('Error dropping projects table:', error.message);
    }

    // 1. Activity Master - Predefined activities
    await executeQuery(`
      CREATE TABLE activity_master (
        id INT PRIMARY KEY AUTO_INCREMENT,
        activity_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 2. Disciplines Master
    await executeQuery(`
      CREATE TABLE disciplines (
        id INT PRIMARY KEY AUTO_INCREMENT,
        discipline_name VARCHAR(255) NOT NULL UNIQUE,
        start_date DATE,
        end_date DATE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 3. Employees Master with Auto User Credentials
    await executeQuery(`
      CREATE TABLE employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        designation VARCHAR(255),
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Manager', 'Staff') DEFAULT 'Staff',
        status ENUM('Active', 'Inactive', 'Terminated') DEFAULT 'Active',
        hire_date DATE,
        department VARCHAR(255),
        profile_image VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // 4. Inquiries
    await executeQuery(`
      CREATE TABLE inquiries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inquiry_number VARCHAR(100) UNIQUE NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        client_phone VARCHAR(20),
        client_company VARCHAR(255),
        inquiry_type VARCHAR(100),
        discipline_id INT,
        description TEXT,
        status ENUM('New', 'Under Review', 'Quoted', 'Converted', 'Rejected') DEFAULT 'New',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        source VARCHAR(100),
        estimated_value DECIMAL(15,2),
        inquiry_date DATE,
        follow_up_date DATE,
        assigned_to INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 5. Projects Master
    await executeQuery(`
      CREATE TABLE projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id VARCHAR(100) UNIQUE NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        inquiry_id INT,
        discipline_id INT,
        client_name VARCHAR(255) NOT NULL,
        client_email VARCHAR(255),
        client_phone VARCHAR(20),
        client_company VARCHAR(255),
        start_date DATE,
        end_date DATE,
        status ENUM('Planned', 'Active', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planned',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        budget DECIMAL(15,2),
        actual_cost DECIMAL(15,2) DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        project_manager_id INT,
        description TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
        FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL,
        FOREIGN KEY (project_manager_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 6. Project Scopes
    await executeQuery(`
      CREATE TABLE project_scopes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        scope_name VARCHAR(255) NOT NULL,
        description TEXT,
        deliverables TEXT,
        start_date DATE,
        end_date DATE,
        status ENUM('Pending', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Pending',
        budget DECIMAL(15,2),
        responsible_person_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (responsible_person_id) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 7. Activities (linked to project scopes)
    await executeQuery(`
      CREATE TABLE activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        scope_id INT NOT NULL,
        activity_master_id INT,
        activity_name VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        due_date DATE,
        status ENUM('Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
        assigned_to INT,
        estimated_hours DECIMAL(8,2),
        actual_hours DECIMAL(8,2) DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        dependencies TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (scope_id) REFERENCES project_scopes(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_master_id) REFERENCES activity_master(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    // 8. Project Team Assignment
    await executeQuery(`
      CREATE TABLE project_team (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        employee_id INT NOT NULL,
        role ENUM('Project Manager', 'Engineer', 'Reviewer', 'Drafter', 'Coordinator', 'Quality Assurance') NOT NULL,
        assigned_by INT,
        assigned_date DATE DEFAULT (CURRENT_DATE),
        start_date DATE,
        end_date DATE,
        hourly_rate DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE SET NULL,
        UNIQUE KEY unique_project_employee_role (project_id, employee_id, role)
      )
    `);

    // 9. Manuals (Project Documents)
    await executeQuery(`
      CREATE TABLE manuals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        manual_name VARCHAR(255) NOT NULL,
        project_id INT NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        file_type VARCHAR(50),
        file_size INT,
        description TEXT,
        category VARCHAR(100),
        uploaded_by INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        version VARCHAR(50) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        access_level ENUM('Public', 'Team', 'Restricted') DEFAULT 'Team',
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES employees(id) ON DELETE RESTRICT
      )
    `);

    // 10. Salary Module
    await executeQuery(`
      CREATE TABLE salaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        salary_type ENUM('Monthly', 'Hourly') NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        effective_from DATE NOT NULL,
        effective_to DATE,
        is_current BOOLEAN DEFAULT true,
        bonus_eligible BOOLEAN DEFAULT false,
        overtime_rate DECIMAL(10,2),
        benefits TEXT,
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);

    console.log('All tables created successfully. Inserting sample data...');

    // Insert sample data for Activity Master
    const activityMasterData = [
      ['Design Drafting', 'Create technical drawings and designs', 'Design'],
      ['Review', 'Review and approve technical documents', 'Quality'],
      ['Documentation', 'Prepare project documentation', 'Documentation'],
      ['Submission', 'Submit documents to authorities', 'Compliance'],
      ['Site Survey', 'Conduct site surveys and assessments', 'Field Work'],
      ['Calculations', 'Perform engineering calculations', 'Engineering'],
      ['Coordination', 'Coordinate with stakeholders', 'Management'],
      ['Quality Check', 'Perform quality assurance checks', 'Quality'],
      ['Client Meeting', 'Meet with clients for updates', 'Communication'],
      ['Regulatory Approval', 'Obtain regulatory approvals', 'Compliance']
    ];

    for (const [name, desc, category] of activityMasterData) {
      await executeQuery(
        'INSERT INTO activity_master (activity_name, description, category) VALUES (?, ?, ?)',
        [name, desc, category]
      );
    }

    // Insert sample disciplines
    const disciplinesData = [
      ['Civil Engineering', '2024-01-01', '2024-12-31', 'Civil engineering and construction projects'],
      ['Mechanical Engineering', '2024-01-01', '2024-12-31', 'Mechanical systems and equipment design'],
      ['Electrical Engineering', '2024-01-01', '2024-12-31', 'Electrical systems and power distribution'],
      ['Structural Engineering', '2024-01-01', '2024-12-31', 'Structural design and analysis'],
      ['Environmental Engineering', '2024-01-01', '2024-12-31', 'Environmental impact and sustainability']
    ];

    for (const [name, startDate, endDate, desc] of disciplinesData) {
      await executeQuery(
        'INSERT INTO disciplines (discipline_name, start_date, end_date, description) VALUES (?, ?, ?, ?)',
        [name, startDate, endDate, desc]
      );
    }

    // Insert sample employees
    const employeesData = [
      ['John Doe', 'john.doe@company.com', '+1-555-0101', 'Senior Engineer', 'john.doe', '$2b$10$example1', 'Manager', 'Active', '2024-01-15'],
      ['Jane Smith', 'jane.smith@company.com', '+1-555-0102', 'Project Manager', 'jane.smith', '$2b$10$example2', 'Manager', 'Active', '2024-02-01'],
      ['Mike Johnson', 'mike.johnson@company.com', '+1-555-0103', 'Design Engineer', 'mike.johnson', '$2b$10$example3', 'Staff', 'Active', '2024-03-01'],
      ['Sarah Wilson', 'sarah.wilson@company.com', '+1-555-0104', 'Quality Reviewer', 'sarah.wilson', '$2b$10$example4', 'Staff', 'Active', '2024-01-20'],
      ['Admin User', 'admin@company.com', '+1-555-0100', 'System Administrator', 'admin', '$2b$10$example0', 'Admin', 'Active', '2024-01-01']
    ];

    for (const [name, email, phone, designation, username, password, role, status, hireDate] of employeesData) {
      await executeQuery(
        'INSERT INTO employees (name, email, phone, designation, username, password, role, status, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone, designation, username, password, role, status, hireDate]
      );
    }

    // Insert sample inquiries
    await executeQuery(`
      INSERT INTO inquiries (inquiry_number, client_name, client_email, client_phone, client_company, inquiry_type, discipline_id, description, status, priority, source, estimated_value, inquiry_date, assigned_to)
      VALUES 
      ('INQ-2024-001', 'ABC Corporation', 'contact@abc.com', '+1-555-1001', 'ABC Corp', 'New Project', 1, 'Office building design and construction', 'Under Review', 'High', 'Website', 500000.00, '2024-06-01', 1),
      ('INQ-2024-002', 'XYZ Industries', 'info@xyz.com', '+1-555-1002', 'XYZ Ltd', 'Renovation', 2, 'Factory equipment upgrade', 'Quoted', 'Medium', 'Referral', 250000.00, '2024-06-05', 2),
      ('INQ-2024-003', 'Tech Solutions', 'hello@techsol.com', '+1-555-1003', 'Tech Solutions Inc', 'Consultation', 3, 'Electrical system assessment', 'New', 'Low', 'Email', 75000.00, '2024-06-10', 1)
    `);

    // Insert sample projects
    await executeQuery(`
      INSERT INTO projects (project_id, project_name, inquiry_id, discipline_id, client_name, client_email, start_date, end_date, status, priority, budget, project_manager_id, description)
      VALUES 
      ('PRJ-2024-001', 'ABC Office Complex', 1, 1, 'ABC Corporation', 'contact@abc.com', '2024-07-01', '2024-12-31', 'Active', 'High', 500000.00, 1, 'Complete office building design and construction supervision'),
      ('PRJ-2024-002', 'XYZ Factory Upgrade', 2, 2, 'XYZ Industries', 'info@xyz.com', '2024-08-01', '2024-11-30', 'Planned', 'Medium', 250000.00, 2, 'Mechanical equipment upgrade and installation')
    `);

    // Insert sample project scopes
    await executeQuery(`
      INSERT INTO project_scopes (project_id, scope_name, description, start_date, end_date, status, budget, responsible_person_id)
      VALUES 
      (1, 'Architectural Design', 'Complete architectural plans and drawings', '2024-07-01', '2024-08-15', 'In Progress', 150000.00, 3),
      (1, 'Structural Analysis', 'Structural engineering and calculations', '2024-08-01', '2024-09-15', 'Pending', 100000.00, 1),
      (2, 'Equipment Selection', 'Select and specify mechanical equipment', '2024-08-01', '2024-09-01', 'Pending', 100000.00, 2)
    `);

    // Insert sample activities
    await executeQuery(`
      INSERT INTO activities (scope_id, activity_master_id, activity_name, description, start_date, due_date, status, priority, assigned_to, estimated_hours)
      VALUES 
      (1, 1, 'Floor Plan Design', 'Create detailed floor plans for all levels', '2024-07-01', '2024-07-15', 'In Progress', 'High', 3, 80.0),
      (1, 8, 'Design Review', 'Review and approve architectural designs', '2024-07-16', '2024-07-25', 'Pending', 'Medium', 4, 20.0),
      (2, 6, 'Load Calculations', 'Perform structural load calculations', '2024-08-01', '2024-08-10', 'Pending', 'High', 1, 60.0)
    `);

    // Insert sample project team assignments
    await executeQuery(`
      INSERT INTO project_team (project_id, employee_id, role, assigned_by, start_date, hourly_rate)
      VALUES 
      (1, 1, 'Project Manager', 5, '2024-07-01', 85.00),
      (1, 3, 'Engineer', 1, '2024-07-01', 65.00),
      (1, 4, 'Reviewer', 1, '2024-07-01', 70.00),
      (2, 2, 'Project Manager', 5, '2024-08-01', 90.00),
      (2, 3, 'Engineer', 2, '2024-08-01', 65.00)
    `);

    // Insert sample salary data
    await executeQuery(`
      INSERT INTO salaries (employee_id, salary_type, amount, effective_from, is_current, created_by)
      VALUES 
      (1, 'Monthly', 8500.00, '2024-01-01', true, 5),
      (2, 'Monthly', 9000.00, '2024-01-01', true, 5),
      (3, 'Hourly', 65.00, '2024-01-01', true, 5),
      (4, 'Hourly', 70.00, '2024-01-01', true, 5),
      (5, 'Monthly', 12000.00, '2024-01-01', true, 5)
    `);

    console.log('Sample data inserted successfully!');

    return res.status(200).json({
      message: 'Comprehensive project management database setup completed successfully!',
      tables_created: [
        'activity_master',
        'disciplines', 
        'employees',
        'inquiries',
        'projects',
        'project_scopes',
        'activities',
        'project_team',
        'manuals',
        'salaries'
      ],
      sample_data: 'Inserted sample data for all tables',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({
      message: 'Database setup failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
