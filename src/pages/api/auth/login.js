import { executeQuery } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logLoginActivity, logUserActivity, logAuditTrail, LOG_ACTIONS, LOG_CATEGORIES, LOG_SEVERITY } from '../../../../utils/logUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_TOKEN_EXPIRES_IN = '30d';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await handleLogin(req, res);
      case 'DELETE':
        return await handleLogout(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Auth API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// POST /api/auth/login - User login
async function handleLogin(req, res) {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  try {
    // Get user with role information
    const userQuery = `
      SELECT 
        u.id, u.email, u.password_hash, u.first_name, u.last_name, 
        u.is_active, u.email_verified, u.role_id,
        r.name as role_name, r.display_name as role_display_name
      FROM users u
      INNER JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.is_active = true
    `;

    const users = await executeQuery(userQuery, [email.toLowerCase()]);

    if (users.length === 0) {
      // Log failed login attempt
      await logLoginActivity({
        email: email.toLowerCase(),
        loginStatus: 'failed',
        failureReason: 'User not found',
        req,
        isSuspicious: false
      });
      
      await logUserActivity({
        action: LOG_ACTIONS.LOGIN_FAILED,
        description: `Failed login attempt for email: ${email}`,
        category: LOG_CATEGORIES.AUTH,
        severity: LOG_SEVERITY.WARNING,
        req,
        metadata: { email, reason: 'user_not_found' }
      });
      
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      // Log failed login attempt
      await logLoginActivity({
        userId: user.id,
        email: email.toLowerCase(),
        loginStatus: 'failed',
        failureReason: 'Invalid password',
        req,
        isSuspicious: false
      });
      
      await logUserActivity({
        userId: user.id,
        action: LOG_ACTIONS.LOGIN_FAILED,
        description: `Failed login attempt - invalid password for user: ${user.email}`,
        category: LOG_CATEGORIES.AUTH,
        severity: LOG_SEVERITY.WARNING,
        req,
        metadata: { email, reason: 'invalid_password' }
      });
      
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified (optional)
    if (!user.email_verified) {
      // Log failed login attempt
      await logLoginActivity({
        userId: user.id,
        email: email.toLowerCase(),
        loginStatus: 'failed',
        failureReason: 'Email not verified',
        req,
        isSuspicious: false
      });
      
      await logUserActivity({
        userId: user.id,
        action: LOG_ACTIONS.LOGIN_FAILED,
        description: `Failed login attempt - email not verified for user: ${user.email}`,
        category: LOG_CATEGORIES.AUTH,
        severity: LOG_SEVERITY.WARNING,
        req,
        metadata: { email, reason: 'email_not_verified' }
      });
      
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in' 
      });
    }

    // Get user permissions
    const permissionsQuery = `
      SELECT DISTINCT p.name, p.category
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
      UNION
      SELECT DISTINCT p.name, p.category
      FROM permissions p
      INNER JOIN user_role_permissions urp ON p.id = urp.permission_id
      WHERE urp.user_id = ? AND urp.is_granted = true
      AND (urp.expires_at IS NULL OR urp.expires_at > NOW())
    `;

    const permissions = await executeQuery(permissionsQuery, [user.role_id, user.id]);

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role_name,
      permissions: permissions.map(p => p.name)
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN 
    });

    const refreshToken = jwt.sign(
      { userId: user.id }, 
      JWT_SECRET, 
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Store session in database
    const sessionExpiry = new Date();
    sessionExpiry.setDate(sessionExpiry.getDate() + 7); // 7 days

    await executeQuery(`
      INSERT INTO user_sessions (
        user_id, session_token, refresh_token, ip_address, 
        user_agent, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      user.id,
      accessToken,
      refreshToken,
      req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      req.headers['user-agent'],
      sessionExpiry
    ]);

    // Update last login
    await executeQuery(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Return user data without sensitive information
    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_name,
      roleDisplayName: user.role_display_name,
      permissions: permissions.map(p => p.name),
      permissionsByCategory: permissions.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p.name);
        return acc;
      }, {})
    };

    // Log successful login
    const sessionId = `session_${user.id}_${Date.now()}`;
    
    await logLoginActivity({
      userId: user.id,
      email: user.email,
      loginStatus: 'success',
      req,
      sessionId,
      isSuspicious: false
    });
    
    await logUserActivity({
      userId: user.id,
      action: LOG_ACTIONS.LOGIN_SUCCESS,
      description: `Successful login for user: ${user.email}`,
      category: LOG_CATEGORIES.AUTH,
      severity: LOG_SEVERITY.INFO,
      req,
      metadata: { 
        email: user.email, 
        role: user.role_name,
        sessionId 
      }
    });
    
    await logAuditTrail({
      userId: user.id,
      action: 'USER_LOGIN',
      tableName: 'users',
      recordId: user.id,
      operationType: 'LOGIN',
      req,
      riskLevel: 'low'
    });

    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRES_IN
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Login failed', 
      error: error.message 
    });
  }
}

// DELETE /api/auth/login - User logout
async function handleLogout(req, res) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Deactivate session in database
    await executeQuery(`
      UPDATE user_sessions 
      SET is_active = false 
      WHERE user_id = ? AND session_token = ?
    `, [decoded.userId, token]);

    // Log logout activity
    logUserActivity(decoded.userId, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.headers['user-agent'], LOG_ACTIONS.LOGOUT, LOG_CATEGORIES.SESSION, LOG_SEVERITY.INFO);

    return res.status(200).json({ 
      message: 'Logout successful' 
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(200).json({ 
      message: 'Logout completed' 
    });
  }
}
