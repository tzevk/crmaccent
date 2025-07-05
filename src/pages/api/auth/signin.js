import { executeQuery } from '../../../lib/db';
import { findUserByUsername } from '../../../lib/dummy-data';

// Demo mode flag - set to true to use dummy data, false to use real database
const DEMO_MODE = process.env.DEMO_MODE === 'true'; // Read from environment

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    let user = null;

    if (DEMO_MODE) {
      // Use dummy data for demo
      console.log('Demo mode: Using dummy credentials');
      user = findUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }
    } else {
      // Use real database
      console.log('Production mode: Using database');
      const query = 'SELECT * FROM users WHERE username = ?';
      const users = await executeQuery(query, [username]);

      if (users.length === 0) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      user = users[0];
    }

    // Compare passwords (simplified for demo)
    let isPasswordValid = false;
    
    if (DEMO_MODE) {
      // Simple plain text comparison for demo
      isPasswordValid = password === 'password123';
    } else {
      // For production, you would use bcrypt here
      // const bcrypt = require('bcryptjs');
      // isPasswordValid = await bcrypt.compare(password, user.password);
      isPasswordValid = password === user.password; // Plain text for now
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Remove password from user object before sending response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Sign in successful',
      user: userWithoutPassword,
      demo: DEMO_MODE
    });

  } catch (error) {
    console.error('Sign in error:', error);
    
    if (DEMO_MODE) {
      return res.status(500).json({ message: 'Demo authentication error' });
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
