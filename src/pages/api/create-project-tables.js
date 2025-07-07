import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Creating project management tables...');

    // Create disciplines table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS disciplines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discipline_name VARCHAR(100) NOT NULL UNIQUE,
        start_date DATE NULL,
        end_date DATE NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create projects table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_name VARCHAR(200) NOT NULL,
        discipline_id INT NULL,
        client_name VARCHAR(100) NULL,
        project_manager_id INT NULL,
        start_date DATE NULL,
        end_date DATE NULL,
        budget DECIMAL(15,2) NULL,
        status ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled') DEFAULT 'planning',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        description TEXT NULL,
        is_active BOOLEAN DEFAULT true,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (discipline_id) REFERENCES disciplines(id) ON DELETE SET NULL,
        FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create tasks table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        task_name VARCHAR(200) NOT NULL,
        description TEXT NULL,
        assigned_to INT NULL,
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        due_date DATE NULL,
        estimated_hours DECIMAL(8,2) NULL,
        actual_hours DECIMAL(8,2) NULL,
        parent_task_id INT NULL,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create activities table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        entity_type ENUM('project', 'task', 'user', 'discipline') NOT NULL,
        entity_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        user_id INT NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Create statuses table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        status_name VARCHAR(50) NOT NULL,
        entity_type ENUM('project', 'task') NOT NULL,
        color_code VARCHAR(7) NULL,
        description TEXT NULL,
        is_default BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_status_entity (status_name, entity_type)
      )
    `);

    // Insert some sample disciplines
    await executeQuery(`
      INSERT IGNORE INTO disciplines (discipline_name, description) VALUES
      ('Web Development', 'Frontend and backend web development projects'),
      ('Mobile Development', 'iOS and Android mobile application development'),
      ('Data Science', 'Data analysis, machine learning, and AI projects'),
      ('UI/UX Design', 'User interface and user experience design'),
      ('DevOps', 'Infrastructure, deployment, and CI/CD projects')
    `);

    // Insert default statuses
    await executeQuery(`
      INSERT IGNORE INTO statuses (status_name, entity_type, color_code, description, is_default, sort_order) VALUES
      ('Planning', 'project', '#FFB020', 'Project is in planning phase', true, 1),
      ('Active', 'project', '#28A745', 'Project is actively being worked on', false, 2),
      ('On Hold', 'project', '#FFC107', 'Project is temporarily paused', false, 3),
      ('Completed', 'project', '#17A2B8', 'Project has been completed', false, 4),
      ('Cancelled', 'project', '#DC3545', 'Project has been cancelled', false, 5),
      ('Pending', 'task', '#6C757D', 'Task is pending to start', true, 1),
      ('In Progress', 'task', '#007BFF', 'Task is currently being worked on', false, 2),
      ('Completed', 'task', '#28A745', 'Task has been completed', false, 3),
      ('Cancelled', 'task', '#DC3545', 'Task has been cancelled', false, 4)
    `);

    return res.status(200).json({
      success: true,
      message: 'Project management tables created successfully',
      tables_created: ['disciplines', 'projects', 'tasks', 'activities', 'statuses']
    });
  } catch (error) {
    console.error('Create tables error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
