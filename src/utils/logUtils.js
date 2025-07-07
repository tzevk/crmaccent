// Comprehensive logging utilities for user activities and system events
import { executeQuery } from '../lib/db';

// Get client IP address
export const getClientIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.headers['x-real-ip'] || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress ||
         (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
         '127.0.0.1';
};

// Parse user agent for device info
export const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };
  
  const browsers = {
    'Chrome': /Chrome\/[\d.]+/,
    'Firefox': /Firefox\/[\d.]+/,
    'Safari': /Safari\/[\d.]+/,
    'Edge': /Edge\/[\d.]+/,
    'Opera': /Opera\/[\d.]+/
  };
  
  const devices = {
    'Mobile': /Mobile|Android|iPhone|iPad/,
    'Tablet': /Tablet|iPad/,
    'Desktop': /Windows|Mac|Linux/
  };
  
  let browser = 'Unknown';
  let device = 'Unknown';
  
  for (const [name, regex] of Object.entries(browsers)) {
    if (regex.test(userAgent)) {
      browser = name;
      break;
    }
  }
  
  for (const [name, regex] of Object.entries(devices)) {
    if (regex.test(userAgent)) {
      device = name;
      break;
    }
  }
  
  return { browser, device };
};

// Log user activities
export const logUserActivity = async ({
  userId = null,
  action,
  entityType = null,
  entityId = null,
  description,
  category,
  severity = 'info',
  req = null,
  metadata = null,
  responseStatus = null,
  responseData = null,
  executionTime = null
}) => {
  try {
    const ipAddress = req ? getClientIP(req) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    const sessionId = req ? req.headers['x-session-id'] : null;
    
    const query = `
      INSERT INTO user_logs (
        user_id, action, entity_type, entity_id, description,
        ip_address, user_agent, session_id, request_method, request_url,
        request_payload, response_status, response_data, execution_time_ms,
        severity, category, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userId || null,
      action || null,
      entityType || null,
      entityId || null,
      description || null,
      ipAddress || null,
      userAgent || null,
      sessionId || null,
      req?.method || null,
      req?.url || null,
      req?.body ? JSON.stringify(req.body) : null,
      responseStatus || null,
      responseData ? JSON.stringify(responseData) : null,
      executionTime || null,
      severity || null,
      category || null,
      metadata ? JSON.stringify(metadata) : null
    ];
    
    await executeQuery(query, params);
    return { success: true, message: 'User activity logged successfully' };
  } catch (error) {
    console.error('Failed to log user activity:', error);
    // Don't throw error to avoid breaking the main operation
    return { success: false, error: error.message };
  }
};

// Log audit trail for sensitive operations
export const logAuditTrail = async ({
  userId = null,
  action,
  tableName,
  recordId,
  fieldName = null,
  oldValue = null,
  newValue = null,
  operationType,
  riskLevel = 'low',
  req = null,
  complianceFlags = null
}) => {
  try {
    const ipAddress = req ? getClientIP(req) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    const sessionId = req ? req.headers['x-session-id'] : null;
    
    const query = `
      INSERT INTO audit_logs (
        user_id, action, table_name, record_id, field_name,
        old_value, new_value, operation_type, ip_address, user_agent,
        session_id, risk_level, compliance_flags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userId || null,
      action || null,
      tableName || null,
      recordId || null,
      fieldName || null,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      operationType || null,
      ipAddress || null,
      userAgent || null,
      sessionId || null,
      riskLevel || null,
      complianceFlags ? JSON.stringify(complianceFlags) : null
    ];
    
    await executeQuery(query, params);
    return { success: true, message: 'Audit trail logged successfully' };
  } catch (error) {
    console.error('Failed to log audit trail:', error);
    // Don't throw error to avoid breaking the main operation
    return { success: false, error: error.message };
  }
};

