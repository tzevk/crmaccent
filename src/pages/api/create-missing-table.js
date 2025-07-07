import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Creating missing user_role_permissions table...');

    // Create user_role_permissions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_role_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        permission_id INT NOT NULL,
        is_granted BOOLEAN DEFAULT true,
        granted_by INT NULL,
        granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL,
        reason TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
        FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_permission (user_id, permission_id)
      )
    `);

    return res.status(200).json({
      success: true,
      message: 'user_role_permissions table created successfully'
    });
  } catch (error) {
    console.error('Create table error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
