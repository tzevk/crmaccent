# CRM Accent

A modern Customer Relationship Management system built with Next.js and MySQL.

## Color Scheme
- Primary Dark: `#64126D`
- Primary Light: `#86288F` 
- Background: `#FFFFFF`

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Configuration**
   - Make sure your `.env.local` file has the correct database credentials
   - Current configuration uses MySQL database

3. **Initialize Database**
   ```bash
   curl -X POST http://localhost:3000/api/setup
   ```
   This will create the users table and a default admin user.

4. **Default Login Credentials**
   - Email/Username: `admin@crmaccent.com`
   - Password: `admin123`

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## Features

- ✅ User Authentication (Login/Logout)
- ✅ Protected Dashboard
- ✅ MySQL Database Integration
- ✅ Responsive Design
- ✅ Custom Color Scheme

## API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/health` - Database health check
- `POST /api/setup` - Initialize database

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with mysql2
- **Authentication**: bcrypt for password hashing

## Development

The application follows Next.js 15 App Router structure with:
- Server and Client Components
- API Routes for backend functionality
- Tailwind CSS for styling
- MySQL for data persistence

## 🚀 Deployment

### Production Setup
1. Copy `.env.production.template` to `.env.production`
2. Fill in all production environment variables
3. Set up your production database
4. Run the deployment script: `npm run deploy`
5. Follow the `DEPLOYMENT_CHECKLIST.md`

### Health Check
- Health endpoint: `/api/health`
- Use this for monitoring and load balancer health checks

### Log Management
The application includes a comprehensive logging system:
- User activity logs
- Audit trails for sensitive operations
- Login/security logs
- System event logs
- Log analytics and reporting
- Export functionality

Access logs at: `/dashboard/logs` (requires appropriate permissions)

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
