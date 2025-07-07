import { logUserActivity, logAuditTrail, logSystemEvent, LOG_ACTIONS, LOG_CATEGORIES, LOG_SEVERITY } from '../../utils/logUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { testType = 'all', userId = 1 } = req.body;

    const results = [];

    if (testType === 'all' || testType === 'user') {
      // Test user activity log
      try {
        const userLogResult = await logUserActivity({
          userId: userId,
          action: LOG_ACTIONS.VIEW,
          entityType: 'test',
          entityId: 123,
          description: 'Test user activity log entry',
          category: LOG_CATEGORIES.USER_MANAGEMENT,
          severity: LOG_SEVERITY.INFO,
          req,
          metadata: { test: true, timestamp: new Date().toISOString() }
        });
        results.push({ type: 'user_activity', result: userLogResult, success: true });
      } catch (error) {
        results.push({ type: 'user_activity', error: error.message, success: false });
      }
    }

    if (testType === 'all' || testType === 'audit') {
      // Test audit log
      try {
        const auditLogResult = await logAuditTrail({
          userId: userId,
          action: 'TEST_CREATE',
          tableName: 'test_table',
          recordId: 456,
          operationType: 'CREATE',
          newValue: { name: 'Test Record', status: 'active' },
          req,
          riskLevel: 'low'
        });
        results.push({ type: 'audit_trail', result: auditLogResult, success: true });
      } catch (error) {
        results.push({ type: 'audit_trail', error: error.message, success: false });
      }
    }

    if (testType === 'all' || testType === 'system') {
      // Test system log
      try {
        const systemLogResult = await logSystemEvent({
          event: 'TEST_SYSTEM_EVENT',
          description: 'Test system log entry',
          severity: LOG_SEVERITY.INFO,
          metadata: { component: 'test-logging', version: '1.0.0' },
          req
        });
        results.push({ type: 'system_event', result: systemLogResult, success: true });
      } catch (error) {
        results.push({ type: 'system_event', error: error.message, success: false });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Test logs created successfully',
      results
    });

  } catch (error) {
    console.error('Test logging error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create test logs',
      error: error.message
    });
  }
}
