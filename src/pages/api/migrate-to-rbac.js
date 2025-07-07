import { executeQuery } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting database migration to RBAC schema...');

    // Step 1: Check if new columns already exist
    const usersSchema = await executeQuery('DESCRIBE users');
    const hasRoleId = usersSchema.find(col => col.Field === 'role_id');
    const hasPasswordHash = usersSchema.find(col => col.Field === 'password_hash');

    if (!hasRoleId) {
      console.log('Adding role_id column...');
      await executeQuery('ALTER TABLE users ADD COLUMN role_id INT AFTER last_name');
    }

    if (!hasPasswordHash) {
      console.log('Adding password_hash column...');
      await executeQuery('ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER email');
    }

    // Add new columns if they don't exist
    const newColumns = [
      'ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER password_hash',
      'ADD COLUMN last_login TIMESTAMP NULL AFTER email_verified'
    ];

    for (const column of newColumns) {
      try {
        await executeQuery(`ALTER TABLE users ${column}`);
        console.log(`Added column: ${column}`);
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          console.log(`Column might already exist: ${column}`);
        }
      }
    }

    // Step 2: Create default roles if they don't exist
    const existingRoles = await executeQuery('SELECT COUNT(*) as count FROM roles');
    if (existingRoles[0].count === 0) {
      console.log('Creating default roles...');
      
      const defaultRoles = [
        { name: 'admin', display_name: 'Administrator', description: 'Full system access' },
        { name: 'manager', display_name: 'Manager', description: 'Management level access' },
        { name: 'staff', display_name: 'Staff', description: 'Staff level access' },
        { name: 'user', display_name: 'User', description: 'Basic user access' }
      ];

      for (const role of defaultRoles) {
        await executeQuery(
          'INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)',
          [role.name, role.display_name, role.description]
        );
      }
    }

    // Step 3: Create default permissions if they don't exist
    const existingPermissions = await executeQuery('SELECT COUNT(*) as count FROM permissions');
    if (existingPermissions[0].count === 0) {
      console.log('Creating default permissions...');
      
      const defaultPermissions = [
        // Project permissions
        { name: 'project:view', category: 'project', description: 'View projects' },
        { name: 'project:create', category: 'project', description: 'Create new projects' },
        { name: 'project:edit', category: 'project', description: 'Edit existing projects' },
        { name: 'project:delete', category: 'project', description: 'Delete projects' },
        
        // Task permissions
        { name: 'task:view', category: 'task', description: 'View tasks' },
        { name: 'task:create', category: 'task', description: 'Create new tasks' },
        { name: 'task:edit', category: 'task', description: 'Edit existing tasks' },
        { name: 'task:delete', category: 'task', description: 'Delete tasks' },
        
        // User permissions
        { name: 'user:view', category: 'user', description: 'View users' },
        { name: 'user:create', category: 'user', description: 'Create new users' },
        { name: 'user:edit', category: 'user', description: 'Edit existing users' },
        { name: 'user:delete', category: 'user', description: 'Delete users' },
        
        // Discipline permissions
        { name: 'discipline:view', category: 'discipline', description: 'View disciplines' },
        { name: 'discipline:create', category: 'discipline', description: 'Create new disciplines' },
        { name: 'discipline:edit', category: 'discipline', description: 'Edit existing disciplines' },
        { name: 'discipline:delete', category: 'discipline', description: 'Delete disciplines' },
        
        // Admin permissions
        { name: 'admin:panel', category: 'admin', description: 'Access admin panel' },
        { name: 'admin:rbac', category: 'admin', description: 'Manage roles and permissions' },
        { name: 'admin:system', category: 'admin', description: 'System administration' }
      ];

      for (const permission of defaultPermissions) {
        await executeQuery(
          'INSERT INTO permissions (name, category, description) VALUES (?, ?, ?)',
          [permission.name, permission.category, permission.description]
        );
      }
    }

    // Step 4: Migrate existing users
    console.log('Migrating existing users...');
    const existingUsers = await executeQuery('SELECT * FROM users WHERE role_id IS NULL');
    
    for (const user of existingUsers) {
      // Hash existing password if not already hashed
      let hashedPassword = user.password;
      if (!user.password_hash && user.password) {
        hashedPassword = await bcrypt.hash(user.password, 12);
      }

      // Map old role to new role_id
      let roleId = 4; // default to 'user'
      if (user.role === 'admin') roleId = 1;
      else if (user.role === 'manager') roleId = 2;
      else if (user.role === 'staff') roleId = 3;

      // Update user with new schema
      await executeQuery(
        'UPDATE users SET password_hash = ?, role_id = ?, email_verified = TRUE WHERE id = ?',
        [hashedPassword, roleId, user.id]
      );
    }

    // Step 5: Assign permissions to roles
    console.log('Assigning permissions to roles...');
    
    // Check if role_permissions table exists and create if needed
    try {
      await executeQuery('SELECT COUNT(*) FROM role_permissions LIMIT 1');
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        await executeQuery(`
          CREATE TABLE role_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id),
            FOREIGN KEY (permission_id) REFERENCES permissions(id),
            UNIQUE KEY unique_role_permission (role_id, permission_id)
          )
        `);
      }
    }

    // Assign permissions to admin role (full access)
    const adminRole = await executeQuery('SELECT id FROM roles WHERE name = "admin"');
    const allPermissions = await executeQuery('SELECT id FROM permissions');
    
    if (adminRole.length > 0) {
      for (const permission of allPermissions) {
        try {
          await executeQuery(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [adminRole[0].id, permission.id]
          );
        } catch (error) {
          // Ignore duplicate key errors
          if (!error.message.includes('Duplicate entry')) {
            console.error('Error assigning permission:', error);
          }
        }
      }
    }

    // Create user_sessions table if it doesn't exist
    try {
      await executeQuery('SELECT COUNT(*) FROM user_sessions LIMIT 1');
    } catch (error) {
      if (error.message.includes("doesn't exist")) {
        await executeQuery(`
          CREATE TABLE user_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            session_token TEXT NOT NULL,
            refresh_token TEXT,
            ip_address VARCHAR(45),
            user_agent TEXT,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            INDEX idx_user_id (user_id),
            INDEX idx_expires_at (expires_at)
          )
        `);
      }
    }

    console.log('Database migration completed successfully!');

    return res.status(200).json({
      success: true,
      message: 'Database migration to RBAC schema completed successfully',
      migrations_applied: [
        'Added role_id and password_hash columns to users table',
        'Created default roles and permissions',
        'Migrated existing users to new schema',
        'Assigned permissions to admin role',
        'Created role_permissions and user_sessions tables'
      ]
    });

  } catch (error) {
    console.error('Database migration failed:', error);
    return res.status(500).json({ 
      message: 'Database migration failed', 
      error: error.message 
    });
  }
}