// Log login/logout activities
export const logLoginActivity = async ({
  userId = null,
  email,
  loginStatus,
  failureReason = null,
  req = null,
  sessionId = null,
  isSuspicious = false,
  loginDuration = null,
  logoutType = null
}) => {
  try {
    const ipAddress = req ? getClientIP(req) : null;
    const userAgent = req ? req.headers['user-agent'] : null;
    const { browser, device } = parseUserAgent(userAgent);
    
    const query = `
      INSERT INTO login_logs (
        user_id, email, login_status, failure_reason, ip_address,
        user_agent, device_type, browser, is_suspicious, session_id,
        login_duration_seconds, logout_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      userId,
      email,
      loginStatus,
      failureReason,
      ipAddress,
      userAgent,
      device,
      browser,
      isSuspicious,
      sessionId,
      loginDuration,
      logoutType
    ];
    
    const result = await executeQuery(query, params);
    return result.insertId;
  } catch (error) {
    console.error('Failed to log login activity:', error);
    return null;
  }
};

// Log system events
export const logSystemEvent = async ({
  event = null,
  description = null,
  severity = 'info',
  metadata = null,
  req = null,
  // Legacy support
  logLevel = null,
  component = null,
  message = null,
  errorCode = null,
  stackTrace = null,
  context = null,
  serverInfo = null,
  performanceMetrics = null
}) => {
  try {
    // Map new parameter names to legacy ones for backward compatibility
    const finalLogLevel = severity || logLevel || 'info';
    const finalComponent = metadata?.component || component || 'system';
    const finalMessage = description || message || event || 'System event';
    
    const query = `
      INSERT INTO system_logs (
        log_level, component, message, error_code, stack_trace,
        context, server_info, performance_metrics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const contextData = metadata || context;
    
    const params = [
      finalLogLevel || null,
      finalComponent || null,
      finalMessage || null,
      errorCode || null,
      stackTrace || null,
      contextData ? JSON.stringify(contextData) : null,
      serverInfo ? JSON.stringify(serverInfo) : null,
      performanceMetrics ? JSON.stringify(performanceMetrics) : null
    ];
    
    await executeQuery(query, params);
    return { success: true, message: 'System event logged successfully' };
  } catch (error) {
    console.error('Failed to log system event:', error);
    // Don't throw error to avoid breaking the main operation
    return { success: false, error: error.message };
  }
};

// Middleware to automatically log API requests
export const logAPIRequest = (category = 'system') => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Capture response
    res.send = function(data) {
      const executionTime = Date.now() - startTime;
      
      // Log the API request
      logUserActivity({
        userId: req.user?.id || null,
        action: `${req.method} ${req.route?.path || req.url}`,
        description: `API request to ${req.method} ${req.url}`,
        category,
        req,
        responseStatus: res.statusCode,
        responseData: data,
        executionTime
      });
      
      originalSend.call(this, data);
    };
    
    if (next) next();
  };
};

// Predefined logging actions
export const LOG_ACTIONS = {
  // Authentication
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGE: 'password_change',
  PASSWORD_RESET: 'password_reset',
  
  // User Management
  USER_CREATE: 'user_create',
  USER_UPDATE: 'user_update',
  USER_DELETE: 'user_delete',
  USER_ACTIVATE: 'user_activate',
  USER_DEACTIVATE: 'user_deactivate',
  
  // Project Management
  PROJECT_CREATE: 'project_create',
  PROJECT_UPDATE: 'project_update',
  PROJECT_DELETE: 'project_delete',
  PROJECT_VIEW: 'project_view',
  
  // General Actions
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  
  // Task Management
  TASK_CREATE: 'task_create',
  TASK_UPDATE: 'task_update',
  TASK_DELETE: 'task_delete',
  TASK_ASSIGN: 'task_assign',
  TASK_COMPLETE: 'task_complete',
  
  // System Events
  SYSTEM_START: 'system_start',
  SYSTEM_ERROR: 'system_error',
  DB_CONNECTION: 'db_connection',
  DB_ERROR: 'db_error',
  
  // Security Events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  PERMISSION_DENIED: 'permission_denied',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  SECURITY_BREACH: 'security_breach'
};

// Log categories
export const LOG_CATEGORIES = {
  AUTH: 'auth',
  USER: 'user',
  USER_MANAGEMENT: 'user_management',
  PROJECT: 'project',
  TASK: 'task',
  DISCIPLINE: 'discipline',
  SYSTEM: 'system',
  SECURITY: 'security'
};

// Log severity levels
export const LOG_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};
