import { executeQuery } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGetProfile(req, res);
      case 'PUT':
        return await handleUpdateProfile(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// Middleware to verify JWT token
async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session is still active
    const sessionCheck = await executeQuery(`
      SELECT id FROM user_sessions 
      WHERE user_id = ? AND session_token = ? AND is_active = true 
      AND expires_at > NOW()
    `, [decoded.userId, token]);

    if (sessionCheck.length === 0) {
      throw new Error('Session expired or invalid');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// GET /api/auth/profile - Get user profile
async function handleGetProfile(req, res) {
  try {
    const decoded = await verifyToken(req);

    // Get user profile with role and permissions
    const userQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone,
        u.is_active, u.email_verified, u.last_login, u.created_at,
        r.name as role_name, r.display_name as role_display_name,
        e.employee_id, e.department, e.position
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE u.id = ? AND u.is_active = true
    `;

    const users = await executeQuery(userQuery, [decoded.userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Get user permissions
    const permissionsQuery = `
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
      ORDER BY category, name
    `;

    const permissions = await executeQuery(permissionsQuery, [decoded.userId, decoded.userId]);

    // Get active sessions
    const sessionsQuery = `
      SELECT id, ip_address, user_agent, created_at, last_activity
      FROM user_sessions 
      WHERE user_id = ? AND is_active = true 
      AND expires_at > NOW()
      ORDER BY last_activity DESC
    `;

    const sessions = await executeQuery(sessionsQuery, [decoded.userId]);

    // Organize permissions by category
    const permissionsByCategory = permissions.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push({
        name: p.name,
        description: p.description
      });
      return acc;
    }, {});

    const profile = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role_name,
      roleDisplayName: user.role_display_name,
      employeeId: user.employee_id,
      department: user.department,
      position: user.position,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      permissions: permissions.map(p => p.name),
      permissionsByCategory,
      activeSessions: sessions.length,
      sessions: sessions.map(s => ({
        id: s.id,
        ipAddress: s.ip_address,
        userAgent: s.user_agent,
        createdAt: s.created_at,
        lastActivity: s.last_activity
      }))
    };

    return res.status(200).json({
      message: 'Profile retrieved successfully',
      profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    if (error.message.includes('token') || error.message.includes('Session')) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to get profile' });
  }
}

// PUT /api/auth/profile - Update user profile
async function handleUpdateProfile(req, res) {
  try {
    const decoded = await verifyToken(req);
    const { firstName, lastName, phone } = req.body;

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: 'First name and last name are required' 
      });
    }

    // Update user profile
    await executeQuery(`
      UPDATE users 
      SET first_name = ?, last_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [firstName, lastName, phone, decoded.userId]);

    return res.status(200).json({
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message.includes('token') || error.message.includes('Session')) {
      return res.status(401).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to update profile' });
  }
}
