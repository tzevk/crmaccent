import { executeQuery } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Creating user log system tables...');

    // Create user_logs table for general activity logging
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS user_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NULL,
        entity_id INT NULL,
        description TEXT NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        session_id VARCHAR(255) NULL,
        request_method VARCHAR(10) NULL,
        request_url VARCHAR(500) NULL,
        request_payload JSON NULL,
        response_status INT NULL,
        response_data JSON NULL,
        execution_time_ms INT NULL,
        severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
        category ENUM('auth', 'user', 'project', 'task', 'discipline', 'system', 'security') NOT NULL,
        metadata JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_logs_user_id (user_id),
        INDEX idx_user_logs_category (category),
        INDEX idx_user_logs_action (action),
        INDEX idx_user_logs_created_at (created_at),
        INDEX idx_user_logs_entity (entity_type, entity_id)
      )
    `);

    // Create audit_logs table for sensitive operations
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(100) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id INT NOT NULL,
        field_name VARCHAR(100) NULL,
        old_value TEXT NULL,
        new_value TEXT NULL,
        operation_type ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT') NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        session_id VARCHAR(255) NULL,
        risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
        compliance_flags JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_audit_logs_user_id (user_id),
        INDEX idx_audit_logs_table_record (table_name, record_id),
        INDEX idx_audit_logs_operation (operation_type),
        INDEX idx_audit_logs_created_at (created_at),
        INDEX idx_audit_logs_risk_level (risk_level)
      )
    `);

    // Create login_logs table for authentication tracking
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        email VARCHAR(100) NOT NULL,
        login_status ENUM('success', 'failed', 'blocked', 'suspicious') NOT NULL,
        failure_reason VARCHAR(255) NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        location_country VARCHAR(100) NULL,
        location_city VARCHAR(100) NULL,
        device_type VARCHAR(50) NULL,
        browser VARCHAR(100) NULL,
        is_suspicious BOOLEAN DEFAULT false,
        session_id VARCHAR(255) NULL,
        login_duration_seconds INT NULL,
        logout_type ENUM('manual', 'timeout', 'forced', 'session_expired') NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        logged_out_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_login_logs_user_id (user_id),
        INDEX idx_login_logs_status (login_status),
        INDEX idx_login_logs_created_at (created_at),
        INDEX idx_login_logs_ip (ip_address),
        INDEX idx_login_logs_suspicious (is_suspicious)
      )
    `);

    // Create system_logs table for system-level events
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_level ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
        component VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        error_code VARCHAR(50) NULL,
        stack_trace TEXT NULL,
        context JSON NULL,
        server_info JSON NULL,
        performance_metrics JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_system_logs_level (log_level),
        INDEX idx_system_logs_component (component),
        INDEX idx_system_logs_created_at (created_at)
      )
    `);

    // Create log_retention_policies table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS log_retention_policies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        log_type ENUM('user_logs', 'audit_logs', 'login_logs', 'system_logs') NOT NULL,
        retention_days INT NOT NULL DEFAULT 365,
        auto_archive BOOLEAN DEFAULT true,
        archive_location VARCHAR(255) NULL,
        compression_enabled BOOLEAN DEFAULT true,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_log_type (log_type)
      )
    `);

    // Insert default retention policies
    await executeQuery(`
      INSERT IGNORE INTO log_retention_policies (log_type, retention_days, auto_archive) VALUES
      ('user_logs', 365, true),
      ('audit_logs', 2555, true),
      ('login_logs', 730, true),
      ('system_logs', 90, true)
    `);

    return res.status(200).json({
      success: true,
      message: 'User log system tables created successfully',
      tables_created: [
        'user_logs',
        'audit_logs', 
        'login_logs',
        'system_logs',
        'log_retention_policies'
      ]
    });
  } catch (error) {
    console.error('Create log tables error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
