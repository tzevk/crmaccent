import { executeQuery } from '../../../lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId = 1 } = req.body;

    // Get existing user
    let user = await executeQuery(
      'SELECT id, email, first_name, last_name, role_id FROM users WHERE id = ?',
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user = user[0];

    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Create session record
    await executeQuery(
      `INSERT INTO user_sessions (user_id, session_token, expires_at, is_active) 
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), true)`,
      [user.id, token]
    );

    // Get role info
    const roleInfo = await executeQuery(
      'SELECT name, display_name FROM roles WHERE id = ?',
      [user.role_id]
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: roleInfo[0]?.name || 'unknown',
        roleDisplayName: roleInfo[0]?.display_name || 'Unknown'
      }
    });

  } catch (error) {
    console.error('Test auth error:', error);
    return res.status(500).json({ 
      message: 'Failed to authenticate', 
      error: error.message 
    });
  }
}
