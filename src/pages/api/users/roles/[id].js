import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate ID
  if (!id) {
    return res.status(400).json({ message: 'Invalid role ID' });
  }

  if (req.method === 'GET') {
    // Get role by ID
    try {
      // Check if the roles table exists
      const tableCheck = await executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles'"
      );
      
      if (tableCheck.length === 0) {
        // Return default role if table doesn't exist
        if (id === 'admin' || id === 'manager' || id === 'user') {
          const roleMap = {
            admin: { id: 'admin', name: 'Administrator', description: 'Full system access' },
            manager: { id: 'manager', name: 'Manager', description: 'Management access' },
            user: { id: 'user', name: 'User', description: 'Basic access' }
          };
          
          return res.status(200).json({
            role: roleMap[id],
            permissions: [],
            message: 'Default role retrieved successfully'
          });
        } else {
          return res.status(404).json({ message: 'Role not found' });
        }
      }
      
      // Get role from database
      const roles = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
      
      if (roles.length === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Get permissions for this role
      let permissions = [];
      try {
        const permCheck = await executeQuery(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'role_permissions'"
        );
        
        if (permCheck.length > 0) {
          permissions = await executeQuery(
            'SELECT permission_key, permission_value FROM role_permissions WHERE role_id = ?',
            [id]
          );
        }
      } catch (error) {
        console.warn('Error getting permissions:', error);
      }
      
      return res.status(200).json({
        role: roles[0],
        permissions: permissions,
        message: 'Role retrieved successfully'
      });
    } catch (error) {
      console.error('Get role error:', error);
      return res.status(500).json({ message: 'Failed to retrieve role' });
    }
  }

  if (req.method === 'PUT') {
    // Update role
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
        return res.status(404).json({ message: 'Roles table does not exist' });
      }
      
      // Check if role exists
      const existingRoles = await executeQuery('SELECT id FROM roles WHERE id = ?', [id]);
      if (existingRoles.length === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Update role
      await executeQuery(
        'UPDATE roles SET name = ?, description = ?, updated_at = NOW() WHERE id = ?',
        [name, description || '', id]
      );
      
      // Update permissions if provided
      if (permissions && Array.isArray(permissions)) {
        // Check if role_permissions table exists
        const permCheck = await executeQuery(
          "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'role_permissions'"
        );
        
        if (permCheck.length > 0) {
          // Delete existing permissions
          await executeQuery('DELETE FROM role_permissions WHERE role_id = ?', [id]);
          
          // Insert new permissions
          if (permissions.length > 0) {
            const permissionValues = permissions.map(p => [id, p.key, p.value ? 1 : 0]);
            
            await executeQuery(
              'INSERT INTO role_permissions (role_id, permission_key, permission_value) VALUES ?',
              [permissionValues]
            );
          }
        }
      }
      
      return res.status(200).json({
        message: 'Role updated successfully',
        role: { id, name, description }
      });
    } catch (error) {
      console.error('Update role error:', error);
      return res.status(500).json({ 
        message: 'Failed to update role',
        error: 'Database error'
      });
    }
  }

  if (req.method === 'DELETE') {
    // Delete role
    try {
      // Check if roles table exists
      const tableCheck = await executeQuery(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'roles'"
      );
      
      if (tableCheck.length === 0) {
        return res.status(404).json({ message: 'Roles table does not exist' });
      }
      
      // Prevent deletion of built-in roles
      if (id === 'admin' || id === 'manager' || id === 'user') {
        return res.status(403).json({ message: 'Cannot delete built-in roles' });
      }
      
      // Check if role exists
      const existingRoles = await executeQuery('SELECT id FROM roles WHERE id = ?', [id]);
      if (existingRoles.length === 0) {
        return res.status(404).json({ message: 'Role not found' });
      }
      
      // Delete role (this will cascade delete permissions due to foreign key)
      await executeQuery('DELETE FROM roles WHERE id = ?', [id]);
      
      return res.status(200).json({
        message: 'Role deleted successfully'
      });
    } catch (error) {
      console.error('Delete role error:', error);
      return res.status(500).json({ 
        message: 'Failed to delete role',
        error: 'Database error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
