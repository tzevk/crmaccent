# Vercel Deployment Guide for CRM Accent

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com
3. Have your database credentials ready

## Environment Variables Setup

After deploying, you need to set these environment variables in your Vercel dashboard:

### Required Environment Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-here-change-this
DB_HOST=115.124.106.101
DB_PORT=3306
DB_NAME=crmaccent
DB_USER=tk
DB_PASSWORD=h4?6J60hd
DB_SSL=false
```

## Deployment Steps

### Option 1: Deploy via Vercel CLI
1. Open terminal in project root
2. Run: `vercel login`
3. Run: `vercel`
4. Follow the prompts:
   - Link to existing project? **N**
   - Project name: **crmaccent** (or your preferred name)
   - Directory: **./** (current directory)
   - Override settings? **N**

### Option 2: Deploy via GitHub (Recommended)
1. Push your code to GitHub
2. Go to https://vercel.com/dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings (should auto-detect Next.js)
6. Add environment variables (see section below)
7. Deploy

## Adding Environment Variables in Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. Add each variable:
   - Name: `JWT_SECRET`
   - Value: `your-super-secure-jwt-secret-key-here-change-this`
   - Environment: `Production`
   - Click "Save"

Repeat for all variables listed above.

## Post-Deployment Testing

1. Visit your deployed URL
2. Go to `/debug/production-fix` to test permissions
3. Generate a production token
4. Test the projects page at `/dashboard/projects`
5. If issues persist, check function logs in Vercel dashboard

## Important Notes

- The app includes production fallbacks for when database connections fail
- JWT authentication works without database sessions in production
- Mock data is available if database is unreachable
- All API endpoints have production-friendly error handling

## Troubleshooting

If you encounter issues:

1. **Build Errors**: Check the build logs in Vercel dashboard
2. **Runtime Errors**: Check function logs in Vercel dashboard
3. **Database Connection**: Verify environment variables are set correctly
4. **Permissions Issues**: Use the `/debug/production-fix` page to diagnose

## Useful Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View function logs
vercel logs [deployment-url]

# Remove deployment
vercel rm [deployment-name]
```

## Security Checklist

- [ ] Change JWT_SECRET from default value
- [ ] Verify database credentials are correct
- [ ] Test all major features work in production
- [ ] Check that sensitive data is not exposed in logs
- [ ] Verify API endpoints require proper authentication
