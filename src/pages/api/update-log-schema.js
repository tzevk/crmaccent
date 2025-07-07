import { executeQuery } from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Updating log table schemas...');

    // Update user_logs category ENUM to include more values
    await executeQuery(`
      ALTER TABLE user_logs 
      MODIFY COLUMN category ENUM(
        'auth', 'user', 'user_management', 'project', 'project_management',
        'task', 'task_management', 'discipline', 'discipline_management',
        'system', 'security', 'api', 'workflow', 'notification', 'report',
        'integration', 'maintenance', 'backup', 'performance'
      ) NOT NULL
    `);
    console.log('✅ Updated user_logs category ENUM');

    // Add more actions to support enhanced logging
    await executeQuery(`
      ALTER TABLE user_logs 
      MODIFY COLUMN action VARCHAR(100) NOT NULL
    `);
    console.log('✅ Updated user_logs action column length');

    // Update audit_logs operation_type ENUM to include more values
    await executeQuery(`
      ALTER TABLE audit_logs 
      MODIFY COLUMN operation_type ENUM(
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'SEARCH',
        'EXPORT', 'IMPORT', 'APPROVE', 'REJECT', 'ASSIGN', 'UNASSIGN',
        'ACTIVATE', 'DEACTIVATE', 'ARCHIVE', 'RESTORE', 'MERGE', 'SPLIT'
      ) NOT NULL
    `);
    console.log('✅ Updated audit_logs operation_type ENUM');

    // Update login_logs status ENUM for more granular tracking
    await executeQuery(`
      ALTER TABLE login_logs 
      MODIFY COLUMN login_status ENUM(
        'success', 'failed', 'blocked', 'suspicious', 'timeout', 
        'invalid_credentials', 'account_locked', 'password_expired',
        'mfa_required', 'mfa_failed', 'ip_blocked'
      ) NOT NULL
    `);
    console.log('✅ Updated login_logs status ENUM');

    // Add index for faster queries on new fields
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_user_logs_severity ON user_logs(severity)
    `);
    console.log('✅ Added severity index to user_logs');

    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action)
    `);
    console.log('✅ Added action index to audit_logs');

    return res.status(200).json({
      success: true,
      message: 'Log table schemas updated successfully',
      updates: [
        'Expanded user_logs category ENUM',
        'Increased user_logs action column length',
        'Expanded audit_logs operation_type ENUM',
        'Expanded login_logs status ENUM',
        'Added performance indexes'
      ]
    });

  } catch (error) {
    console.error('Schema update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update log table schemas',
      error: error.message
    });
  }
}
