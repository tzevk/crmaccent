# 🎯 Demo Mode - CRM Accent

## Current Status: DEMO MODE ACTIVE

Your CRM Accent application is now running in **demo mode** with dummy credentials while keeping all the database logic intact.

## 🎮 Test Credentials

**Available Demo Users:**

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `password123` | Admin | Full system access |
| `manager` | `password123` | Manager | Management features |
| `testuser` | `password123` | User | Basic user access |

## 🧪 How to Test

### 1. **Visit the App**
- Open: http://localhost:3000
- You'll see demo credentials displayed on the signin page

### 2. **Test Authentication**
- Try logging in with any of the demo credentials above
- Success message will show "(Demo Mode)" indicator
- Invalid credentials will still show proper error messages

### 3. **Test API Endpoints**
- **Demo Data**: http://localhost:3000/api/test-db
- **Authentication**: Use the signin form or test with curl:

```bash
# Test successful login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test failed login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

## 🔧 Demo Mode Features

✅ **Working Features:**
- User authentication with simple password comparison (no hashing for demo)
- Multiple user roles (admin, manager, user)
- Proper error handling and validation
- Loading states and user feedback
- API endpoints for authentication
- All frontend functionality

🎭 **Demo Behavior:**
- Uses in-memory dummy data instead of database
- Simple plain text password comparison for easy testing
- All API responses include `"demo": true` flag
- Console logs indicate demo mode usage

## 🚀 Switching to Production Mode

When your Plesk database is ready:

### 1. **Update Environment**
```env
# Change this line in .env.local
DEMO_MODE=false

# Ensure database credentials are correct
DB_HOST=your-plesk-host.com
DB_NAME=your_actual_database_name
DB_USER=your_actual_username
DB_PASSWORD=your_actual_password
```

### 2. **Setup Database**
- Run the SQL script from `database/setup.sql` in your Plesk database
- Ensure remote access is enabled in Plesk
- Test connection with the provided test script

### 3. **Verify Production Mode**
- Restart the app: `npm run dev`
- Visit `/api/test-db` - should show "PRODUCTION" mode
- Login should work with database users

## 📋 Demo Users Data Structure

```javascript
{
  id: 1,
  username: 'admin',
  email: 'admin@crmaccent.com',
  first_name: 'Admin',
  last_name: 'User',
  role: 'admin',
  is_active: true,
  created_at: '2025-01-06...',
  updated_at: '2025-01-06...'
}
```

## 🔍 Debugging

**Check Current Mode:**
- Visit `/api/test-db` to see current mode (DEMO or PRODUCTION)
- Console logs will indicate which mode is active
- Success messages include mode indicator

**Common Issues:**
- **Module errors**: Fixed - all imports are working
- **Database timeouts**: Bypassed in demo mode
- **Authentication**: Working with dummy data

## 🎉 Ready for Demo!

Your application is now fully functional for demonstration purposes. All authentication logic is preserved, and you can easily switch to production mode when your database is ready.

**Perfect for:**
- Client demonstrations
- Testing user interface
- Validating authentication flow
- Showcasing features without database dependencies
