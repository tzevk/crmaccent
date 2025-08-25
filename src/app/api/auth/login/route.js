import { getDb } from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return Response.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Query to find user by username
    const [rows] = await db.execute(
      'SELECT id, username, password_hash, email, full_name, role, status FROM users WHERE username = ? AND status = "active"',
      [username]
    );

    if (rows.length === 0) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify password (plain text comparison)
    const isValidPassword = password === user.password_hash;

    if (!isValidPassword) {
      return Response.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;

    // Update last login timestamp
    await db.execute(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    return Response.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
