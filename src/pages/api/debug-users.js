import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all users with their roles
    const users = await executeQuery(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.role_id,
        r.name as role_name,
        u.is_active,
        u.email_verified
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `);

    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        ...user,
        // Don't expose password hashes
        password: undefined,
        password_hash: undefined
      }))
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
