# Database Connection Troubleshooting Guide

## Quick Fixes Applied

The following improvements have been made to the database connection system:

### 1. Enhanced Error Handling in `src/lib/db.js`
- Added validation for required environment variables
- Improved error messages with specific codes and suggestions
- Added connection pool error handling and auto-reconnection
- Added connection timeouts and limits
- Created database health check function

### 2. Environment Configuration
- Created `.env.example` with proper configuration template
- Added fallback values for missing environment variables
- Enhanced database configuration with additional options

### 3. Health Check API
- Created `/api/health/database` endpoint for testing connections
- Provides detailed connection status and configuration info

### 4. Database Test Script
- Created `scripts/test-db-connection.js` for command-line testing
- Added npm scripts: `npm run db:test` and `npm run db:health`

## Common Issues and Solutions

### Issue 1: "Cannot connect to database"
**Symptoms:** ECONNREFUSED error
**Solutions:**
1. Check if your database server is running
2. Verify the DB_HOST and DB_PORT in your environment variables
3. For remote databases, check firewall/security group settings

### Issue 2: "Access denied for user"
**Symptoms:** ER_ACCESS_DENIED_ERROR
**Solutions:**
1. Check DB_USER and DB_PASSWORD in your environment file
2. Verify user has proper permissions on the database
3. Test connection with a database client (MySQL Workbench, phpMyAdmin)

### Issue 3: "Database does not exist"
**Symptoms:** ER_BAD_DB_ERROR
**Solutions:**
1. Create the database first: `CREATE DATABASE crmaccent;`
2. Verify DB_NAME matches the actual database name
3. Check if database name has prefixes (common in shared hosting)

### Issue 4: "Table doesn't exist"
**Symptoms:** ER_NO_SUCH_TABLE
**Solutions:**
1. Run database setup: `npm run db:setup`
2. Check if all migration scripts have been run
3. Verify database schema is up to date

## Testing Your Database Connection

### Method 1: Command Line Test
```bash
npm run db:test
```

### Method 2: API Health Check
```bash
# Start your development server first
npm run dev

# Then test the connection
npm run db:health
```

### Method 3: Browser Test
Navigate to: `http://localhost:3000/api/health/database`

## Environment Setup

### For Local Development
1. Create `.env.local` file in project root
2. Copy content from `.env.example`
3. Update with your local database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crmaccent
DB_USER=root
DB_PASSWORD=your_password
DB_SSL=false
```

### For Production (Vercel)
1. Use the existing `.env.production` file as reference
2. Add environment variables in Vercel dashboard
3. Ensure SSL is configured if required

## Database Schema Status

All API endpoints now include enhanced error handling and will provide specific error messages for common issues like missing tables or configuration problems.

The system automatically detects available table columns and adjusts queries accordingly, making it more resilient to schema changes.
