# Role-Based Access Control (RBAC) Implementation

## Overview
This CRM system now includes a comprehensive Role-Based Access Control (RBAC) system that allows administrators to control what different user types can see and do within the application.

## Role Hierarchy
1. **Admin** - Full access to everything
2. **Manager** - Most access, can manage projects, teams, and view reports
3. **Staff** - Limited access, can only see/edit their own resources
4. **User** - Basic access, mostly viewing permissions

## Key Components

### 1. RBAC Core System (`/src/utils/rbac.js`)
- **Permissions**: Defines granular permissions for different actions
- **Role Permissions Mapping**: Maps roles to their allowed permissions
- **Utility Functions**: Helper functions for permission checks and data filtering

### 2. Authentication Middleware (`/src/middleware/auth.js`)
- Session management
- Permission validation for API routes
- Data filtering based on user roles

### 3. Enhanced Project API (`/src/pages/api/projects/index.js`)
- Integrated RBAC checks for all CRUD operations
- Role-based data filtering (staff see only their projects)
- Permission validation before operations

### 4. Enhanced Projects API Utility (`/src/utils/projectsAPI.js`)
- RBAC-aware API wrapper functions
- Permission checks before API calls
- Helper methods for UI permission checks

### 5. Updated Navigation (`/src/components/navigation/Navbar.jsx`)
- Dynamic navigation based on user permissions
- Role-based menu filtering
- User role indicator

### 6. RBAC-Enhanced Frontend (`/src/app/dashboard/projects/page.jsx`)
- Permission-based UI elements
- Conditional rendering of actions
- Role-specific access controls

## Permission Categories

### Dashboard Permissions
- `dashboard:view` - View dashboard
- `dashboard:stats` - View statistics

### Project Permissions  
- `projects:view` - View projects
- `projects:create` - Create new projects
- `projects:edit` - Edit projects
- `projects:delete` - Delete projects
- `projects:assign_team` - Assign team members
- `projects:view_budget` - View project budgets
- `projects:edit_budget` - Edit project budgets

### Task Permissions
- `tasks:view` - View tasks
- `tasks:create` - Create tasks
- `tasks:edit` - Edit tasks
- `tasks:delete` - Delete tasks
- `tasks:assign` - Assign tasks
- `tasks:view_all` - View all tasks vs only assigned

### Master Data Permissions
- `masters:view` - View master data
- `masters:disciplines` - Manage disciplines
- `masters:activities` - Manage activities
- `masters:inquiries` - Manage inquiries
- `masters:project_scopes` - Manage project scopes

### User Management Permissions
- `users:view` - View users
- `users:create` - Create users
- `users:edit` - Edit users
- `users:delete` - Delete users
- `users:assign_roles` - Assign roles to users

## Role-Specific Access

### Admin Role
- Full access to all features
- Can configure permissions for other roles
- Can view/edit all data
- Access to system settings and security

### Manager Role
- Can create, edit, and manage projects
- Can assign team members
- Can view and edit budgets
- Can access most reports
- Can manage master data

### Staff Role
- Can view projects they're assigned to or manage
- Can edit their own tasks and assigned projects
- Limited budget viewing
- Cannot delete projects or users
- Can view master data but not edit

### User Role
- Basic viewing permissions only
- Can see projects they're assigned to
- Can view their own tasks
- Very limited editing capabilities

## Testing the RBAC System

### User Session Simulator
The application includes a floating RBAC simulator in the bottom-right corner that allows you to:
- Switch between different user roles
- See how navigation changes
- Test permission-based UI elements
- Observe access restrictions

### How to Test
1. **Start the application**: `npm run dev`
2. **Navigate to any dashboard page**
3. **Use the RBAC Simulator** to switch roles:
   - Try "Admin" to see full access
   - Switch to "Manager" to see reduced options
   - Try "Staff" to see limited access
   - Switch to "User" to see minimal permissions

### Expected Behaviors by Role

#### Admin
- Sees all navigation items
- "New Project" button visible
- All action buttons (view, edit, delete) available
- Budget information visible
- Can access RBAC admin panel

#### Manager  
- Most navigation items visible
- "New Project" button visible
- Edit and view actions available
- Delete may be restricted for some projects
- Budget information visible

#### Staff
- Limited navigation items
- "New Project" button may be hidden
- Only see projects they're involved in
- Edit only their own projects
- Limited budget visibility

#### User
- Minimal navigation
- "Create Restricted" indicator instead of "New Project"
- Only view actions available
- Lock icons on restricted actions
- Budget information hidden

## API Integration

### Headers Required
```javascript
{
  'x-user-role': 'admin|manager|staff|user',
  'x-user-id': 'user_id_string'
}
```

### Error Responses
- `401 Unauthorized` - No valid session
- `403 Forbidden` - Insufficient permissions
- Detailed error messages explaining required permissions

## Admin Configuration

### RBAC Admin Panel
- **Location**: `/dashboard/users/roles` (admin only)
- **Features**:
  - Configure permissions for manager, staff, and user roles
  - Visual permission categories
  - Real-time permission counting
  - Save configuration (simulated)

## Security Features

1. **API Route Protection**: All API endpoints validate permissions
2. **UI Permission Checks**: Buttons and actions hidden based on roles
3. **Data Filtering**: Users only see data they have access to
4. **Navigation Filtering**: Menu items filtered by permissions
5. **Budget Protection**: Financial data hidden from unauthorized users

## Future Enhancements

1. **Database Storage**: Store role configurations in database
2. **JWT Integration**: Replace mock session with real JWT tokens
3. **Audit Logging**: Track permission changes and access attempts
4. **Dynamic Permissions**: Allow custom permission creation
5. **Resource-Level Permissions**: More granular project/task ownership
6. **API Key Management**: Service-to-service authentication

## File Structure

```
src/
├── utils/
│   ├── rbac.js                 # Core RBAC system
│   └── projectsAPI.js          # RBAC-enhanced API wrapper
├── middleware/
│   └── auth.js                 # Authentication middleware
├── components/
│   ├── navigation/Navbar.jsx   # RBAC-aware navigation
│   ├── UserSessionSimulator.jsx # Testing tool
│   └── RBACAdminPanel.jsx      # Admin configuration
├── pages/api/
│   └── projects/index.js       # RBAC-protected API
└── app/dashboard/
    └── projects/page.jsx       # RBAC-enhanced frontend
```

This implementation provides a solid foundation for role-based access control that can be extended and customized based on specific business requirements.
