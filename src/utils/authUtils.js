// Centralized authentication and authorization utilities
import { executeQuery } from '../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Verify JWT token and get user session
export const getUserFromToken = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header missing or invalid');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still active and get user data
    const sessionCheck = await executeQuery(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name,
        r.name as role, r.display_name as role_display_name
      FROM user_sessions us
      INNER JOIN users u ON us.user_id = u.id
      INNER JOIN roles r ON u.role_id = r.id
      WHERE us.session_token = ? AND us.is_active = true 
      AND us.expires_at > NOW()
    `, [token]);

    if (sessionCheck.length === 0) {
      throw new Error('Session expired or invalid');
    }

    const user = sessionCheck[0];
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      roleDisplayName: user.role_display_name
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// Check if user has a specific permission
export const hasPermission = async (userId, permission) => {
  try {
    const permissionCheck = await executeQuery(`
      SELECT 1 FROM (
        SELECT p.name
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        INNER JOIN users u ON u.role_id = rp.role_id
        WHERE u.id = ? AND p.name = ?
        UNION
        SELECT p.name
        FROM permissions p
        INNER JOIN user_role_permissions urp ON p.id = urp.permission_id
        WHERE urp.user_id = ? AND p.name = ? AND urp.is_granted = true
        AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
      ) AS user_permissions
    `, [userId, permission, userId, permission]);

    return permissionCheck.length > 0;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

// Get all permissions for a user
export const getUserPermissions = async (userId) => {
  try {
    const permissions = await executeQuery(`
      SELECT DISTINCT p.name, p.category, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN users u ON u.role_id = rp.role_id
      WHERE u.id = ?
      UNION
      SELECT DISTINCT p.name, p.category, p.description
      FROM permissions p
      INNER JOIN user_role_permissions urp ON p.id = urp.permission_id
      WHERE urp.user_id = ? AND urp.is_granted = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
    `, [userId, userId]);

    return permissions;
  } catch (error) {
    console.error('Get user permissions error:', error);
    return [];
  }
};

// Middleware function for API routes
export const requireAuth = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    if (next) next();
    return user;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: error.message });
  }
};

// Middleware function to check specific permission
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await requireAuth(req, res);
      if (!user || typeof user === 'object' && user.status) {
        return; // Already sent error response
      }

      const hasAccess = await hasPermission(user.id, permission);
      if (!hasAccess) {
        return res.status(403).json({ 
          message: 'Forbidden', 
          details: `Required permission: ${permission}` 
        });
      }

      if (next) next();
      return user;
    } catch (error) {
      console.error('Permission middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Commonly used permissions
export const PERMISSIONS = {
  // Projects
  PROJECT_VIEW: 'project:view',
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_TEAM: 'project:manage_team',
  
  // Tasks
  TASK_VIEW: 'task:view',
  TASK_CREATE: 'task:create',
  TASK_EDIT: 'task:edit',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  
  // Users
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // Disciplines
  DISCIPLINE_VIEW: 'discipline:view',
  DISCIPLINE_CREATE: 'discipline:create',
  DISCIPLINE_EDIT: 'discipline:edit',
  DISCIPLINE_DELETE: 'discipline:delete',
  
  // Administration
  ADMIN_PANEL: 'admin:panel',
  ADMIN_RBAC: 'admin:rbac',
  ADMIN_SYSTEM: 'admin:system',
  
  // Logs
  LOGS_VIEW: 'logs:view',
  LOGS_EXPORT: 'logs:export',
  LOGS_ANALYTICS: 'logs:analytics',
  LOGS_DELETE: 'logs:delete'
};

// Helper function to handle API endpoint authentication
export const authenticateEndpoint = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    return { user, error: null };
  } catch (error) {
    return { 
      user: null, 
      error: { status: 401, message: error.message }
    };
  }
};

// Helper function to check permission for API endpoint
export const checkEndpointPermission = async (req, res, permission) => {
  const { user, error } = await authenticateEndpoint(req, res);
  
  if (error) {
    return { user: null, error };
  }

  const hasAccess = await hasPermission(user.id, permission);
  if (!hasAccess) {
    return {
      user: null,
      error: { 
        status: 403, 
        message: `Forbidden: Required permission '${permission}'` 
      }
    };
  }

  return { user, error: null };
};
