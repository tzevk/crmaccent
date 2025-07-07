# CRM Accent - Log Management System

## Overview

A comprehensive user activity logging and audit trail system built for the CRM Accent application. This system provides detailed tracking, analytics, and reporting capabilities for user activities, security events, and system operations.

## Features Implemented

### 1. Database Schema
- **user_logs**: User activity tracking
- **audit_logs**: Audit trail for sensitive operations
- **login_logs**: Authentication tracking
- **system_logs**: System events and errors
- **log_retention_policies**: Configurable retention settings

### 2. Backend Components

#### Logging Utilities (`src/utils/logUtils.js`)
- `logUserActivity()`: Track user actions and interactions
- `logAuditTrail()`: Record sensitive data changes
- `logLoginActivity()`: Monitor authentication events
- `logSystemEvent()`: Capture system-level events
- Helper functions for IP detection, user agent parsing

#### API Endpoints
- **GET/POST `/api/logs`**: Log retrieval with filtering and pagination
- **GET `/api/logs/analytics`**: Statistical analysis and trends
- **POST `/api/logs/export`**: Comprehensive report generation
- **POST `/api/create-log-tables`**: Database schema setup

#### Features
- Advanced filtering (date range, category, severity, user)
- Pagination support
- Real-time analytics
- Export to CSV, JSON, and comprehensive ZIP reports
- RBAC-based access control

### 3. Frontend Components

#### Main Components (`src/components/logs/`)
- **LogManager**: Main dashboard container
- **LogFilters**: Advanced filtering interface
- **LogTable**: Responsive data table with sorting
- **LogDetailModal**: Detailed log inspection
- **LogAnalytics**: Visual analytics dashboard
- **ExportLogs**: Export functionality

#### Navigation Integration
- Added to main navigation with proper RBAC permissions
- Role-based access (Admin: full access, Manager: read-only)
- Direct linking with tab support

## Permissions & Security

### Role-Based Access
```javascript
// Admin permissions
LOGS_VIEW, LOGS_MANAGE, LOGS_DELETE, LOGS_EXPORT

// Manager permissions  
LOGS_VIEW, LOGS_EXPORT

// User permissions
(No direct log access)
```

### Security Features
- IP address tracking
- Device fingerprinting
- Suspicious activity detection
- Session tracking
- Audit trail integrity

## Database Tables

### user_logs
```sql
- id (Primary Key)
- user_id (Foreign Key)
- action (VARCHAR)
- entity_type (VARCHAR)
- entity_id (INT)
- description (TEXT)
- category (ENUM)
- severity (ENUM)
- ip_address (VARCHAR)
- user_agent (TEXT)
- session_id (VARCHAR)
- request_method (VARCHAR)
- request_url (TEXT)
- request_payload (JSON)
- response_status (INT)
- response_data (JSON)
- execution_time_ms (INT)
- metadata (JSON)
- created_at (TIMESTAMP)
```

### audit_logs
```sql
- id (Primary Key)
- user_id (Foreign Key)
- action (VARCHAR)
- table_name (VARCHAR)
- record_id (INT)
- field_name (VARCHAR)
- old_value (JSON)
- new_value (JSON)
- operation_type (ENUM)
- ip_address (VARCHAR)
- user_agent (TEXT)
- session_id (VARCHAR)
- risk_level (ENUM)
- compliance_flags (JSON)
- created_at (TIMESTAMP)
```

### login_logs
```sql
- id (Primary Key)
- user_id (Foreign Key)
- email (VARCHAR)
- login_status (ENUM)
- failure_reason (TEXT)
- ip_address (VARCHAR)
- user_agent (TEXT)
- location_country (VARCHAR)
- location_city (VARCHAR)
- device_type (VARCHAR)
- browser (VARCHAR)
- is_suspicious (BOOLEAN)
- session_id (VARCHAR)
- login_duration_seconds (INT)
- logout_type (ENUM)
- created_at (TIMESTAMP)
- logged_out_at (TIMESTAMP)
```

### system_logs
```sql
- id (Primary Key)
- log_level (ENUM)
- component (VARCHAR)
- message (TEXT)
- error_code (VARCHAR)
- stack_trace (TEXT)
- context (JSON)
- server_info (JSON)
- performance_metrics (JSON)
- created_at (TIMESTAMP)
```

