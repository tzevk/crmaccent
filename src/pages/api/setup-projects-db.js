import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up projects database schema...');

    // Create projects table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        client_id INT,
        lead_id INT,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        estimated_hours DECIMAL(10,2) DEFAULT 0,
        actual_hours DECIMAL(10,2) DEFAULT 0,
        budget DECIMAL(15,2) DEFAULT 0,
        cost DECIMAL(15,2) DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        project_manager_id INT,
        team_members JSON,
        tags VARCHAR(500),
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_client (client_id),
        INDEX idx_lead (lead_id),
        INDEX idx_manager (project_manager_id),
        INDEX idx_dates (start_date, end_date)
      )
    `);

    // Create project_tasks table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('todo', 'in_progress', 'review', 'completed', 'cancelled') DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        assigned_to INT,
        estimated_hours DECIMAL(8,2) DEFAULT 0,
        actual_hours DECIMAL(8,2) DEFAULT 0,
        start_date DATE,
        due_date DATE,
        completed_date DATE,
        parent_task_id INT,
        order_index INT DEFAULT 0,
        tags VARCHAR(500),
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        INDEX idx_project (project_id),
        INDEX idx_status (status),
        INDEX idx_assigned (assigned_to),
        INDEX idx_parent (parent_task_id)
      )
    `);

    // Create project_activities table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS project_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_id INT,
        activity_type ENUM('status_change', 'task_created', 'task_completed', 'comment', 'file_upload', 'milestone', 'budget_update') DEFAULT 'comment',
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        metadata JSON,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        INDEX idx_project (project_id),
        INDEX idx_task (task_id),
        INDEX idx_type (activity_type),
        INDEX idx_date (activity_date)
      )
    `);

    // Create project_time_logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS project_time_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_id INT,
        user_id INT NOT NULL,
        description TEXT,
        hours DECIMAL(8,2) NOT NULL,
        date DATE NOT NULL,
        is_billable BOOLEAN DEFAULT TRUE,
        hourly_rate DECIMAL(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        INDEX idx_project (project_id),
        INDEX idx_task (task_id),
        INDEX idx_user (user_id),
        INDEX idx_date (date)
      )
    `);

    // Create project_milestones table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        completed_date DATE,
        status ENUM('pending', 'completed', 'overdue') DEFAULT 'pending',
        order_index INT DEFAULT 0,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        INDEX idx_project (project_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date)
      )
    `);

    // Insert sample project statuses and priorities data
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS project_statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#6B7280',
        is_active BOOLEAN DEFAULT TRUE,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default project statuses
    const defaultStatuses = [
      ['planning', 'Project Planning', '#3B82F6', true, 1],
      ['active', 'Active Development', '#10B981', true, 2],
      ['on_hold', 'On Hold', '#F59E0B', true, 3],
      ['completed', 'Completed', '#059669', true, 4],
      ['cancelled', 'Cancelled', '#EF4444', true, 5]
    ];

    for (const status of defaultStatuses) {
      await executeQuery(`
        INSERT IGNORE INTO project_statuses (name, description, color, is_active, order_index)
        VALUES (?, ?, ?, ?, ?)
      `, status);
    }

    // Insert sample data for testing
    await executeQuery(`
      INSERT IGNORE INTO projects (
        name, description, status, priority, start_date, end_date, 
        estimated_hours, budget, project_manager_id, team_members, 
        tags, notes, created_by
      ) VALUES 
      (
        'CRM System Development', 
        'Comprehensive customer relationship management system with lead tracking, project management, and analytics capabilities.',
        'active',
        'high',
        '2025-01-01',
        '2025-06-30',
        800.00,
        500000.00,
        1,
        '["1", "2", "3"]',
        'CRM, Development, Web Application',
        'Primary project for Q1-Q2 2025. Critical for business growth.',
        1
      ),
      (
        'Mobile App Development',
        'Native mobile application for iOS and Android platforms with offline capabilities.',
        'planning',
        'medium',
        '2025-03-01',
        '2025-08-31',
        600.00,
        300000.00,
        1,
        '["2", "4"]',
        'Mobile, iOS, Android, React Native',
        'Secondary project dependent on CRM completion.',
        1
      ),
      (
        'Website Redesign',
        'Complete overhaul of company website with modern design and improved performance.',
        'completed',
        'low',
        '2024-10-01',
        '2024-12-31',
        200.00,
        75000.00,
        1,
        '["3", "5"]',
        'Website, Design, Frontend',
        'Successfully completed ahead of schedule.',
        1
      )
    `);

    // Insert sample tasks
    await executeQuery(`
      INSERT IGNORE INTO project_tasks (
        project_id, title, description, status, priority, assigned_to,
        estimated_hours, start_date, due_date, tags, created_by
      ) VALUES 
      (1, 'Database Schema Design', 'Design and implement database schema for CRM system', 'completed', 'high', 1, 40.00, '2025-01-01', '2025-01-15', 'Database, Backend', 1),
      (1, 'User Authentication System', 'Implement secure user login and registration', 'completed', 'high', 1, 32.00, '2025-01-10', '2025-01-25', 'Auth, Security', 1),
      (1, 'Lead Management Module', 'Build complete lead tracking and management system', 'completed', 'high', 1, 80.00, '2025-01-20', '2025-02-15', 'Leads, Frontend', 1),
      (1, 'Project Management Module', 'Implement project tracking and task management', 'in_progress', 'high', 1, 100.00, '2025-02-01', '2025-03-15', 'Projects, Tasks', 1),
      (1, 'Analytics Dashboard', 'Create comprehensive analytics and reporting', 'todo', 'medium', 1, 60.00, '2025-03-01', '2025-04-01', 'Analytics, Charts', 1),
      (2, 'Mobile UI/UX Design', 'Design mobile application interface', 'todo', 'medium', 2, 80.00, '2025-03-01', '2025-03-31', 'Design, Mobile', 1),
      (2, 'API Integration', 'Integrate mobile app with CRM APIs', 'todo', 'high', 2, 120.00, '2025-04-01', '2025-05-15', 'API, Integration', 1)
    `);

    // Insert sample activities
    await executeQuery(`
      INSERT IGNORE INTO project_activities (
        project_id, task_id, activity_type, subject, description, created_by
      ) VALUES 
      (1, 1, 'task_completed', 'Database schema completed', 'Successfully designed and implemented the complete database schema for the CRM system', 1),
      (1, 2, 'task_completed', 'Authentication system ready', 'User authentication and authorization system is now functional', 1),
      (1, 3, 'task_completed', 'Lead management module finished', 'Complete lead tracking system with CRUD operations is ready', 1),
      (1, 4, 'status_change', 'Project management module in progress', 'Started working on the project management features', 1),
      (1, NULL, 'milestone', 'Phase 1 completed', 'Successfully completed the first phase of CRM development', 1)
    `);

    // Insert sample time logs
    await executeQuery(`
      INSERT IGNORE INTO project_time_logs (
        project_id, task_id, user_id, description, hours, date, is_billable, hourly_rate
      ) VALUES 
      (1, 1, 1, 'Database schema design and implementation', 8.5, '2025-01-05', true, 75.00),
      (1, 1, 1, 'Database optimization and testing', 6.0, '2025-01-08', true, 75.00),
      (1, 2, 1, 'Authentication system development', 8.0, '2025-01-15', true, 75.00),
      (1, 3, 1, 'Lead management frontend development', 10.0, '2025-02-01', true, 75.00),
      (1, 4, 1, 'Project management module planning', 4.0, '2025-02-05', true, 75.00)
    `);

    console.log('Projects database schema setup completed successfully');

    return res.status(200).json({
      message: 'Projects database schema created successfully',
      tables: [
        'projects',
        'project_tasks', 
        'project_activities',
        'project_time_logs',
        'project_milestones',
        'project_statuses'
      ]
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      message: 'Failed to set up projects database', 
      error: error.message 
    });
  }
}
