import { executeQuery } from '@/lib/db';
import { checkEndpointPermission, PERMISSIONS } from '@/utils/authUtils';
import { logUserActivity, logAuditTrail, LOG_ACTIONS, LOG_CATEGORIES, LOG_SEVERITY } from '@/utils/logUtils';
import bcrypt from 'bcryptjs';

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
    console.error('Users API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

async function handleGet(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.USER_VIEW);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const query = `
    SELECT 
      u.id, u.username, u.email, u.first_name, u.last_name,
      u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at,
      r.name as role_name, r.display_name as role_display_name
    FROM users u
    LEFT JOIN roles r ON u.role_id = r.id
    ORDER BY u.created_at DESC
  `;

  const users = await executeQuery(query, []);

  // Log user list view
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.VIEW,
    entityType: 'users',
    entityId: null,
    description: `Viewed users list (${users.length} users)`,
    category: LOG_CATEGORIES.USER_MANAGEMENT,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { count: users.length, filtered: false }
  });

  return res.status(200).json({
    success: true,
    users: users.map(user => ({
      ...user,
      password: undefined,
      password_hash: undefined
    })),
    count: users.length
  });
}

async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.USER_CREATE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { username, email, password, first_name, last_name, role_id = 4 } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ 
      message: 'Username, email, and password are required' 
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const query = `
    INSERT INTO users (username, email, password_hash, first_name, last_name, role_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const result = await executeQuery(query, [
    username, email.toLowerCase(), hashedPassword, first_name, last_name, role_id
  ]);

  // Log user creation
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.USER_CREATE,
    entityType: 'user',
    entityId: result.insertId,
    description: `Created user: ${username} (${email})`,
    category: LOG_CATEGORIES.USER_MANAGEMENT,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { username, email: email.toLowerCase(), first_name, last_name, role_id }
  });

  await logAuditTrail({
    userId: user.id,
    action: 'USER_CREATE',
    tableName: 'users',
    recordId: result.insertId,
    operationType: 'CREATE',
    newValue: { username, email: email.toLowerCase(), first_name, last_name, role_id },
    req,
    riskLevel: 'medium'
  });

  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    userId: result.insertId
  });
}

async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.USER_EDIT);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(200).json({ message: 'Update functionality coming soon' });
}

async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.USER_DELETE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  return res.status(200).json({ message: 'Delete functionality coming soon' });
}