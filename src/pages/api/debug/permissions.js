import { executeQuery } from '../../../lib/db';
import { getUserFromToken } from '../../../utils/authUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try to get current user, but don't fail if authentication fails
    let user = null;
    let authError = null;
    
    try {
      user = await getUserFromToken(req);
      console.log('Current user:', user);
    } catch (error) {
      authError = error.message;
      console.log('Authentication failed:', error.message);
    }

    // Get all roles
    const roles = await executeQuery(`
      SELECT id, name, display_name, description 
      FROM roles 
      ORDER BY id
    `);

    // Get all permissions
    const permissions = await executeQuery(`
      SELECT id, name, category, description 
      FROM permissions 
      ORDER BY category, name
    `);

    // Get role permissions
    const rolePermissions = await executeQuery(`
      SELECT r.name as role_name, p.name as permission_name, p.category
      FROM role_permissions rp
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN permissions p ON rp.permission_id = p.id
      ORDER BY r.name, p.category, p.name
    `);

    // Get user's current permissions (only if user is authenticated)
    let userPermissions = [];
    let userRole = [];
    let hasProjectView = [];
    
    if (user) {
      userPermissions = await executeQuery(`
        SELECT DISTINCT p.name, p.category, p.description,
          'role' as source, r.name as source_name
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN users u ON u.role_id = rp.role_id
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
        UNION
        SELECT DISTINCT p.name, p.category, p.description,
          'user' as source, 'direct_assignment' as source_name
        FROM permissions p
        INNER JOIN user_role_permissions urp ON p.id = urp.permission_id
        WHERE urp.user_id = ? AND urp.is_granted = true
        AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
        ORDER BY category, name
      `, [user.id, user.id]);

      // Get user's role details
      userRole = await executeQuery(`
        SELECT r.id, r.name, r.display_name, r.description
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
      `, [user.id]);

      // Check specific project permissions
      hasProjectView = await executeQuery(`
        SELECT 1 FROM (
          SELECT p.name
          FROM permissions p
          INNER JOIN role_permissions rp ON p.id = rp.permission_id
          INNER JOIN users u ON u.role_id = rp.role_id
          WHERE u.id = ? AND p.name = 'project:view'
          UNION
          SELECT p.name
          FROM permissions p
          INNER JOIN user_role_permissions urp ON p.id = urp.permission_id
          WHERE urp.user_id = ? AND p.name = 'project:view' AND urp.is_granted = true
          AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
        ) AS user_permissions
      `, [user.id, user.id]);
    }

    return res.status(200).json({
      success: true,
      authError,
      debug: {
        currentUser: user,
        userRole: userRole[0] || null,
        hasProjectViewPermission: hasProjectView.length > 0,
        userPermissions,
        allRoles: roles,
        allPermissions: permissions,
        rolePermissions,
        permissionSummary: {
          totalPermissions: permissions.length,
          userPermissionCount: userPermissions.length,
          rolePermissionMappings: rolePermissions.length,
          authenticatedUser: !!user
        }
      }
    });

  } catch (error) {
    console.error('Permission debug error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to debug permissions', 
      error: error.message 
    });
  }
}
