import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Setting up comprehensive RBAC-enabled database...');

    // Disable foreign key checks for cleanup
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');

    // Drop existing tables in reverse dependency order
    const dropTables = [
      'user_sessions',
      'user_role_permissions',
      'project_team',
      'project_tasks',
      'project_activities',
      'project_time_logs',
      'project_milestones',
      'salaries', 
      'manuals',
      'activities',
      'project_scopes',
      'inquiries',
      'employees',
      'projects',
      'leads',
      'clients',
      'users',
      'roles',
      'permissions',
      'role_permissions',
      'disciplines',
      'activity_master',
      'statuses'
    ];

    for (const table of dropTables) {
      try {
        await executeQuery(`DROP TABLE IF EXISTS ${table}`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.log(`Table ${table} didn't exist or couldn't be dropped:`, error.message);
      }
    }

    // Re-enable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');

    // ========== RBAC CORE TABLES ==========

    // 1. Permissions - Define all available permissions
    await executeQuery(`
      CREATE TABLE permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_name (name)
      )
    `);
    console.log('Created permissions table');

    // 2. Roles - Define user roles
    await executeQuery(`
      CREATE TABLE roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name)
      )
    `);
    console.log('Created roles table');

    // 3. Role Permissions - Link roles to permissions
    await executeQuery(`
      CREATE TABLE role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission_id),
        INDEX idx_role_id (role_id),
        INDEX idx_permission_id (permission_id)
      )
    `);
    console.log('Created role_permissions table');

    // 4. Users - Enhanced with RBAC
    await executeQuery(`
      CREATE TABLE users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role_id INT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP NULL,
        email_verified BOOLEAN DEFAULT false,
        reset_token VARCHAR(255) NULL,
        reset_token_expires TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        updated_by INT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id),
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_role_id (role_id),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created users table');

    // 5. User Role Permissions - Additional permissions per user (optional overrides)
    await executeQuery(`
      CREATE TABLE user_role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        permission_id INT NOT NULL,
        is_granted BOOLEAN NOT NULL DEFAULT true,
        granted_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_permission (user_id, permission_id),
        INDEX idx_user_id (user_id),
        INDEX idx_permission_id (permission_id)
      )
    `);
    console.log('Created user_role_permissions table');

    // 6. User Sessions - Track active sessions
    await executeQuery(`
      CREATE TABLE user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        refresh_token VARCHAR(255) NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_session_token (session_token),
        INDEX idx_expires_at (expires_at)
      )
    `);
    console.log('Created user_sessions table');

    // ========== MASTER DATA TABLES ==========

    // 7. Statuses - Project and task statuses
    await executeQuery(`
      CREATE TABLE statuses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        type ENUM('project', 'task', 'lead', 'inquiry') NOT NULL,
        color VARCHAR(7) DEFAULT '#6B7280',
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_name_type (name, type),
        INDEX idx_type (type)
      )
    `);
    console.log('Created statuses table');

    // 8. Disciplines
    await executeQuery(`
      CREATE TABLE disciplines (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#6B7280',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_name (name),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created disciplines table');

    // 9. Activity Master
    await executeQuery(`
      CREATE TABLE activity_master (
        id INT PRIMARY KEY AUTO_INCREMENT,
        activity_name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        category VARCHAR(100),
        default_hours DECIMAL(5,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_active (is_active)
      )
    `);
    console.log('Created activity_master table');

    // 10. Employees
    await executeQuery(`
      CREATE TABLE employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NULL,
        employee_id VARCHAR(20) UNIQUE,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        discipline_id INT NULL,
        department VARCHAR(100),
        position VARCHAR(100),
        hire_date DATE,
        status ENUM('active', 'inactive', 'terminated') DEFAULT 'active',
        hourly_rate DECIMAL(10,2),
        manager_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL,
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_department (department)
      )
    `);
    console.log('Created employees table');

    // ========== CLIENT & LEAD MANAGEMENT ==========

    // 11. Clients
    await executeQuery(`
      CREATE TABLE clients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        industry VARCHAR(100),
        website VARCHAR(255),
        notes TEXT,
        status ENUM('active', 'inactive', 'prospect') DEFAULT 'prospect',
        assigned_to INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_company (company),
        INDEX idx_status (status),
        INDEX idx_assigned_to (assigned_to)
      )
    `);
    console.log('Created clients table');

    // 12. Leads
    await executeQuery(`
      CREATE TABLE leads (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        company VARCHAR(255),
        title VARCHAR(100),
        source VARCHAR(100),
        status VARCHAR(50) DEFAULT 'new',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        estimated_value DECIMAL(15,2),
        description TEXT,
        assigned_to INT NULL,
        converted_to_client BOOLEAN DEFAULT false,
        client_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT NULL,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_converted (converted_to_client)
      )
    `);
    console.log('Created leads table');

    // Continue in next part...
    console.log('Phase 1 of database setup completed - RBAC and basic tables created');
    
    return res.status(200).json({ 
      message: 'Phase 1 completed successfully',
      phase: 1,
      tables_created: [
        'permissions', 'roles', 'role_permissions', 'users', 'user_role_permissions', 
        'user_sessions', 'statuses', 'disciplines', 'activity_master', 'employees', 
        'clients', 'leads'
      ]
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      message: 'Database setup failed', 
      error: error.message 
    });
  }
}
