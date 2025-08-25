# Lead Management Database Setup

This document provides comprehensive instructions for setting up the database backend for the CRM Lead Management system.

## 📋 Overview

The lead management system includes the following database tables:

### Master Tables
- **companies** - Company master data
- **cities** - Cities/locations master
- **enquiry_types** - Types of enquiries (Direct, Reference, etc.)
- **project_descriptions** - Project categories and descriptions
- **enquiry_statuses** - Lead status options
- **project_statuses** - Project status options
- **users** - System users for assignment and tracking

### Core Tables
- **leads** - Main leads table with all lead information
- **followups** - Follow-up activities for each lead
- **lead_activities** - Audit trail of lead changes

### Features
- **Automatic enquiry number generation** (ENQ-YEAR-TIMESTAMP)
- **Activity logging** via database triggers
- **Foreign key relationships** for data integrity
- **Indexes** for optimal query performance
- **Views** for complex data retrieval

## 🚀 Quick Setup

### Method 1: Automated Setup Script (Recommended)

```bash
# Test database connection first
npm run leads:test

# Run the complete database setup
npm run leads:setup
```

### Method 2: Manual SQL Execution

```bash
# Connect to your MySQL/MariaDB database
mysql -h [HOST] -u [USER] -p [DATABASE]

# Execute the schema file
source database/leads_schema.sql;
```

## 📊 Database Schema Details

### Leads Table Structure

```sql
CREATE TABLE leads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enquiry_no VARCHAR(50) UNIQUE NOT NULL,
    year INT NOT NULL,
    enquiry_date DATE NOT NULL,
    enquiry_type VARCHAR(100) DEFAULT 'Direct',
    source VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    industry VARCHAR(100),
    contact_name VARCHAR(255) NOT NULL,
    designation VARCHAR(100),
    mobile VARCHAR(20),
    email VARCHAR(255),
    project_name VARCHAR(255),
    project_description VARCHAR(255),
    estimated_value DECIMAL(15,2) DEFAULT 0,
    estimated_duration INT,
    currency VARCHAR(3) DEFAULT 'INR',
    enquiry_status VARCHAR(100) DEFAULT 'New',
    project_status VARCHAR(100) DEFAULT 'Pending',
    lead_stage ENUM('New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost'),
    assigned_to INT,
    remarks TEXT,
    created_by INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables

Ensure your `.env` file contains the database configuration:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
```

### Database Requirements

- **MySQL 5.7+** or **MariaDB 10.2+**
- **Storage Engine**: InnoDB (for foreign key support)
- **Character Set**: utf8mb4 (for emoji and international characters)
- **Collation**: utf8mb4_unicode_ci

## 📝 Default Data

The setup script automatically inserts default data:

### Enquiry Types
- Direct, Reference, Exhibition, Website, Social Media, Cold Call, Email Campaign, Advertisement

### Project Descriptions
- Software Development, Web Application, Mobile Application, ERP System, CRM System, E-commerce, etc.

### Status Options
- **Enquiry Status**: New, Awaiting, In Discussion, Proposal Sent, Awarded, Lost, On Hold
- **Project Status**: Pending, Planning, Ongoing, Testing, Completed, Hold, Cancelled

### Cities
- Major Indian cities with state information

## 🔍 Testing and Verification

### Test Database Connection
```bash
npm run leads:test
```

### Verify Table Creation
```sql
-- Check if all tables exist
SHOW TABLES;

-- Verify table structure
DESCRIBE leads;
DESCRIBE followups;
DESCRIBE lead_activities;

-- Check default data
SELECT COUNT(*) FROM enquiry_types;
SELECT COUNT(*) FROM cities;
SELECT COUNT(*) FROM project_descriptions;
```

### Sample Data Queries
```sql
-- View all leads with related data
SELECT * FROM leads_with_details LIMIT 10;

-- Check lead activities
SELECT * FROM lead_activities ORDER BY activity_date DESC LIMIT 5;

-- View follow-ups
SELECT l.company_name, f.followup_date, f.description 
FROM leads l 
JOIN followups f ON l.id = f.lead_id 
ORDER BY f.followup_date DESC;
```

## 📈 Performance Optimization

### Indexes Created
```sql
-- Primary indexes
CREATE INDEX idx_enquiry_no ON leads(enquiry_no);
CREATE INDEX idx_company_name ON leads(company_name);
CREATE INDEX idx_enquiry_date ON leads(enquiry_date);
CREATE INDEX idx_lead_stage ON leads(lead_stage);

-- Compound indexes
CREATE INDEX idx_leads_compound ON leads(lead_stage, enquiry_status, assigned_to);
CREATE INDEX idx_followups_compound ON followups(lead_id, followup_date);
```

### Query Optimization Tips
- Use the `leads_with_details` view for complex queries
- Filter by `lead_stage` and `enquiry_status` for better performance
- Use date ranges on `enquiry_date` for time-based queries

## 🔄 Data Maintenance

### Regular Maintenance Tasks
```sql
-- Optimize tables monthly
OPTIMIZE TABLE leads, followups, lead_activities;

-- Update table statistics
ANALYZE TABLE leads, followups, lead_activities;

-- Clean up old activities (older than 2 years)
DELETE FROM lead_activities 
WHERE activity_date < DATE_SUB(NOW(), INTERVAL 2 YEAR);
```

### Backup Recommendations
```bash
# Daily backup
mysqldump -h [HOST] -u [USER] -p [DATABASE] leads followups lead_activities > backup_$(date +%Y%m%d).sql

# Weekly full backup
mysqldump -h [HOST] -u [USER] -p [DATABASE] > full_backup_$(date +%Y%m%d).sql
```

## 🔒 Security Considerations

### User Permissions
```sql
-- Create dedicated user for the application
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'secure_password';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON crmaccent.* TO 'crm_user'@'%';
GRANT EXECUTE ON crmaccent.* TO 'crm_user'@'%';

FLUSH PRIVILEGES;
```

### Data Privacy
- Ensure GDPR compliance for contact information
- Implement data retention policies
- Use encrypted connections (SSL/TLS)
- Regular security audits

## 🐛 Troubleshooting

### Common Issues

#### Connection Refused
```bash
# Check if MySQL/MariaDB is running
sudo systemctl status mysql
# or
sudo systemctl status mariadb

# Start the service if not running
sudo systemctl start mysql
```

#### Access Denied
```bash
# Verify credentials
mysql -h [HOST] -u [USER] -p

# Check user permissions
SHOW GRANTS FOR 'your_user'@'your_host';
```

#### Table Not Found
```sql
-- Check if database exists
SHOW DATABASES LIKE 'your_database';

-- Switch to correct database
USE your_database_name;

-- List tables
SHOW TABLES;
```

### Error Codes
- **ER_ACCESS_DENIED_ERROR**: Check username/password
- **ER_BAD_DB_ERROR**: Database doesn't exist
- **ECONNREFUSED**: Database server not running
- **ENOTFOUND**: Wrong hostname

## 📞 Support

If you encounter issues:
1. Run `npm run leads:test` to diagnose connection problems
2. Check the error logs in your application
3. Verify all environment variables are set correctly
4. Ensure database server is running and accessible

## 🔄 Migration and Updates

### Adding New Columns
```sql
-- Add new column to leads table
ALTER TABLE leads ADD COLUMN new_field VARCHAR(255) AFTER existing_field;

-- Update existing records if needed
UPDATE leads SET new_field = 'default_value' WHERE new_field IS NULL;
```

### Version Control
- Keep schema changes in migration files
- Document all structural changes
- Test migrations on development environment first

---

**Last Updated**: August 25, 2025  
**Version**: 1.0.0
