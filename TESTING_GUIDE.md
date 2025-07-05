# 🧪 Testing Guide for CRM Accent

## Prerequisites
✅ **Server is running on:** http://localhost:3001

## Step-by-Step Testing Process

### 1. 📋 **Database Setup in Plesk**

**First, set up your database in Plesk:**

1. **Login to your Plesk control panel**
2. **Go to Databases** → **Add Database**
3. **Create database:** `crmaccent` (or with your domain prefix)
4. **Create user:** `admin1` with password `h4?6J60hd`
5. **Grant all privileges** to the user

**Run this SQL in Plesk's phpMyAdmin:**
```sql
-- Copy and paste the entire content from database/setup.sql
-- This creates the users table and test users
```

### 2. 🔗 **Test Database Connection**

**Open in browser:** http://localhost:3001/api/test-db

**Expected Results:**
- ✅ **Success:** Database connection successful with timestamp
- ❌ **Error:** Connection details and error message

**Common Issues & Solutions:**
- **"Connection refused"** → Check if Plesk allows remote connections
- **"Access denied"** → Verify username/password in .env.local
- **"Unknown database"** → Check database name (might need domain prefix)

### 3. 🔐 **Test User Authentication**

**Method A: Use the Web Interface**
1. **Go to:** http://localhost:3001
2. **Try these test credentials:**
   - Username: `admin` | Password: `password123`
   - Username: `testuser` | Password: `password123`

**Method B: Test API Directly**
```bash
# Test with curl (run in terminal)
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'
```

**Expected Results:**
- ✅ **Success:** "Sign in successful" message with user data
- ❌ **Error:** "Invalid username or password" or connection error

### 4. 🧪 **Test Different Scenarios**

**Test Invalid Credentials:**
- Username: `admin` | Password: `wrongpassword`
- Username: `wronguser` | Password: `password123`

**Test Empty Fields:**
- Leave username or password empty
- Submit form and check validation

**Test Loading States:**
- Click sign in and observe loading spinner
- Check if form is disabled during submission

### 5. 📊 **Check Browser Console**

**Open Developer Tools (F12) and check:**
- **Console tab:** Look for any JavaScript errors
- **Network tab:** Check API requests to `/api/auth/signin`
- **Response data:** Verify JSON responses

### 6. 🔍 **Debug Database Issues**

**If database connection fails:**

1. **Check Plesk Settings:**
   ```
   - Database → Your DB → Connection Info
   - Note exact hostname, port, database name
   - Check if "Allow remote connections" is enabled
   ```

2. **Update .env.local with exact details:**
   ```env
   DB_HOST=your-actual-plesk-host.com
   DB_NAME=yourdomain_crmaccent  # Note any prefix
   DB_USER=yourdomain_admin1     # Note any prefix
   ```

3. **Test from Plesk phpMyAdmin:**
   ```sql
   SELECT * FROM users;  -- Should show admin and testuser
   ```

### 7. 🚀 **Production Testing on Vercel**

**After deploying to Vercel:**

1. **Set Environment Variables in Vercel Dashboard:**
   ```
   DB_HOST=your-plesk-server.com
   DB_PORT=3306
   DB_NAME=your_actual_db_name
   DB_USER=your_actual_username
   DB_PASSWORD=h4?6J60hd
   ```

2. **Test Production Database:**
   - Visit: `https://your-app.vercel.app/api/test-db`
   - Test signin: `https://your-app.vercel.app`

### 8. 🔧 **Troubleshooting Checklist**

**If signin doesn't work:**
- [ ] Database connection test passes
- [ ] Users table exists with test data
- [ ] Passwords are properly hashed
- [ ] Environment variables are correct
- [ ] No console errors in browser
- [ ] API endpoint returns proper responses

**If deployment fails:**
- [ ] Environment variables set in Vercel
- [ ] Database allows remote connections
- [ ] Firewall allows connections from Vercel IPs
- [ ] SSL configuration if required

## 📋 **Quick Test Commands**

```bash
# Test database connection
curl http://localhost:3001/api/test-db

# Test valid login
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Test invalid login
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}'
```

## 📞 **Support**

If you encounter issues:
1. Check the browser console for errors
2. Visit `/api/test-db` for connection details
3. Verify Plesk database settings
4. Check environment variables match Plesk details
