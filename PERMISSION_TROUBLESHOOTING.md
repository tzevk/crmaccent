# Permission Troubleshooting Guide

## Issue: "Insufficient permissions to view projects"

This error occurs when your user account doesn't have the required permissions to access project-related features in the CRM system.

## Quick Solutions

### 1. Use the Permission Checker Tool
Navigate to `/debug/permissions` in your browser to access the automated permission checker and fix tool.

### 2. Manual API Fixes

#### Step 1: Setup Default Roles and Permissions
```bash
curl -X POST "http://localhost:3000/api/debug/fix-permissions" \
  -H "Content-Type: application/json" \
  -d '{"action": "create_default_roles"}'
```

#### Step 2: Ensure Project Permissions Exist
```bash
curl -X POST "http://localhost:3000/api/debug/fix-permissions" \
  -H "Content-Type: application/json" \
  -d '{"action": "ensure_project_permissions"}'
```

#### Step 3: Grant Admin Permissions (replace USER_ID)
```bash
curl -X POST "http://localhost:3000/api/debug/fix-permissions" \
  -H "Content-Type: application/json" \
  -d '{"action": "grant_admin_permissions", "userId": 1}'
```

### 3. Get a Test Authentication Token
```bash
curl -X POST "http://localhost:3000/api/debug/test-auth" \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'
```

### 4. Test Project Access
```bash
curl -X GET "http://localhost:3000/api/projects" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

## Understanding the RBAC System

### Roles
- **Admin**: Full system access
- **Manager**: Management-level access (view, create, edit projects and tasks)
- **Employee**: Standard user access (view projects and tasks, create/edit own tasks)

### Project Permissions
- `project:view` - View projects
- `project:create` - Create new projects
- `project:edit` - Edit existing projects
- `project:delete` - Delete projects
- `project:manage_team` - Manage project team members

### Task Permissions
- `task:view` - View tasks
- `task:create` - Create new tasks
- `task:edit` - Edit existing tasks
- `task:delete` - Delete tasks
- `task:assign` - Assign tasks to users

## Debugging Permissions

### Check Current User Permissions
```bash
curl -X GET "http://localhost:3000/api/debug/permissions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Common Issues

1. **User has no role assigned**
   - Solution: Assign admin role using the fix-permissions API

2. **Role exists but no permissions**
   - Solution: Run `ensure_project_permissions` and `create_default_roles`

3. **Authentication token invalid**
   - Solution: Generate new token using `test-auth` endpoint

4. **Database tables missing**
   - Solution: Run database setup scripts

## Files Created for Permission Management

1. `/src/pages/api/debug/permissions.js` - Permission diagnostic tool
2. `/src/pages/api/debug/fix-permissions.js` - Automated permission fixes
3. `/src/pages/api/debug/test-auth.js` - Test authentication token generator
4. `/src/components/debug/PermissionChecker.jsx` - React component for permission management
5. `/src/app/debug/permissions/page.jsx` - Permission checker page

## Production Considerations

- Remove or secure debug endpoints before production deployment
- Set up proper authentication flow instead of using test tokens
- Configure proper JWT secrets and session management
- Implement proper password hashing and user management

## Need Help?

If you continue to experience permission issues:
1. Check the browser console for error messages
2. Verify your JWT token is valid and not expired
3. Ensure your user account exists and has a role assigned
4. Use the permission checker tool at `/debug/permissions`
5. Contact your system administrator for role assignment
