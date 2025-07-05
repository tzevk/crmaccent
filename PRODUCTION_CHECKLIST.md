# 🚀 CRM Accent - Vercel Production Checklist

## ✅ Pre-Deployment Checklist

### Local Testing
- [x] Build process completes successfully (`npm run build`)
- [x] Development server runs without errors (`npm run dev`)
- [x] All navigation links work correctly
- [x] User authentication functions properly
- [x] Database operations work in both demo and production modes

### Files Ready for Production
- [x] `vercel.json` - Deployment configuration
- [x] `.env.production` - Environment variables template
- [x] `next.config.mjs` - Production optimizations
- [x] `deploy.sh` - Deployment script
- [x] `DEPLOYMENT.md` - Comprehensive deployment guide

## 🔧 Vercel Setup Steps

### 1. Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

```
DEMO_MODE=false
DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
```

### 2. Database Configuration
Your Plesk database details:
- Host: `115.124.106.101`
- Database: `crmaccent`
- User: `tk`
- Password: `h4?6J60hd`

### 3. Deployment Options

#### Option A: GitHub Integration (Recommended)
1. Push code to GitHub repository
2. Connect Vercel to GitHub repo
3. Auto-deploy on every push

#### Option B: Manual Deployment
```bash
npm install -g vercel
./deploy.sh
```

### 4. Post-Deployment Setup
1. Visit: `https://your-app.vercel.app/api/setup-db`
2. Initialize database tables
3. Test authentication with default admin:
   - Username: `admin`
   - Password: `admin123`
4. Change admin password immediately

## 🔍 Testing Checklist

### Authentication
- [ ] Signin page loads correctly
- [ ] Demo mode toggle works
- [ ] Production database connection successful
- [ ] User roles (admin, manager, user) function properly

### User Management
- [ ] All Users page displays correctly
- [ ] Add User form validates input
- [ ] User creation works in both demo and production
- [ ] Navigation between user management pages

### Security
- [ ] Default admin password changed
- [ ] Database credentials secured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Environment variables not exposed

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection Fails**
   - Check environment variables
   - Verify database host accessibility
   - Test credentials manually

2. **Build Failures**
   - Run `npm run build` locally
   - Check for syntax errors
   - Verify all imports exist

3. **API Timeouts**
   - Check database response time
   - Consider upgrading Vercel plan
   - Optimize queries

### Debug Commands
```bash
# Local testing
npm run build
npm run db:test
npm run db:setup

# Production testing
curl https://your-app.vercel.app/api/test-db
curl https://your-app.vercel.app/api/setup-db
```

## 📊 Performance Features

### Enabled Optimizations
- [x] Image optimization
- [x] CSS/JS minification  
- [x] Gzip compression
- [x] Static page generation
- [x] API function optimization

### Monitoring
- Vercel Analytics (available in dashboard)
- Error tracking in Vercel logs
- Database performance monitoring

## 🎯 Go-Live Steps

1. **Final Build Test**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   ./deploy.sh
   ```

3. **Configure Environment Variables**
   - Set all production variables in Vercel dashboard

4. **Initialize Database**
   - Visit setup endpoint
   - Verify tables created

5. **Security Setup**
   - Change default passwords
   - Test user permissions

6. **Final Testing**
   - Test all user flows
   - Verify navigation works
   - Check responsive design

## 🎉 Your CRM is Production Ready!

Your professional CRM dashboard is now ready for Vercel deployment with:
- ✅ Modern, responsive UI
- ✅ MariaDB integration
- ✅ User management system
- ✅ Role-based permissions
- ✅ Demo and production modes
- ✅ Production optimizations
- ✅ Security best practices
