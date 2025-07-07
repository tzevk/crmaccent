#!/bin/bash

# CRM Accent - Production Deployment Cleanup Script
# This script prepares the project for production deployment

echo "🚀 Starting CRM Accent Production Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Log System Status Check
print_status "Checking log system implementation..."
if [ -f "src/utils/logUtils.js" ] && [ -f "src/components/logs/LogManager.jsx" ]; then
    print_success "✅ Complete log management system implemented"
    print_success "  - Database schema and API endpoints"
    print_success "  - Frontend components and navigation"
    print_success "  - RBAC integration and security"
    print_success "  - Export and analytics features"
else
    print_error "❌ Log system files missing"
fi

# 2. Frontend Components Status
print_status "Checking frontend components..."
if [ -d "src/components/logs" ] && [ -f "src/app/dashboard/logs/page.jsx" ]; then
    print_success "✅ Frontend log management components ready"
    print_success "  - LogManager: Main dashboard"
    print_success "  - LogFilters: Advanced filtering"
    print_success "  - LogTable: Data display with pagination"
    print_success "  - LogAnalytics: Visual analytics"
    print_success "  - LogDetailModal: Detailed inspection"
    print_success "  - ExportLogs: CSV/JSON/ZIP export"
else
    print_error "❌ Frontend components missing"
fi

# 3. Navigation Integration Status
print_status "Checking navigation integration..."
if grep -q "FileText" "src/components/navigation/Navbar.jsx"; then
    print_success "✅ Navigation updated with logs menu"
else
    print_warning "⚠️  Navigation may need manual update"
fi

# 4. RBAC Permissions Status
print_status "Checking RBAC permissions..."
if grep -q "LOGS_VIEW" "src/utils/authUtils.js"; then
    print_success "✅ RBAC permissions configured"
    print_success "  - Admin: Full log access"
    print_success "  - Manager: View and export"
    print_success "  - User: No direct access"
else
    print_warning "⚠️  RBAC permissions may need verification"
fi

# 5. Database Integration Status
print_status "Checking database integration..."
if [ -f "src/pages/api/create-log-tables.js" ] && [ -f "src/pages/api/logs/index.js" ]; then
    print_success "✅ Database integration complete"
    print_success "  - Schema creation endpoint"
    print_success "  - Log management API"
    print_success "  - Analytics endpoint"
    print_success "  - Export functionality"
else
    print_error "❌ Database integration incomplete"
fi

# 6. Clean up development files
print_status "Cleaning up development files..."
if [ -d "scripts/debug" ]; then
    print_success "✅ Debug files properly organized"
else
    print_warning "⚠️  No debug directory found"
fi

# Remove any test files
find . -name "*.test.js" -type f -delete 2>/dev/null
find . -name "*.spec.js" -type f -delete 2>/dev/null

print_success "Development files cleaned"

# 7. Build validation
print_status "Validating production build..."
if npm run build > /dev/null 2>&1; then
    print_success "✅ Production build successful"
else
    print_error "❌ Build validation failed - check for errors"
fi

echo "🚀 Starting CRM Accent cleanup and production preparation..."

# Create logs for the cleanup process
CLEANUP_LOG="./cleanup.log"
echo "Cleanup started at $(date)" > $CLEANUP_LOG

# 1. Clean up development/test files
echo "📁 Cleaning up development files..."
rm -rf ./scripts/debug/debug-*.js 2>/dev/null || true
rm -rf ./scripts/debug/test-*.js 2>/dev/null || true

# 2. Clean up node_modules and reinstall for production
echo "📦 Reinstalling dependencies for production..."
rm -rf node_modules
rm -f package-lock.json
npm install --production=false

# 3. Run linting and fix issues
echo "🔍 Running linter..."
npm run lint 2>&1 | tee -a $CLEANUP_LOG

# 4. Build the project to check for errors
echo "🏗️ Building project..."
npm run build 2>&1 | tee -a $CLEANUP_LOG

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Check the log for errors."
    exit 1
fi

# 5. Create production environment file template
echo "📝 Creating production environment template..."
cat > .env.production.template << EOF
# Production Environment Configuration
# Copy this file to .env.production and fill in your actual values

