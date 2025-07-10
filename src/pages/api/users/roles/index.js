import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all roles
    try {
      // Check if the roles table exists
      const tableCheck = await executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles'"
      );
      
      if (tableCheck.length === 0) {
        // Return default roles if table doesn't exist
        return res.status(200).json({
          roles: [
            { id: 'admin', name: 'Administrator', description: 'Full system access' },
            { id: 'manager', name: 'Manager', description: 'Management access' },
            { id: 'user', name: 'User', description: 'Basic access' }
          ],
          message: 'Default roles retrieved successfully'
        });
      }
      
      // Get roles from the database
      const roles = await executeQuery('SELECT * FROM roles ORDER BY name');
      
      return res.status(200).json({
        roles: roles,
        message: 'Roles retrieved successfully'
      });
    } catch (error) {
      console.error('Get roles error:', error);
      
      // Return default roles if there's an error
      return res.status(200).json({
        roles: [
          { id: 'admin', name: 'Administrator', description: 'Full system access' },
          { id: 'manager', name: 'Manager', description: 'Management access' },
          { id: 'user', name: 'User', description: 'Basic access' }
        ],
        message: 'Default roles retrieved due to error'
      });
    }
  }

  if (req.method === 'POST') {
    // Add new role
    try {
      const { name, description, permissions } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({ message: 'Role name is required' });
      }

      // Check if roles table exists
      const tableCheck = await executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles'"
      );
      
      if (tableCheck.length === 0) {
        // Create roles table if it doesn't exist
        await executeQuery(`
          CREATE TABLE roles (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        
        // Create role_permissions table if needed
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS role_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id VARCHAR(50) NOT NULL,
            permission_key VARCHAR(100) NOT NULL,
            permission_value BOOLEAN NOT NULL DEFAULT TRUE,
            UNIQUE KEY unique_role_permission (role_id, permission_key),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
          )
        `);
      }

      // Generate a slug-like ID from the name
      const roleId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Check if role already exists
      const existingRoles = await executeQuery('SELECT id FROM roles WHERE id = ?', [roleId]);
      if (existingRoles.length > 0) {
        return res.status(409).json({ message: 'Role already exists' });
      }
      
      // Insert new role
      await executeQuery(
        'INSERT INTO roles (id, name, description) VALUES (?, ?, ?)',
        [roleId, name, description || '']
      );
      
      // Insert permissions if provided
      if (permissions && Array.isArray(permissions)) {
        const permissionValues = permissions.map(p => [roleId, p.key, p.value ? 1 : 0]);
        
        if (permissionValues.length > 0) {
          await executeQuery(
            'INSERT INTO role_permissions (role_id, permission_key, permission_value) VALUES ?',
            [permissionValues]
          );
        }
      }
      
      return res.status(201).json({
        message: 'Role created successfully',
        role: { id: roleId, name, description }
      });
    } catch (error) {
      console.error('Create role error:', error);
      return res.status(500).json({ 
        message: 'Failed to create role',
        error: 'Database error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
