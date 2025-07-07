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
    console.error('Permissions API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/rbac/permissions - Get all permissions
async function handleGet(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { category } = req.query;

  let query = `
    SELECT 
      id, name, category, description, is_system_permission,
      created_at, updated_at
    FROM permissions
  `;

  const params = [];
  
  if (category) {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY category ASC, name ASC';

  try {
    const permissions = await executeQuery(query, params);

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      permissions,
      groupedPermissions,
      count: permissions.length
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    return res.status(500).json({ message: 'Failed to retrieve permissions' });
  }
}

// POST /api/rbac/permissions - Create a new permission
async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    name,
    category,
    description
  } = req.body;

  // Validation
  if (!name || !category) {
    return res.status(400).json({ message: 'Permission name and category are required' });
  }

  // Validate category
  const validCategories = ['project', 'task', 'user', 'discipline', 'admin', 'system'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ 
      message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
    });
  }

  // Check if permission already exists
  const existingPermission = await executeQuery(
    'SELECT id FROM permissions WHERE name = ?',
    [name]
  );

  if (existingPermission.length > 0) {
    return res.status(400).json({ message: 'Permission already exists' });
  }

  try {
    const query = `
      INSERT INTO permissions (
        name, category, description, is_system_permission
      ) VALUES (?, ?, ?, false)
    `;

    const result = await executeQuery(query, [
      name,
      category,
      description || null
    ]);

    return res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      permissionId: result.insertId
    });

  } catch (error) {
    console.error('Create permission error:', error);
    return res.status(500).json({ 
      message: 'Failed to create permission',
      error: error.message
    });
  }
}

// PUT /api/rbac/permissions - Update a permission
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Permission ID is required' });
  }

  // Check if permission exists
  const existingPermission = await executeQuery('SELECT * FROM permissions WHERE id = ?', [id]);
  if (existingPermission.length === 0) {
    return res.status(404).json({ message: 'Permission not found' });
  }

  // Prevent editing system permissions
  if (existingPermission[0].is_system_permission) {
    return res.status(400).json({ message: 'Cannot edit system permissions' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Validate category if updating
  if (updateData.category) {
    const validCategories = ['project', 'task', 'user', 'discipline', 'admin', 'system'];
    if (!validCategories.includes(updateData.category)) {
      return res.status(400).json({ 
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}` 
      });
    }
  }

  // Check for duplicate permission name if updating name
  if (updateData.name) {
    const duplicateCheck = await executeQuery(
      'SELECT id FROM permissions WHERE name = ? AND id != ?',
      [updateData.name, id]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({ message: 'Permission name already exists' });
    }
  }

  try {
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE permissions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    const params = [...fields.map(field => updateData[field]), id];

    const result = await executeQuery(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Permission updated successfully'
    });

  } catch (error) {
    console.error('Update permission error:', error);
    return res.status(500).json({ 
      message: 'Failed to update permission',
      error: error.message
    });
  }
}

// DELETE /api/rbac/permissions - Delete a permission
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.ADMIN_RBAC);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Permission ID is required' });
  }

  try {
    // Check if permission exists
    const existingPermission = await executeQuery('SELECT * FROM permissions WHERE id = ?', [id]);
    if (existingPermission.length === 0) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    // Prevent deletion of system permissions
    if (existingPermission[0].is_system_permission) {
      return res.status(400).json({ message: 'Cannot delete system permissions' });
    }

    // Check if permission is being used
    const usageCheck = await executeQuery(`
      SELECT 
        (SELECT COUNT(*) FROM role_permissions WHERE permission_id = ?) as role_usage,
        (SELECT COUNT(*) FROM user_role_permissions WHERE permission_id = ?) as user_usage
    `, [id, id]);

    const usage = usageCheck[0];
    if (usage.role_usage > 0 || usage.user_usage > 0) {
      return res.status(400).json({ 
        message: `Cannot delete permission as it is assigned to ${usage.role_usage} role(s) and ${usage.user_usage} user(s)` 
      });
    }

    // Delete the permission
    const result = await executeQuery('DELETE FROM permissions WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Permission not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });

  } catch (error) {
    console.error('Delete permission error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete permission',
      error: error.message
    });
  }
}
