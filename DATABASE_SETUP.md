# CRM Accent - Plesk Database Setup and Deployment Guide

## Plesk Database Configuration

### 1. **Get Your Plesk Database Details**
In your Plesk control panel, go to:
- **Databases** → **Database name** → **Connection info**

You'll need:
- **Host**: Usually your domain or server IP (e.g., `yourdomain.com` or `123.456.789.012`)
- **Port**: Usually `3306` (check if different)
- **Database Name**: May have a prefix (e.g., `yourdomain_crmaccent`)
- **Username**: May have a prefix (e.g., `yourdomain_admin1`)
- **Password**: Your database password

### 2. **Update Environment Variables**
Edit your `.env.local` file with your actual Plesk details:
```
DB_HOST=your-plesk-server-domain.com
DB_PORT=3306
DB_NAME=yourdomain_crmaccent
DB_USER=yourdomain_admin1
DB_PASSWORD=your-actual-password
```

### 3. **Common Plesk Database Formats**
```
# Standard format
DB_HOST=yourdomain.com
DB_NAME=yourdomain_crmaccent
DB_USER=yourdomain_admin1

# Or with server IP
DB_HOST=123.456.789.012
DB_NAME=crmaccent
DB_USER=admin1

# Some providers use different ports
DB_PORT=3307
```

## Local Development Setup

1. **Test Database Connection**
   ```bash
   npm run dev
   # Visit: http://localhost:3000/api/test-db
   ```
   This will show detailed connection info and any errors.

2. **Create Database Schema**
   - Access your Plesk database via phpMyAdmin or MySQL client
   - Run the SQL commands from `database/setup.sql`

## Deployment on Vercel

### 1. **Vercel Environment Variables**
In your Vercel project dashboard, add these environment variables:
```
DB_HOST=your-plesk-server-domain.com
DB_PORT=3306
DB_NAME=yourdomain_crmaccent
DB_USER=yourdomain_admin1
DB_PASSWORD=your-actual-password
```

### 2. **SSL Configuration (if required)**
Some Plesk servers require SSL. Add this variable if needed:
```
DB_SSL=true
```

### 3. **Deploy to Vercel**
```bash
vercel --prod
```

## Troubleshooting Plesk Connections

### Common Issues:

1. **Connection Refused**
   - Check if remote MySQL access is enabled in Plesk
   - Verify the host/IP address is correct
   - Check firewall settings

2. **Access Denied**
   - Verify username/password are correct
   - Check if the database user has remote access permissions
   - Database name might have a domain prefix

3. **Host Not Found**
   - Try using the server IP instead of domain name
   - Check if the MySQL port is different from 3306

### Debug Steps:

1. **Test from Plesk**
   - Use phpMyAdmin in Plesk to verify database exists
   - Create a simple test table to confirm write permissions

2. **Check Connection Details**
   - Visit `/api/test-db` to see detailed connection information
   - Check Vercel function logs for specific error messages

3. **Enable Remote Access**
   - In Plesk: Go to **Databases** → **User Management**
   - Ensure the user has permissions for remote connections
   - Add `%` or specific IP ranges if needed

### Plesk-Specific Settings:

1. **Database User Permissions**
   ```sql
   -- Run this in Plesk's phpMyAdmin if needed
   GRANT ALL PRIVILEGES ON yourdomain_crmaccent.* TO 'yourdomain_admin1'@'%';
   FLUSH PRIVILEGES;
   ```

2. **Remote Access**
   - Enable "Allow remote connections" in Plesk Database settings
   - Add your Vercel IP ranges if required

## Test Users (from setup.sql)
- **Username**: admin, **Password**: password123, **Role**: admin
- **Username**: testuser, **Password**: password123, **Role**: user
