import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check all log tables
    const userLogs = await executeQuery('SELECT COUNT(*) as count FROM user_logs');
    const auditLogs = await executeQuery('SELECT COUNT(*) as count FROM audit_logs'); 
    const loginLogs = await executeQuery('SELECT COUNT(*) as count FROM login_logs');
    const systemLogs = await executeQuery('SELECT COUNT(*) as count FROM system_logs');
    
    // Get sample records from each table
    const sampleUserLogs = await executeQuery('SELECT * FROM user_logs ORDER BY created_at DESC LIMIT 3');
    const sampleAuditLogs = await executeQuery('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 3');
    const sampleLoginLogs = await executeQuery('SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 3');

    return res.status(200).json({
      success: true,
      counts: {
        user_logs: userLogs[0].count,
        audit_logs: auditLogs[0].count,
        login_logs: loginLogs[0].count,
        system_logs: systemLogs[0].count
      },
      samples: {
        user_logs: sampleUserLogs,
        audit_logs: sampleAuditLogs,
        login_logs: sampleLoginLogs
      }
    });
  } catch (error) {
    console.error('Debug logs error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
