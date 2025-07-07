import { executeQuery } from '../../../lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '../../../utils/authUtils';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Roles API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/rbac/roles - Get all roles with permissions
async function handleGet(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  try {
    // Get all roles
    const rolesQuery = `
      SELECT 
        id, name, display_name, description, is_system_role,
        created_at, updated_at
      FROM roles
      ORDER BY is_system_role DESC, name ASC
    `;
    const roles = await executeQuery(rolesQuery);

    // Get permissions for each role
    for (let role of roles) {
      const permissionsQuery = `
        SELECT p.id, p.name, p.category, p.description
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.category ASC, p.name ASC
      `;
      const permissions = await executeQuery(permissionsQuery, [role.id]);
      role.permissions = permissions;

      // Get user count for this role
      const userCountQuery = 'SELECT COUNT(*) as count FROM users WHERE role_id = ?';
      const userCount = await executeQuery(userCountQuery, [role.id]);
      role.user_count = userCount[0].count;
    }

    return res.status(200).json({
      success: true,
      roles,
      count: roles.length
    });
  } catch (error) {
    console.error('Get roles error:', error);
    return res.status(500).json({ message: 'Failed to retrieve roles' });
  }
}

// POST /api/rbac/roles - Create a new role
async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    name,
    display_name,
    description,
    permissions = []
  } = req.body;

  // Validation
  if (!name || !display_name) {
    return res.status(400).json({ message: 'Role name and display name are required' });
  }

  // Check if role already exists
  const existingRole = await executeQuery(
    'SELECT id FROM roles WHERE name = ?',
    [name]
  );

  if (existingRole.length > 0) {
    return res.status(400).json({ message: 'Role already exists' });
  }

  try {
    // Create the role
    const roleQuery = `
      INSERT INTO roles (
        name, display_name, description, is_system_role
      ) VALUES (?, ?, ?, false)
    `;

    const roleResult = await executeQuery(roleQuery, [
      name,
      display_name,
      description || null
    ]);

    const roleId = roleResult.insertId;

    // Add permissions to the role
    if (permissions.length > 0) {
      // Validate all permission IDs exist
      const permissionCheck = await executeQuery(
        `SELECT id FROM permissions WHERE id IN (${permissions.map(() => '?').join(',')})`,
        permissions
      );

      if (permissionCheck.length !== permissions.length) {
        // Rollback role creation
        await executeQuery('DELETE FROM roles WHERE id = ?', [roleId]);
        return res.status(400).json({ message: 'Invalid permission IDs provided' });
      }

      // Insert role permissions
      const rolePermissionQuery = `
        INSERT INTO role_permissions (role_id, permission_id) VALUES ?
      `;
      const rolePermissionValues = permissions.map(permissionId => [roleId, permissionId]);
      
      await executeQuery(rolePermissionQuery, [rolePermissionValues]);
    }

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      roleId: roleId
    });

  } catch (error) {
    console.error('Create role error:', error);
    return res.status(500).json({ 
      message: 'Failed to create role',
      error: error.message
    });
  }
}

// PUT /api/rbac/roles - Update a role
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, permissions, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Role ID is required' });
  }

  // Check if role exists
  const existingRole = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
  if (existingRole.length === 0) {
    return res.status(404).json({ message: 'Role not found' });
  }

  // Prevent editing system roles
  if (existingRole[0].is_system_role) {
    return res.status(400).json({ message: 'Cannot edit system roles' });
  }

  try {
    // Update role basic information
    if (Object.keys(updateData).length > 0) {
      // Check for duplicate role name if updating name
      if (updateData.name) {
        const duplicateCheck = await executeQuery(
          'SELECT id FROM roles WHERE name = ? AND id != ?',
          [updateData.name, id]
        );

        if (duplicateCheck.length > 0) {
          return res.status(400).json({ message: 'Role name already exists' });
        }
      }

      const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE roles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      
      const params = [...fields.map(field => updateData[field]), id];
      await executeQuery(query, params);
    }

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Validate all permission IDs exist
      if (permissions.length > 0) {
        const permissionCheck = await executeQuery(
          `SELECT id FROM permissions WHERE id IN (${permissions.map(() => '?').join(',')})`,
          permissions
        );

        if (permissionCheck.length !== permissions.length) {
          return res.status(400).json({ message: 'Invalid permission IDs provided' });
        }
      }

      // Remove existing permissions
      await executeQuery('DELETE FROM role_permissions WHERE role_id = ?', [id]);

      // Add new permissions
      if (permissions.length > 0) {
        const rolePermissionQuery = `
          INSERT INTO role_permissions (role_id, permission_id) VALUES ?
        `;
        const rolePermissionValues = permissions.map(permissionId => [id, permissionId]);
        
        await executeQuery(rolePermissionQuery, [rolePermissionValues]);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Role updated successfully'
    });

  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ 
      message: 'Failed to update role',
      error: error.message
    });
  }
}

// DELETE /api/rbac/roles - Delete a role
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Role ID is required' });
  }

  try {
    // Check if role exists
    const existingRole = await executeQuery('SELECT * FROM roles WHERE id = ?', [id]);
    if (existingRole.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deletion of system roles
    if (existingRole[0].is_system_role) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }

    // Check if role is being used by users
    const usageCheck = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ?',
      [id]
    );

    if (usageCheck[0].count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role as it is assigned to ${usageCheck[0].count} user(s)` 
      });
    }

    // Delete role permissions first
    await executeQuery('DELETE FROM role_permissions WHERE role_id = ?', [id]);

    // Delete the role
    const result = await executeQuery('DELETE FROM roles WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete role',
      error: error.message
    });
  }
}
