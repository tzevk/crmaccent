import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up Phase 2: Project Management Tables...');

    // ========== PROJECT MANAGEMENT TABLES ==========

    // 13. Project Scopes
    await executeQuery(`
      CREATE TABLE project_scopes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        default_hours DECIMAL(8,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created project_scopes table');

    // 14. Inquiries
    await executeQuery(`
      CREATE TABLE inquiries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        inquiry_number VARCHAR(50) UNIQUE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        client_id INT NULL,
        lead_id INT NULL,
        contact_name VARCHAR(255),
        contact_email VARCHAR(255),
        contact_phone VARCHAR(20),
        project_type VARCHAR(100),
        estimated_budget DECIMAL(15,2),
        timeline VARCHAR(100),
        status ENUM('received', 'reviewing', 'quoted', 'accepted', 'rejected', 'converted') DEFAULT 'received',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        assigned_to INT NULL,
        converted_to_project BOOLEAN DEFAULT false,
        project_id INT NULL,
        received_date DATE,
        response_due_date DATE,
        notes TEXT,
        attachments JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_inquiry_number (inquiry_number),
        INDEX idx_status (status),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_converted (converted_to_project)
      )
    `);
    console.log('Created inquiries table');

    // 15. Projects - Enhanced with RBAC
    await executeQuery(`
      CREATE TABLE projects (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_number VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        client_id INT NULL,
        lead_id INT NULL,
        inquiry_id INT NULL,
        project_manager_id INT NULL,
        status VARCHAR(50) DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        start_date DATE,
        end_date DATE,
        estimated_hours DECIMAL(8,2) DEFAULT 0,
        actual_hours DECIMAL(8,2) DEFAULT 0,
        budget DECIMAL(15,2) DEFAULT 0,
        actual_cost DECIMAL(15,2) DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        team_members JSON,
        tags JSON,
        notes TEXT,
        is_billable BOOLEAN DEFAULT true,
        is_archived BOOLEAN DEFAULT false,
        visibility ENUM('public', 'team', 'private') DEFAULT 'team',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        updated_by INT NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL,
        FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE SET NULL,
        FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_number (project_number),
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_project_manager (project_manager_id),
        INDEX idx_client_id (client_id),
        INDEX idx_dates (start_date, end_date),
        INDEX idx_archived (is_archived)
      )
    `);
    console.log('Created projects table');

    // 16. Project Team - RBAC-aware team assignments
    await executeQuery(`
      CREATE TABLE project_team (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(100) DEFAULT 'team_member',
        permissions JSON,
        hourly_rate DECIMAL(10,2),
        can_edit_tasks BOOLEAN DEFAULT true,
        can_view_budget BOOLEAN DEFAULT false,
        can_manage_team BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        joined_date DATE DEFAULT (CURRENT_DATE),
        left_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_project_user (project_id, user_id),
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_role (role)
      )
    `);
    console.log('Created project_team table');

    // 17. Project Tasks - Enhanced with ownership and permissions
    await executeQuery(`
      CREATE TABLE project_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        parent_task_id INT NULL,
        task_number VARCHAR(50),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        activity_id INT NULL,
        discipline_id INT NULL,
        assignee_id INT NULL,
        reviewer_id INT NULL,
        status VARCHAR(50) DEFAULT 'todo',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        estimated_hours DECIMAL(8,2) DEFAULT 0,
        actual_hours DECIMAL(8,2) DEFAULT 0,
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        start_date DATE,
        due_date DATE,
        completed_date DATE NULL,
        visibility ENUM('public', 'team', 'private', 'assignee_only') DEFAULT 'team',
        is_billable BOOLEAN DEFAULT true,
        tags JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        updated_by INT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (activity_id) REFERENCES activity_master(id) ON DELETE SET NULL,
        FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL,
        FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_assignee_id (assignee_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_task_number (task_number)
      )
    `);
    console.log('Created project_tasks table');

    // 18. Project Time Logs - For time tracking with RBAC
    await executeQuery(`
      CREATE TABLE project_time_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        task_id INT NULL,
        user_id INT NOT NULL,
        activity_id INT NULL,
        description TEXT,
        hours_logged DECIMAL(8,2) NOT NULL,
        date_logged DATE NOT NULL,
        is_billable BOOLEAN DEFAULT true,
        hourly_rate DECIMAL(10,2),
        total_cost DECIMAL(10,2),
        is_approved BOOLEAN DEFAULT false,
        approved_by INT NULL,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activity_id) REFERENCES activity_master(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_date_logged (date_logged),
        INDEX idx_approved (is_approved)
      )
    `);
    console.log('Created project_time_logs table');

    // 19. Project Activities/History - Audit trail with RBAC
    await executeQuery(`
      CREATE TABLE project_activities (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        task_id INT NULL,
        user_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_visible_to_client BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_project_id (project_id),
        INDEX idx_user_id (user_id),
        INDEX idx_activity_type (activity_type),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('Created project_activities table');

    // 20. Project Milestones
    await executeQuery(`
      CREATE TABLE project_milestones (
        id INT PRIMARY KEY AUTO_INCREMENT,
        project_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        due_date DATE,
        completed_date DATE NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        progress_percentage DECIMAL(5,2) DEFAULT 0,
        is_critical BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_project_id (project_id),
        INDEX idx_due_date (due_date),
        INDEX idx_status (status)
      )
    `);
    console.log('Created project_milestones table');

    // ========== ADDITIONAL TABLES ==========

    // 21. Salaries - RBAC protected
    await executeQuery(`
      CREATE TABLE salaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        salary_type ENUM('monthly', 'annual', 'hourly', 'project_based') DEFAULT 'monthly',
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        effective_date DATE NOT NULL,
        end_date DATE NULL,
        bonus DECIMAL(15,2) DEFAULT 0,
        benefits JSON,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id),
        INDEX idx_effective_date (effective_date),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created salaries table');

    // 22. Manuals/Documents - File management with RBAC
    await executeQuery(`
      CREATE TABLE manuals (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        file_path VARCHAR(500),
        file_name VARCHAR(255),
        file_size BIGINT,
        file_type VARCHAR(100),
        category VARCHAR(100),
        project_id INT NULL,
        task_id INT NULL,
        visibility ENUM('public', 'team', 'private', 'admin_only') DEFAULT 'team',
        access_level ENUM('view', 'download', 'edit') DEFAULT 'view',
        version VARCHAR(20) DEFAULT '1.0',
        is_active BOOLEAN DEFAULT true,
        download_count INT DEFAULT 0,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        uploaded_by INT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
        FOREIGN KEY (task_id) REFERENCES project_tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_project_id (project_id),
        INDEX idx_visibility (visibility),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created manuals table');

    console.log('Phase 2 of database setup completed - Project Management tables created');
    
    return res.status(200).json({ 
      message: 'Phase 2 completed successfully',
      phase: 2,
      tables_created: [
        'project_scopes', 'inquiries', 'projects', 'project_team', 
        'project_tasks', 'project_time_logs', 'project_activities', 
        'project_milestones', 'salaries', 'manuals'
      ]
    });

  } catch (error) {
    console.error('Phase 2 Database setup error:', error);
    return res.status(500).json({ 
      message: 'Phase 2 Database setup failed', 
      error: error.message 
    });
  }
}