## Integration Points

### Existing Endpoints with Logging
1. **Authentication** (`/api/auth/login`)
   - Login success/failure tracking
   - User activity logging
   - Audit trail for authentication events

2. **Disciplines** (`/api/disciplines`)
   - User activity for CRUD operations
   - Audit trail for data changes

3. **Users** (`/api/users`) 
   - User management activities
   - Audit trail for user modifications

4. **Projects** (`/api/projects`)
   - Project lifecycle tracking
   - User activity logging

## Usage Examples

### Basic Logging
```javascript
// Log user activity
await logUserActivity({
  userId: user.id,
  action: LOG_ACTIONS.CREATE,
  entityType: 'project',
  entityId: projectId,
  description: 'Created new project',
  category: LOG_CATEGORIES.PROJECT,
  severity: LOG_SEVERITY.INFO,
  req
});

// Log audit trail
await logAuditTrail({
  userId: user.id,
  action: 'PROJECT_CREATE',
  tableName: 'projects',
  recordId: projectId,
  operationType: 'CREATE',
  newValue: projectData,
  req,
  riskLevel: 'low'
});
```

### Frontend Usage
```jsx
// Access logs page
<Link href="/dashboard/logs">Log Management</Link>

// With specific tab
<Link href="/dashboard/logs?tab=audit">Audit Logs</Link>
```

## Analytics Capabilities

### Available Metrics
- Total activities by type
- User activity trends
- Most active users
- Security event monitoring
- Error rate tracking
- Category breakdown
- Login success rates
- Geographic activity patterns

### Export Options
- **CSV**: Individual log tables
- **JSON**: Complete log data with metadata
- **Comprehensive ZIP**: All logs, analytics, and documentation

## Configuration

### Log Retention
```javascript
// Default retention policies
{
  user_logs: 90,      // days
  audit_logs: 2555,   // 7 years
  login_logs: 365,    // 1 year
  system_logs: 30     // days
}
```

### Categories
- `auth`: Authentication events
- `user`: User management
- `user_management`: Admin user operations
- `project`: Project activities
- `task`: Task management
- `discipline`: Discipline operations
- `system`: System events
- `security`: Security-related events

### Severity Levels
- `info`: Normal operations
- `warning`: Potential issues
- `error`: Error conditions
- `critical`: Critical system events

## Deployment Considerations

### Production Setup
1. Ensure database tables are created
2. Configure log retention policies
3. Set up proper RBAC permissions
4. Configure environment variables
5. Enable log rotation for large volumes

### Performance
- Indexed columns: `user_id`, `created_at`, `category`
- Async logging to prevent blocking operations
- Batch processing for high-volume scenarios
- Automated cleanup based on retention policies

### Security
- All log access requires authentication
- RBAC controls log visibility
- Sensitive data is properly sanitized
- Audit trail maintains data integrity

## Monitoring & Alerting

### Health Checks
- Log table sizes
- Query performance
- Failed log writes
- Retention policy execution

### Alerts
- Unusual activity patterns
- Failed login attempts
- System errors
- Security events

## Future Enhancements

### Planned Features
1. Real-time log streaming
2. Advanced visualization dashboards
3. Machine learning anomaly detection
4. Integration with external SIEM systems
5. Automated report scheduling
6. Enhanced geographic tracking
7. Performance metrics correlation

### Scalability
- Horizontal log table partitioning
- Archive to cold storage
- Distributed logging for microservices
- Real-time analytics with streaming platforms

## Troubleshooting

### Common Issues
1. **Missing logs**: Check permissions and database connectivity
2. **Performance issues**: Review query patterns and indexing
3. **Storage growth**: Adjust retention policies
4. **Export failures**: Verify file permissions and disk space

### Debug Endpoints
- `/api/debug-logs`: Direct table inspection (development only)
- Health check endpoints for monitoring

## Support

For questions or issues:
1. Check the log tables for error messages
2. Review the application logs
3. Verify RBAC permissions
4. Contact the development team

---

**Generated**: July 7, 2025  
**Version**: 1.0  
**System**: CRM Accent Log Management