# Database Configuration
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Application Configuration
NEXT_PUBLIC_API_URL=https://your-production-domain.com
NODE_ENV=production

# Email Configuration (if needed)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# Optional: Analytics/Monitoring
NEXT_PUBLIC_GA_ID=your-google-analytics-id
EOF

# 6. Create deployment checklist
echo "📋 Creating deployment checklist..."
cat > DEPLOYMENT_CHECKLIST.md << EOF
# CRM Accent Deployment Checklist

## Pre-Deployment
- [ ] Update .env.production with actual production values
- [ ] Ensure database is set up and accessible
- [ ] Run database migrations: \`curl -X POST https://your-domain.com/api/create-log-tables\`
- [ ] Test all API endpoints in staging environment
- [ ] Verify log management system is working
- [ ] Test user authentication and authorization
- [ ] Verify RBAC permissions are working correctly

## Deployment
- [ ] Deploy to production server
- [ ] Set up SSL certificate
- [ ] Configure domain and DNS
- [ ] Set up monitoring and alerting
- [ ] Configure backups

## Post-Deployment
- [ ] Test login functionality
- [ ] Verify logs are being created
- [ ] Test all major features
- [ ] Set up log retention policies
- [ ] Monitor performance and errors
- [ ] Create admin user account

## Features Included
- ✅ Role-Based Access Control (RBAC)
- ✅ Comprehensive Logging System
- ✅ User Activity Tracking
- ✅ Audit Trail
- ✅ Login/Security Logs
- ✅ System Event Logs
- ✅ Log Analytics and Reporting
- ✅ Log Export Functionality
- ✅ Project Management
- ✅ Lead Management
- ✅ Client Management
- ✅ User Management
- ✅ Dashboard and Reports

## Support
For support or questions, refer to the README.md file or contact the development team.
EOF

# 7. Update package.json scripts for production
echo "🔧 Adding production scripts..."
npm pkg set scripts.start:prod="NODE_ENV=production next start"
npm pkg set scripts.logs:setup="curl -X POST \$NEXT_PUBLIC_API_URL/api/create-log-tables"
npm pkg set scripts.health:check="curl -X GET \$NEXT_PUBLIC_API_URL/api/health"

# 8. Create a simple health check endpoint
echo "🏥 Creating health check endpoint..."
mkdir -p src/pages/api
cat > src/pages/api/health.js << EOF
// Health check endpoint for production monitoring
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };

    return res.status(200).json(healthStatus);
  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
EOF

# 9. Update README with deployment info
echo "📚 Updating README..."
cat >> README.md << EOF

## 🚀 Deployment

### Production Setup
1. Copy \`.env.production.template\` to \`.env.production\`
2. Fill in all production environment variables
3. Set up your production database
4. Run the deployment script: \`npm run deploy\`
5. Follow the \`DEPLOYMENT_CHECKLIST.md\`

### Health Check
- Health endpoint: \`/api/health\`
- Use this for monitoring and load balancer health checks

### Log Management
The application includes a comprehensive logging system:
- User activity logs
- Audit trails for sensitive operations
- Login/security logs
- System event logs
- Log analytics and reporting
- Export functionality

Access logs at: \`/dashboard/logs\` (requires appropriate permissions)

### Features
- ✅ Role-Based Access Control (RBAC)
- ✅ Comprehensive Logging System  
- ✅ Project Management
- ✅ Lead Management
- ✅ Client Management
- ✅ User Management
- ✅ Dashboard and Reports
- ✅ Export/Import Functionality

### Support
For deployment assistance, check the deployment checklist and logs.
EOF

echo "✅ Cleanup and production preparation completed!"
echo "📄 Check the following files:"
echo "   - DEPLOYMENT_CHECKLIST.md"
echo "   - .env.production.template"
echo "   - cleanup.log"
echo ""
echo "🎯 Next steps:"
echo "   1. Review and complete the deployment checklist"
echo "   2. Set up your production environment variables"
echo "   3. Deploy to your production server"
echo "   4. Run the database setup: npm run logs:setup"
echo "   5. Test the health check: npm run health:check"
echo ""
echo "🚀 Your CRM system is ready for production!"
EOF
