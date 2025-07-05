# CRM Accent - Production Deployment Guide

## 🚀 Vercel Deployment Instructions

### Prerequisites
- Vercel account
- MariaDB/MySQL database (Plesk or other hosting)
- Node.js 18+ installed locally

### Step 1: Prepare Your Database
1. Create a MariaDB/MySQL database on your hosting provider (Plesk recommended)
2. Note down your database credentials:
   - Host (IP address or domain)
   - Port (usually 3306)
   - Database name
   - Username
   - Password

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Connect your GitHub repository
4. Configure environment variables in project settings:
   ```
   DEMO_MODE=false
   DB_HOST=your-database-host
   DB_PORT=3306
   DB_NAME=your-database-name
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   ```
5. Deploy!

#### Option B: Using CLI
1. Install Vercel CLI: `npm install -g vercel`
2. Run deployment script: `./deploy.sh`
3. Follow prompts to configure

### Step 3: Initialize Database
1. After deployment, visit: `https://your-app.vercel.app/api/setup-db`
2. This will create all necessary tables
3. Check the response for success confirmation

### Step 4: Create First Admin User
1. Go to your deployed app: `https://your-app.vercel.app`
2. Use the signin form with these default credentials:
   - Username: `admin`
   - Password: `admin123`
3. Change the admin password immediately after first login

### Step 5: Test User Management
1. Navigate to User Management
2. Create test users with different roles
3. Test authentication and permissions

## 🔧 Configuration Files

### Environment Variables
Create these in Vercel dashboard:
- `DEMO_MODE`: Set to `false` for production
- `DB_HOST`: Your database server address
- `DB_PORT`: Database port (usually 3306)
- `DB_NAME`: Your database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

### Vercel Configuration
The `vercel.json` file is already configured with:
- API function timeouts
- Environment variable mapping
- Build settings

## 🛡️ Security Considerations

### Database Security
- Use strong passwords
- Limit database access to your server IP
- Enable SSL if available
- Regular backups

### Application Security
- Change default admin credentials immediately
- Use strong passwords for all users
- Enable HTTPS (handled by Vercel)
- Monitor user activity logs

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Errors
1. Check environment variables are set correctly
2. Verify database host/port accessibility
3. Test database credentials manually
4. Check firewall settings

#### Build Failures
1. Run `npm run build` locally to test
2. Check for TypeScript/syntax errors
3. Verify all dependencies are in package.json

#### API Timeouts
1. Check database response times
2. Consider upgrading Vercel plan for longer timeouts
3. Optimize database queries

### Debug Mode
To enable debug logging, add to environment variables:
```
DEBUG=true
NODE_ENV=production
```

## 📊 Performance Optimization

### Database
- Add indexes for frequently queried fields
- Monitor query performance
- Use connection pooling

### Frontend
- Images are optimized automatically
- CSS/JS minification enabled
- Gzip compression enabled

## 🔄 Updates and Maintenance

### Updating the Application
1. Push changes to your Git repository
2. Vercel will auto-deploy (if configured)
3. Monitor deployment status in Vercel dashboard

### Database Backups
- Set up regular database backups
- Test restore procedures
- Store backups securely

## 📞 Support

For issues specific to:
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Database**: Check your hosting provider's documentation
- **Application**: Review error logs in Vercel dashboard

## 🎯 Production Checklist

- [ ] Database created and accessible
- [ ] Environment variables configured
- [ ] Application deployed successfully
- [ ] Database initialized via `/api/setup-db`
- [ ] Admin user password changed
- [ ] User management tested
- [ ] SSL certificate active
- [ ] Database backups configured
- [ ] Monitoring set up
