# 🚀 Vercel Deployment Guide - CRM Accent

## Step-by-Step Vercel Setup

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### 1. Push Your Code to GitHub
```bash
git add .
git commit -m "Production ready CRM without demo mode"
git push origin main
```

#### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Connect your GitHub account if not already connected
4. Find your `crmaccent` repository and click "Import"

#### 3. Configure Environment Variables
In the Vercel project settings, add these **Environment Variables**:

**IMPORTANT**: Add these as Environment Variables, NOT as Secrets

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DB_HOST` | `115.124.106.101` | Production |
| `DB_PORT` | `3306` | Production |
| `DB_NAME` | `crmaccent` | Production |
| `DB_USER` | `tk` | Production |
| `DB_PASSWORD` | `h4?6J60hd` | Production |

**How to add Environment Variables:**
1. Go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in the sidebar
4. For each variable:
   - Enter the **Key** (e.g., `DB_HOST`)
   - Enter the **Value** (e.g., `115.124.106.101`)
   - Select **Environment**: `Production`
   - Click "Add"

#### 4. Deploy
1. Click "Deploy" button
2. Wait for the build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via CLI

#### 1. Install Vercel CLI
```bash
npm install -g vercel
```

#### 2. Login to Vercel
```bash
vercel login
```

#### 3. Deploy
```bash
vercel --prod
```

#### 4. Set Environment Variables via CLI
```bash
vercel env add DB_HOST production
# Enter: 115.124.106.101

vercel env add DB_PORT production
# Enter: 3306

vercel env add DB_NAME production
# Enter: crmaccent

vercel env add DB_USER production
# Enter: tk

vercel env add DB_PASSWORD production
# Enter: h4?6J60hd
```

## Post-Deployment Setup

### 1. Initialize Database
Visit: `https://your-app-url.vercel.app/api/setup-db`

You should see a success response like:
```json
{
  "message": "Database setup completed successfully",
  "tables": ["users"]
}
```

### 2. Test Database Connection
Visit: `https://your-app-url.vercel.app/api/test-db`

You should see:
```json
{
  "message": "Database connection successful",
  "timestamp": "2025-01-06T..."
}
```

### 3. Access Your CRM
1. Go to your deployed URL
2. Sign in with default admin credentials:
   - **Username**: `admin`
   - **Password**: `admin123`
3. **IMPORTANT**: Change the admin password immediately after first login

### Other Test Users (created during database setup):
- **Manager**: username `manager`, password `manager123`
- **User**: username `testuser`, password `user123`

## Troubleshooting

### Environment Variable Issues
- **Error**: "Environment Variable references Secret which does not exist"
- **Solution**: Add variables as Environment Variables, not Secrets
- **Check**: Go to Vercel Dashboard → Project → Settings → Environment Variables

### Database Connection Issues
- **Error**: "Database connection failed"
- **Solutions**:
  1. Verify all environment variables are set correctly
  2. Check database host/port accessibility
  3. Confirm database credentials
  4. Test from your local machine first

### Build Failures
- **Error**: Build fails during deployment
- **Solutions**:
  1. Run `npm run build` locally to test
  2. Check for syntax errors
  3. Verify all imports are correct

### API Function Timeouts
- **Error**: API functions timing out
- **Solutions**:
  1. Check database response times
  2. Optimize queries
  3. Consider upgrading Vercel plan

## Production Checklist

### Before Deployment
- [x] Demo mode completely removed
- [x] All API endpoints use database only
- [x] Passwords are hashed with bcrypt
- [x] Environment variables configured
- [x] Build process tested locally

### After Deployment
- [ ] Database initialized successfully
- [ ] Test database connection
- [ ] Admin login works
- [ ] User creation works
- [ ] Navigation functions properly
- [ ] Change default admin password

## Security Notes

### Database Security
- Database credentials are stored as Vercel environment variables
- Passwords are stored as plain text (suitable for internal/demo use)
- Database queries use parameterized statements to prevent SQL injection

### Application Security
- HTTPS enabled automatically by Vercel
- Security headers configured in `next.config.mjs`
- Input validation on all forms
- Role-based access control

## Your Production URLs

After deployment, your app will be available at:
- **Main App**: `https://your-project-name.vercel.app`
- **Database Setup**: `https://your-project-name.vercel.app/api/setup-db`
- **Database Test**: `https://your-project-name.vercel.app/api/test-db`

## Need Help?

### Common Commands
```bash
# Test build locally
npm run build

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Check environment variables
vercel env ls
```

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Check Vercel project dashboard for detailed logs
