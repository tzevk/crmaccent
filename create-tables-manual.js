require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function createTables() {
  let connection;
  try {
    console.log('Connecting to database...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Connected successfully!');
    
    // Create proposals table
    console.log('Creating proposals table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        proposal_id VARCHAR(50) NOT NULL UNIQUE,
        proposal_title VARCHAR(255) NOT NULL,
        proposal_date DATE NOT NULL,
        prepared_by VARCHAR(100),
        
        client_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255) NOT NULL,
        designation VARCHAR(100),
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20),
        address TEXT,
        
        project_name VARCHAR(255) NOT NULL,
        project_type VARCHAR(100),
        scope_of_work TEXT NOT NULL,
        estimated_value DECIMAL(15, 2),
        estimated_duration VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'INR',
        
        current_status ENUM('Draft', 'Submitted', 'Under Discussion', 'Awaiting Response', 'Awarded', 'Lost', 'Closed') DEFAULT 'Draft',
        submission_mode VARCHAR(50),
        follow_up_date DATE,
        expected_decision_date DATE,
        
        proposal_owner VARCHAR(100),
        department VARCHAR(100),
        internal_notes TEXT,
        
        is_converted_to_project BOOLEAN DEFAULT FALSE,
        project_id VARCHAR(50),
        
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_proposal_id (proposal_id),
        INDEX idx_client_name (client_name),
        INDEX idx_current_status (current_status),
        INDEX idx_proposal_date (proposal_date),
        INDEX idx_is_converted (is_converted_to_project)
      )
    `);
    console.log('Proposals table created successfully!');
    
    // Create projects table
    console.log('Creating projects table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(50) NOT NULL UNIQUE,
        project_name VARCHAR(255) NOT NULL,
        project_type VARCHAR(100),
        description TEXT,
        
        client_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        client_email VARCHAR(255),
        client_phone VARCHAR(20),
        client_address TEXT,
        
        estimated_value DECIMAL(15, 2),
        actual_value DECIMAL(15, 2),
        estimated_duration VARCHAR(100),
        actual_duration VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'INR',
        
        project_status ENUM('Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled') DEFAULT 'Planning',
        priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
        start_date DATE,
        expected_completion_date DATE,
        actual_completion_date DATE,
        
        project_owner VARCHAR(100),
        project_manager VARCHAR(100),
        department VARCHAR(100),
        team_members TEXT,
        
        completion_percentage DECIMAL(5, 2) DEFAULT 0.00,
        
        budget_allocated DECIMAL(15, 2),
        budget_spent DECIMAL(15, 2) DEFAULT 0.00,
        
        proposal_reference_id VARCHAR(50),
        created_from_proposal BOOLEAN DEFAULT FALSE,
        
        project_notes TEXT,
        internal_notes TEXT,
        
        created_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_project_id (project_id),
        INDEX idx_client_name (client_name),
        INDEX idx_project_status (project_status),
        INDEX idx_start_date (start_date),
        INDEX idx_proposal_reference (proposal_reference_id)
      )
    `);
    console.log('Projects table created successfully!');
    
    // Create project_tasks table
    console.log('Creating project_tasks table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(50) NOT NULL,
        task_name VARCHAR(255) NOT NULL,
        task_description TEXT,
        task_status ENUM('Pending', 'In Progress', 'Completed', 'On Hold') DEFAULT 'Pending',
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        assigned_to VARCHAR(100),
        start_date DATE,
        due_date DATE,
        completion_date DATE,
        estimated_hours DECIMAL(5, 2),
        actual_hours DECIMAL(5, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_project_id (project_id),
        INDEX idx_task_status (task_status),
        INDEX idx_assigned_to (assigned_to)
      )
    `);
    console.log('Project tasks table created successfully!');
    
    // Create project_milestones table
    console.log('Creating project_milestones table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id VARCHAR(50) NOT NULL,
        milestone_name VARCHAR(255) NOT NULL,
        milestone_description TEXT,
        milestone_date DATE NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        completion_date DATE,
        milestone_type ENUM('Start', 'Checkpoint', 'Deliverable', 'Completion') DEFAULT 'Checkpoint',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_project_id (project_id),
        INDEX idx_milestone_date (milestone_date)
      )
    `);
    console.log('Project milestones table created successfully!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Current tables:', tables.map(t => Object.values(t)[0]));
    
    await connection.end();
    console.log('All tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    if (connection) await connection.end();
    return false;
  }
}

createTables().then(result => {
  console.log('Table creation result:', result);
  process.exit(result ? 0 : 1);
});
