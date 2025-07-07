import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up additional project management modules...');

    // First, let's check existing tables to avoid conflicts
    const showTablesResult = await executeQuery('SHOW TABLES');
    const existingTables = showTablesResult.map(row => Object.values(row)[0]);
    console.log('Existing tables:', existingTables);

    // 1. Activity Master - Predefined activities (only if doesn't exist)
    if (!existingTables.includes('activity_master')) {
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
      console.log('Created activity_master table');
    }

    // 2. Disciplines Master
    if (!existingTables.includes('disciplines')) {
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
      console.log('Created disciplines table');
    }

    // 3. Employees Master with Auto User Credentials
    if (!existingTables.includes('employees')) {
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
      console.log('Created employees table');
    }

    // 4. Inquiries
    if (!existingTables.includes('inquiries')) {
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
      console.log('Created inquiries table');
    }

    // 5. Project Scopes (extends existing projects)
    if (!existingTables.includes('project_scopes')) {
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
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )
      `);
      console.log('Created project_scopes table');
    }

    // 6. Activities (extends existing tasks, linked to project scopes)
    if (!existingTables.includes('project_activities')) {
      await executeQuery(`
        CREATE TABLE project_activities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          scope_id INT,
          project_id INT NOT NULL,
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
          FOREIGN KEY (scope_id) REFERENCES project_scopes(id) ON DELETE SET NULL,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
          FOREIGN KEY (activity_master_id) REFERENCES activity_master(id) ON DELETE SET NULL
        )
      `);
      console.log('Created project_activities table');
    }

    // 7. Project Team Assignment
    if (!existingTables.includes('project_team')) {
      await executeQuery(`
        CREATE TABLE project_team (
          id INT PRIMARY KEY AUTO_INCREMENT,
          project_id INT NOT NULL,
          employee_id INT,
          user_id INT,
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
          FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Created project_team table');
    }

    // 8. Manuals (Project Documents)
    if (!existingTables.includes('project_manuals')) {
      await executeQuery(`
        CREATE TABLE project_manuals (
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
          FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
        )
      `);
      console.log('Created project_manuals table');
    }

    // 9. Salary Module
    if (!existingTables.includes('employee_salaries')) {
      await executeQuery(`
        CREATE TABLE employee_salaries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          employee_id INT,
          user_id INT,
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      console.log('Created employee_salaries table');
    }

    console.log('Tables created successfully. Inserting sample data...');

    // Insert sample data for Activity Master
    const activityCount = await executeQuery('SELECT COUNT(*) as count FROM activity_master');
    if (activityCount[0].count === 0) {
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
    }

    // Insert sample disciplines
    const disciplineCount = await executeQuery('SELECT COUNT(*) as count FROM disciplines');
    if (disciplineCount[0].count === 0) {
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
    }

    // Insert sample employees
    const employeeCount = await executeQuery('SELECT COUNT(*) as count FROM employees');
    if (employeeCount[0].count === 0) {
      const employeesData = [
        ['John Doe', 'john.doe@company.com', '+1-555-0101', 'Senior Engineer', 'john.doe', '$2b$10$example1', 'Manager', 'Active', '2024-01-15'],
        ['Jane Smith', 'jane.smith@company.com', '+1-555-0102', 'Project Manager', 'jane.smith', '$2b$10$example2', 'Manager', 'Active', '2024-02-01'],
        ['Mike Johnson', 'mike.johnson@company.com', '+1-555-0103', 'Design Engineer', 'mike.johnson', '$2b$10$example3', 'Staff', 'Active', '2024-03-01'],
        ['Sarah Wilson', 'sarah.wilson@company.com', '+1-555-0104', 'Quality Reviewer', 'sarah.wilson', '$2b$10$example4', 'Staff', 'Active', '2024-01-20'],
        ['Engineering Admin', 'admin@company.com', '+1-555-0100', 'System Administrator', 'eng.admin', '$2b$10$example0', 'Admin', 'Active', '2024-01-01']
      ];

      for (const [name, email, phone, designation, username, password, role, status, hireDate] of employeesData) {
        await executeQuery(
          'INSERT INTO employees (name, email, phone, designation, username, password, role, status, hire_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [name, email, phone, designation, username, password, role, status, hireDate]
        );
      }
    }

    console.log('Sample data inserted successfully!');

    return res.status(200).json({
      message: 'Project management modules setup completed successfully!',
      existing_tables: existingTables,
      new_tables_created: [
        'activity_master',
        'disciplines', 
        'employees',
        'inquiries',
        'project_scopes',
        'project_activities',
        'project_team',
        'project_manuals',
        'employee_salaries'
      ],
      sample_data: 'Inserted sample data for new tables',
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
