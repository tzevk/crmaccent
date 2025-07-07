import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check users table structure
    const usersSchema = await executeQuery('DESCRIBE users');
    console.log('Users table schema:', usersSchema);

    // Check if we have any users
    const userCount = await executeQuery('SELECT COUNT(*) as count FROM users');
    console.log('User count:', userCount);

    // Check permissions table
    const permissionsSchema = await executeQuery('DESCRIBE permissions');
    console.log('Permissions table schema:', permissionsSchema);

    // Check roles table
    const rolesSchema = await executeQuery('DESCRIBE roles');
    console.log('Roles table schema:', rolesSchema);

    return res.status(200).json({
      success: true,
      users_schema: usersSchema,
      user_count: userCount[0].count,
      permissions_schema: permissionsSchema,
      roles_schema: rolesSchema
    });

  } catch (error) {
    console.error('Database check error:', error);
    return res.status(500).json({ 
      message: 'Database check failed', 
      error: error.message 
    });
  }
}
