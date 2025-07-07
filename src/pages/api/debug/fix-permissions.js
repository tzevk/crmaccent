import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action } = req.body;

    switch (action) {
      case 'ensure_project_permissions':
        return await ensureProjectPermissions(req, res);
      case 'grant_admin_permissions':
        return await grantAdminPermissions(req, res);
      case 'create_default_roles':
        return await createDefaultRoles(req, res);
      case 'fix_user_role':
        return await fixUserRole(req, res);
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (error) {
    console.error('Permission fix error:', error);
    return res.status(500).json({ 
      message: 'Failed to fix permissions', 
      error: error.message 
    });
  }
}

async function ensureProjectPermissions(req, res) {
  // Ensure all project-related permissions exist
  const projectPermissions = [
    { name: 'project:view', category: 'project', description: 'View projects' },
    { name: 'project:create', category: 'project', description: 'Create new projects' },
    { name: 'project:edit', category: 'project', description: 'Edit existing projects' },
    { name: 'project:delete', category: 'project', description: 'Delete projects' },
    { name: 'project:manage_team', category: 'project', description: 'Manage project team members' }
  ];

  const results = [];
  
  for (const perm of projectPermissions) {
    // Check if permission exists
    const existing = await executeQuery(
      'SELECT id FROM permissions WHERE name = ?',
      [perm.name]
    );

    if (existing.length === 0) {
      // Create permission
      const result = await executeQuery(
        `INSERT INTO permissions (name, category, description) 
         VALUES (?, ?, ?)`,
        [perm.name, perm.category, perm.description]
      );
      results.push({ action: 'created', permission: perm.name, id: result.insertId });
    } else {
      results.push({ action: 'exists', permission: perm.name, id: existing[0].id });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Project permissions ensured',
    results
  });
}

async function grantAdminPermissions(req, res) {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  // Find or create admin role
  let adminRole = await executeQuery(
    'SELECT id FROM roles WHERE name = ?',
    ['admin']
  );

  if (adminRole.length === 0) {
    // Create admin role
    const result = await executeQuery(
      `INSERT INTO roles (name, display_name, description) 
       VALUES ('admin', 'Administrator', 'Full system access')`,
      []
    );
    adminRole = [{ id: result.insertId }];
  }

  // Assign admin role to user
  await executeQuery(
    'UPDATE users SET role_id = ? WHERE id = ?',
    [adminRole[0].id, userId]
  );

  // Grant all permissions to admin role
  const allPermissions = await executeQuery('SELECT id FROM permissions');
  
  for (const perm of allPermissions) {
    // Check if role permission exists
    const existing = await executeQuery(
      'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      [adminRole[0].id, perm.id]
    );

    if (existing.length === 0) {
      await executeQuery(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [adminRole[0].id, perm.id]
      );
    }
  }

  return res.status(200).json({
    success: true,
    message: `User ${userId} granted admin permissions`,
    adminRoleId: adminRole[0].id
  });
}

async function createDefaultRoles(req, res) {
  const defaultRoles = [
    {
      name: 'admin',
      display_name: 'Administrator',
      description: 'Full system access',
      permissions: ['*'] // All permissions
    },
    {
      name: 'manager',
      display_name: 'Manager',
      description: 'Management access',
      permissions: [
        'project:view', 'project:create', 'project:edit',
        'task:view', 'task:create', 'task:edit', 'task:assign',
        'user:view', 'discipline:view'
      ]
    },
    {
      name: 'employee',
      display_name: 'Employee',
      description: 'Standard employee access',
      permissions: [
        'project:view', 'task:view', 'task:create', 'task:edit'
      ]
    }
  ];

  const results = [];

  for (const roleData of defaultRoles) {
    // Create or update role
    const existing = await executeQuery(
      'SELECT id FROM roles WHERE name = ?',
      [roleData.name]
    );

    let roleId;
    if (existing.length === 0) {
      const result = await executeQuery(
        `INSERT INTO roles (name, display_name, description) 
         VALUES (?, ?, ?)`,
        [roleData.name, roleData.display_name, roleData.description]
      );
      roleId = result.insertId;
      results.push({ action: 'created', role: roleData.name, id: roleId });
    } else {
      roleId = existing[0].id;
      results.push({ action: 'exists', role: roleData.name, id: roleId });
    }

    // Assign permissions
    if (roleData.permissions.includes('*')) {
      // Grant all permissions
      const allPermissions = await executeQuery('SELECT id FROM permissions');
      for (const perm of allPermissions) {
        await executeQuery(
          `INSERT IGNORE INTO role_permissions (role_id, permission_id) 
           VALUES (?, ?)`,
          [roleId, perm.id]
        );
      }
    } else {
      // Grant specific permissions
      for (const permName of roleData.permissions) {
        const permission = await executeQuery(
          'SELECT id FROM permissions WHERE name = ?',
          [permName]
        );
        
        if (permission.length > 0) {
          await executeQuery(
            `INSERT IGNORE INTO role_permissions (role_id, permission_id) 
             VALUES (?, ?)`,
            [roleId, permission[0].id]
          );
        }
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Default roles created/updated',
    results
  });
}

async function fixUserRole(req, res) {
  const { userId, roleName = 'admin' } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  // Find role
  const role = await executeQuery(
    'SELECT id FROM roles WHERE name = ?',
    [roleName]
  );

  if (role.length === 0) {
    return res.status(404).json({ message: `Role '${roleName}' not found` });
  }

  // Update user role
  await executeQuery(
    'UPDATE users SET role_id = ? WHERE id = ?',
    [role[0].id, userId]
  );

  return res.status(200).json({
    success: true,
    message: `User ${userId} assigned to role '${roleName}'`,
    roleId: role[0].id
  });
}
