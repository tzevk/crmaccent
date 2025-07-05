import { executeQuery } from '../../../lib/db';

// Demo mode flag
const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Demo users storage (in production, this would be database)
let demoUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@crmaccent.com',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    password: 'password123',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'manager',
    email: 'manager@crmaccent.com',
    first_name: 'Manager',
    last_name: 'User',
    role: 'manager',
    password: 'password123',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    username: 'testuser',
    email: 'test@crmaccent.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
    password: 'password123',
    is_active: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all users
    try {
      if (DEMO_MODE) {
        console.log('Demo mode: Fetching users from memory');
        const usersWithoutPasswords = demoUsers.map(({ password, ...user }) => user);
        return res.status(200).json({
          message: 'Users retrieved successfully',
          users: usersWithoutPasswords,
          demo: true,
          total: usersWithoutPasswords.length
        });
      } else {
        console.log('Production mode: Fetching users from database');
        const query = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC';
        const users = await executeQuery(query);
        
        return res.status(200).json({
          message: 'Users retrieved successfully',
          users: users,
          demo: false,
          total: users.length
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ 
        message: 'Failed to retrieve users',
        error: DEMO_MODE ? 'Demo error' : 'Database error'
      });
    }
  }

  if (req.method === 'POST') {
    // Add new user
    const { username, email, first_name, last_name, role, password } = req.body;

    // Validation
    if (!username || !email || !first_name || !last_name || !role || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: username, email, first_name, last_name, role, password' 
      });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid role. Must be one of: admin, manager, user' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Invalid email format' 
      });
    }

    try {
      if (DEMO_MODE) {
        console.log('Demo mode: Adding user to memory');
        
        // Check if username or email already exists
        const existingUser = demoUsers.find(u => u.username === username || u.email === email);
        if (existingUser) {
          return res.status(409).json({ 
            message: 'Username or email already exists' 
          });
        }

        // Create new user
        const newUser = {
          id: demoUsers.length + 1,
          username,
          email,
          first_name,
          last_name,
          role,
          password, // In production, this should be hashed
          is_active: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        demoUsers.push(newUser);

        // Return user without password
        const { password: _, ...userResponse } = newUser;
        
        return res.status(201).json({
          message: 'User created successfully',
          user: userResponse,
          demo: true
        });
      } else {
        console.log('Production mode: Adding user to database');
        
        // Check if username or email already exists
        const checkQuery = 'SELECT id FROM users WHERE username = ? OR email = ?';
        const existingUsers = await executeQuery(checkQuery, [username, email]);
        
        if (existingUsers.length > 0) {
          return res.status(409).json({ 
            message: 'Username or email already exists' 
          });
        }

        // Insert new user (password should be hashed in production)
        const insertQuery = `
          INSERT INTO users (username, email, first_name, last_name, role, password, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `;
        
        const result = await executeQuery(insertQuery, [username, email, first_name, last_name, role, password]);
        
        // Get the created user
        const getUserQuery = 'SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE id = ?';
        const [newUser] = await executeQuery(getUserQuery, [result.insertId]);
        
        return res.status(201).json({
          message: 'User created successfully',
          user: newUser,
          demo: false
        });
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ 
        message: 'Failed to create user',
        error: DEMO_MODE ? 'Demo error' : 'Database error'
      });
    }
  }

  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
