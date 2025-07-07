// Authentication and authorization middleware for API routes
import { rbacUtils, PERMISSIONS } from '../utils/rbac.js';

// Mock user session - In production, this would come from JWT token or session store
// For demo purposes, we'll simulate different user roles
export const getUserSession = (req) => {
  // In a real application, you'd extract this from JWT token or session
  const authHeader = req.headers.authorization;
  const userRole = req.headers['x-user-role'] || 'user'; // Default to 'user' role
  const userId = req.headers['x-user-id'] || '1';
  
  // Mock user data based on role
  const mockUsers = {
    admin: { id: 1, role: 'admin', firstName: 'Admin', lastName: 'User' },
    manager: { id: 2, role: 'manager', firstName: 'Manager', lastName: 'User' },
    staff: { id: 3, role: 'staff', firstName: 'Staff', lastName: 'User' },
    user: { id: 4, role: 'user', firstName: 'Regular', lastName: 'User' }
  };

  return mockUsers[userRole] || mockUsers.user;
};

// Middleware to check if user has required permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      const user = getUserSession(req);
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!rbacUtils.hasPermission(user.role, permission)) {
        return res.status(403).json({ 
          message: 'Forbidden', 
          details: `Required permission: ${permission}` 
        });
      }

      // Attach user to request for use in handlers
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to check if user has any of the required permissions
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    try {
      const user = getUserSession(req);
      
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!rbacUtils.hasAnyPermission(user.role, permissions)) {
        return res.status(403).json({ 
          message: 'Forbidden', 
          details: `Required permissions: ${permissions.join(', ')}` 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Middleware to filter data based on user role and permissions
export const filterDataMiddleware = (dataType) => {
  return (req, res, next) => {
    try {
      const user = getUserSession(req);
      req.user = user;
      req.dataType = dataType;
      next();
    } catch (error) {
      console.error('Filter middleware error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Helper function to apply data filtering
export const applyDataFilter = (data, dataType, user) => {
  return rbacUtils.filterDataByRole(user.role, data, dataType, user.id);
};

// Helper function to check ownership or assignment
export const checkResourceAccess = (user, resource, resourceOwnerId, resourceAssigneeId = null) => {
  // Admin has access to everything
  if (user.role === 'admin') return true;
  
  // Manager has access to their managed resources
  if (user.role === 'manager') return true;
  
  // Staff has access to their own resources or assigned resources
  if (user.role === 'staff') {
    return resourceOwnerId === user.id || resourceAssigneeId === user.id;
  }
  
  // Regular users have limited access
  if (user.role === 'user') {
    return resourceOwnerId === user.id || resourceAssigneeId === user.id;
  }
  
  return false;
};

const authMiddleware = {
  getUserSession,
  requirePermission,
  requireAnyPermission,
  filterDataMiddleware,
  applyDataFilter,
  checkResourceAccess
};

export default authMiddleware;
