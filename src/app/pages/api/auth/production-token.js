// Generate a simple production authentication token for testing
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a basic admin token for production testing
    const payload = {
      userId: 1,
      email: 'admin@crmaccent.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const token = jwt.sign(payload, JWT_SECRET);

    // In production, we'll bypass the session table check for now
    // and just use the JWT token directly
    
    return res.status(200).json({
      success: true,
      token: token,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role
      },
      message: 'Production token generated successfully',
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('Production token generation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate production token', 
      error: error.message 
    });
  }
}
