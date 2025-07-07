// Production-friendly permissions API that works without full database setup
import { getUserFromToken } from '../../../../utils/authUtils';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try to get current user
    let user = null;
    let authError = null;
    
    try {
      user = await getUserFromToken(req);
      console.log('Current user:', user);
    } catch (error) {
      authError = error.message;
      console.log('Authentication failed:', error.message);
    }

    // If no user authenticated, return basic info
    if (!user) {
      return res.status(200).json({
        success: true,
        debug: {
          authError: authError,
          currentUser: null,
          message: 'No authentication provided',
          environment: {
            hasDbHost: !!process.env.DB_HOST,
            hasDbName: !!process.env.DB_NAME,
            hasJwtSecret: !!process.env.JWT_SECRET,
            nodeEnv: process.env.NODE_ENV
          },
          basicSystemCheck: 'API is responding',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Simple permission check for production
    const adminPermissions = [
      'dashboard:view', 'dashboard:stats',
      'projects:view', 'projects:create', 'projects:edit', 'projects:delete',
      'tasks:view', 'tasks:create', 'tasks:edit', 'tasks:delete',
      'leads:view', 'leads:create', 'leads:edit', 'leads:delete',
      'clients:view', 'clients:create', 'clients:edit', 'clients:delete'
    ];

    const userPermissions = user.role === 'admin' ? adminPermissions : [];

    return res.status(200).json({
      success: true,
      debug: {
        currentUser: user,
        hasProjectViewPermission: user.role === 'admin',
        userPermissions: userPermissions.map(p => ({ name: p, category: p.split(':')[0] })),
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDbHost: !!process.env.DB_HOST,
          hasJwtSecret: !!process.env.JWT_SECRET
        },
        permissionSummary: {
          totalPermissions: adminPermissions.length,
          userPermissionCount: userPermissions.length,
          userRole: user.role
        },
        message: 'Production permissions check completed'
      }
    });

  } catch (error) {
    console.error('Permission debug error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to debug permissions', 
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
