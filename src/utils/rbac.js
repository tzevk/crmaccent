// Role-Based Access Control (RBAC) System

// Define available permissions
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD_VIEW: 'dashboard:view',
  DASHBOARD_STATS: 'dashboard:stats',
  
  // Project permissions
  PROJECTS_VIEW: 'projects:view',
  PROJECTS_CREATE: 'projects:create',
  PROJECTS_EDIT: 'projects:edit',
  PROJECTS_DELETE: 'projects:delete',
  PROJECTS_ASSIGN_TEAM: 'projects:assign_team',
  PROJECTS_VIEW_BUDGET: 'projects:view_budget',
  PROJECTS_EDIT_BUDGET: 'projects:edit_budget',
  
  // Task permissions
  TASKS_VIEW: 'tasks:view',
  TASKS_CREATE: 'tasks:create',
  TASKS_EDIT: 'tasks:edit',
  TASKS_DELETE: 'tasks:delete',
  TASKS_ASSIGN: 'tasks:assign',
  TASKS_VIEW_ALL: 'tasks:view_all', // View all tasks vs only assigned tasks
  
  // Lead permissions
  LEADS_VIEW: 'leads:view',
  LEADS_CREATE: 'leads:create',
  LEADS_EDIT: 'leads:edit',
  LEADS_DELETE: 'leads:delete',
  LEADS_ASSIGN: 'leads:assign',
  LEADS_CONVERT: 'leads:convert',
  
  // Client permissions
  CLIENTS_VIEW: 'clients:view',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_EDIT: 'clients:edit',
  CLIENTS_DELETE: 'clients:delete',
  
  // Employee permissions
  EMPLOYEES_VIEW: 'employees:view',
  EMPLOYEES_CREATE: 'employees:create',
  EMPLOYEES_EDIT: 'employees:edit',
  EMPLOYEES_DELETE: 'employees:delete',
  EMPLOYEES_VIEW_SALARY: 'employees:view_salary',
  EMPLOYEES_EDIT_SALARY: 'employees:edit_salary',
  
  // Master data permissions
  MASTERS_VIEW: 'masters:view',
  MASTERS_DISCIPLINES: 'masters:disciplines',
  MASTERS_ACTIVITIES: 'masters:activities',
  MASTERS_INQUIRIES: 'masters:inquiries',
  MASTERS_PROJECT_SCOPES: 'masters:project_scopes',
  
  // User management permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_ASSIGN_ROLES: 'users:assign_roles',
  
  // Report permissions
  REPORTS_VIEW: 'reports:view',
  REPORTS_EMPLOYEE: 'reports:employee',
  REPORTS_FINANCIAL: 'reports:financial',
  REPORTS_PROJECT: 'reports:project',
  
  // Settings permissions
  SETTINGS_SYSTEM: 'settings:system',
  SETTINGS_SECURITY: 'settings:security',
  SETTINGS_INTEGRATIONS: 'settings:integrations',
  
  // Communication permissions
  COMMUNICATIONS_VIEW: 'communications:view',
  COMMUNICATIONS_CREATE: 'communications:create',
  
  // File management permissions
  FILES_UPLOAD: 'files:upload',
  FILES_DELETE: 'files:delete',
  FILES_VIEW_ALL: 'files:view_all',
  
  // Log management permissions
  LOGS_VIEW: 'logs:view',
  LOGS_EXPORT: 'logs:export',
  LOGS_ANALYTICS: 'logs:analytics',
  LOGS_DELETE: 'logs:delete'
};

// Define default role permissions
export const ROLE_PERMISSIONS = {
  admin: [
    // Full access to everything
    ...Object.values(PERMISSIONS)
  ],
  
  manager: [
    // Dashboard access
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DASHBOARD_STATS,
    
    // Project management
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_ASSIGN_TEAM,
    PERMISSIONS.PROJECTS_VIEW_BUDGET,
    PERMISSIONS.PROJECTS_EDIT_BUDGET,
    
    // Task management
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_ASSIGN,
    PERMISSIONS.TASKS_VIEW_ALL,
    
    // Lead management
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT,
    PERMISSIONS.LEADS_ASSIGN,
    PERMISSIONS.LEADS_CONVERT,
    
    // Client management
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.CLIENTS_CREATE,
    PERMISSIONS.CLIENTS_EDIT,
    
    // Employee viewing (limited)
    PERMISSIONS.EMPLOYEES_VIEW,
    
    // Master data viewing
    PERMISSIONS.MASTERS_VIEW,
    PERMISSIONS.MASTERS_DISCIPLINES,
    PERMISSIONS.MASTERS_ACTIVITIES,
    PERMISSIONS.MASTERS_INQUIRIES,
    PERMISSIONS.MASTERS_PROJECT_SCOPES,
    
    // Basic reports
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_PROJECT,
    
    // Communications
    PERMISSIONS.COMMUNICATIONS_VIEW,
    PERMISSIONS.COMMUNICATIONS_CREATE,
    
    // File management
    PERMISSIONS.FILES_UPLOAD,
    PERMISSIONS.FILES_VIEW_ALL,
    
    // Log management
    PERMISSIONS.LOGS_VIEW,
    PERMISSIONS.LOGS_ANALYTICS,
    PERMISSIONS.LOGS_EXPORT
  ],
  
  staff: [
    // Basic dashboard access
    PERMISSIONS.DASHBOARD_VIEW,
    
    // Limited project access
    PERMISSIONS.PROJECTS_VIEW,
    
    // Task management (own tasks)
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_EDIT, // Only their own tasks
    
    // Lead viewing and basic editing
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_EDIT, // Only assigned leads
    
    // Client viewing
    PERMISSIONS.CLIENTS_VIEW,
    
    // Master data viewing only
    PERMISSIONS.MASTERS_VIEW,
    
    // Basic communications
    PERMISSIONS.COMMUNICATIONS_VIEW,
    
    // Basic file access
    PERMISSIONS.FILES_UPLOAD
  ],
  
  user: [
    // Very limited access - mainly viewing
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.CLIENTS_VIEW,
    PERMISSIONS.COMMUNICATIONS_VIEW
  ]
};

// RBAC utility functions
export const rbacUtils = {
  // Check if user has specific permission
  hasPermission: (userRole, permission) => {
    if (!userRole) return false;
    const rolePermissions = ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
    return rolePermissions.includes(permission);
  },

  // Check if user has any of the specified permissions
  hasAnyPermission: (userRole, permissions) => {
    return permissions.some(permission => rbacUtils.hasPermission(userRole, permission));
  },

  // Check if user has all specified permissions
  hasAllPermissions: (userRole, permissions) => {
    return permissions.every(permission => rbacUtils.hasPermission(userRole, permission));
  },

  // Get all permissions for a role
  getRolePermissions: (userRole) => {
    return ROLE_PERMISSIONS[userRole.toLowerCase()] || [];
  },

  // Check if user can access a specific route
  canAccessRoute: (userRole, route) => {
    const routePermissions = {
      '/dashboard': [PERMISSIONS.DASHBOARD_VIEW],
      '/dashboard/projects': [PERMISSIONS.PROJECTS_VIEW],
      '/dashboard/projects/add': [PERMISSIONS.PROJECTS_CREATE],
      '/dashboard/projects/edit': [PERMISSIONS.PROJECTS_EDIT],
      '/dashboard/projects/tasks': [PERMISSIONS.TASKS_VIEW],
      '/dashboard/projects/tasks/add': [PERMISSIONS.TASKS_CREATE],
      '/dashboard/leads': [PERMISSIONS.LEADS_VIEW],
      '/dashboard/leads/add': [PERMISSIONS.LEADS_CREATE],
      '/dashboard/clients': [PERMISSIONS.CLIENTS_VIEW],
      '/dashboard/clients/add': [PERMISSIONS.CLIENTS_CREATE],
      '/dashboard/masters': [PERMISSIONS.MASTERS_VIEW],
      '/dashboard/masters/disciplines': [PERMISSIONS.MASTERS_DISCIPLINES],
      '/dashboard/masters/employees': [PERMISSIONS.EMPLOYEES_VIEW],
      '/dashboard/masters/activities': [PERMISSIONS.MASTERS_ACTIVITIES],
      '/dashboard/masters/inquiries': [PERMISSIONS.MASTERS_INQUIRIES],
      '/dashboard/masters/salaries': [PERMISSIONS.EMPLOYEES_VIEW_SALARY],
      '/dashboard/users': [PERMISSIONS.USERS_VIEW],
      '/dashboard/users/new': [PERMISSIONS.USERS_CREATE],
      '/dashboard/reports': [PERMISSIONS.REPORTS_VIEW],
      '/dashboard/settings': [PERMISSIONS.SETTINGS_SYSTEM]
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Allow access to routes without specific permissions

    return rbacUtils.hasAnyPermission(userRole, requiredPermissions);
  },

  // Filter navigation items based on user permissions
  filterNavigation: (userRole, navItems) => {
    return navItems.filter(item => {
      // Check if user can access the main item
      if (item.href && !rbacUtils.canAccessRoute(userRole, item.href)) {
        return false;
      }

      // Filter children if they exist
      if (item.children) {
        item.children = item.children.filter(child => 
          rbacUtils.canAccessRoute(userRole, child.href)
        );
        
        // Hide parent if no children are accessible
        return item.children.length > 0;
      }

      return true;
    });
  },

  // Check if user can perform action on specific resource
  canPerformAction: (userRole, action, resource, ownerId = null, userId = null) => {
    // Admin can do everything
    if (userRole === 'admin') return true;

    // Check basic permission
    if (!rbacUtils.hasPermission(userRole, `${resource}:${action}`)) {
      return false;
    }

    // Additional checks for ownership-based permissions
    if (resource === 'tasks' && action === 'edit') {
      // Staff can only edit their own tasks
      if (userRole === 'staff' && ownerId && userId && ownerId !== userId) {
        return false;
      }
    }

    if (resource === 'leads' && action === 'edit') {
      // Staff can only edit assigned leads
      if (userRole === 'staff' && ownerId && userId && ownerId !== userId) {
        return false;
      }
    }

    return true;
  },

  // Get filtered data based on user role and permissions
  filterDataByRole: (userRole, data, dataType, userId = null) => {
    if (userRole === 'admin') return data; // Admin sees everything

    switch (dataType) {
      case 'tasks':
        if (userRole === 'staff') {
          // Staff only sees their assigned tasks
          return data.filter(task => task.assignee_id === userId);
        }
        break;
      
      case 'leads':
        if (userRole === 'staff') {
          // Staff only sees their assigned leads
          return data.filter(lead => lead.assigned_to === userId);
        }
        break;
      
      case 'projects':
        if (userRole === 'staff') {
          // Staff only sees projects they're involved in
          return data.filter(project => 
            project.project_manager_id === userId || 
            (project.team_members && project.team_members.includes(userId.toString()))
          );
        }
        break;
      
      case 'salaries':
        if (userRole !== 'admin') {
          // Only admin can see all salaries
          return [];
        }
        break;
      
      default:
        return data;
    }

    return data;
  }
};

// Navigation items with permission requirements
export const getNavigationItems = (userRole) => {
  const allNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'Home', permission: PERMISSIONS.DASHBOARD_VIEW },
    {
      label: 'Leads',
      key: 'leads',
      icon: 'Target',
      permission: PERMISSIONS.LEADS_VIEW,
      children: [
        { label: 'All Leads', href: '/dashboard/leads', permission: PERMISSIONS.LEADS_VIEW },
        { label: 'Add Lead', href: '/dashboard/leads/add', permission: PERMISSIONS.LEADS_CREATE },
        { label: 'Pipeline', href: '/dashboard/leads/pipeline', permission: PERMISSIONS.LEADS_VIEW }
      ]
    },
    {
      label: 'Masters',
      key: 'masters',
      icon: 'LayoutList',
      permission: PERMISSIONS.MASTERS_VIEW,
      children: [
        { label: 'Masters Overview', href: '/dashboard/masters', permission: PERMISSIONS.MASTERS_VIEW },
        { label: 'Disciplines', href: '/dashboard/masters/disciplines', permission: PERMISSIONS.MASTERS_DISCIPLINES },
        { label: 'Employees', href: '/dashboard/masters/employees', permission: PERMISSIONS.EMPLOYEES_VIEW },
        { label: 'Activities', href: '/dashboard/masters/activities', permission: PERMISSIONS.MASTERS_ACTIVITIES },
        { label: 'Inquiries', href: '/dashboard/masters/inquiries', permission: PERMISSIONS.MASTERS_INQUIRIES },
        { label: 'Project Scopes', href: '/dashboard/masters/project-scopes', permission: PERMISSIONS.MASTERS_PROJECT_SCOPES },
        { label: 'Salaries', href: '/dashboard/masters/salaries', permission: PERMISSIONS.EMPLOYEES_VIEW_SALARY }
      ]
    },
    {
      label: 'Clients',
      key: 'clients',
      icon: 'Building2',
      permission: PERMISSIONS.CLIENTS_VIEW,
      children: [
        { label: 'All Clients', href: '/dashboard/clients', permission: PERMISSIONS.CLIENTS_VIEW },
        { label: 'Add Client', href: '/dashboard/clients/add', permission: PERMISSIONS.CLIENTS_CREATE },
        { label: 'Outreach Tracker', href: '/dashboard/clients/outreach', permission: PERMISSIONS.CLIENTS_VIEW }
      ]
    },
    {
      label: 'Projects',
      key: 'projects',
      icon: 'Briefcase',
      permission: PERMISSIONS.PROJECTS_VIEW,
      children: [
        { label: 'All Projects', href: '/dashboard/projects', permission: PERMISSIONS.PROJECTS_VIEW },
        { label: 'Add Project', href: '/dashboard/projects/add', permission: PERMISSIONS.PROJECTS_CREATE },
        { label: 'Task Manager', href: '/dashboard/projects/tasks', permission: PERMISSIONS.TASKS_VIEW },
        { label: 'Add Task', href: '/dashboard/projects/tasks/add', permission: PERMISSIONS.TASKS_CREATE }
      ]
    },
    {
      label: 'Activities',
      key: 'activities',
      icon: 'Calendar',
      permission: PERMISSIONS.TASKS_VIEW,
      children: [
        { label: 'My Tasks', href: '/dashboard/daily/my-tasks', permission: PERMISSIONS.TASKS_VIEW },
        { label: 'Calendar View', href: '/dashboard/daily/calendar', permission: PERMISSIONS.TASKS_VIEW }
      ]
    },
    {
      label: 'Users',
      key: 'users',
      icon: 'Users',
      permission: PERMISSIONS.USERS_VIEW,
      children: [
        { label: 'All Users', href: '/dashboard/users', permission: PERMISSIONS.USERS_VIEW },
        { label: 'Create User', href: '/dashboard/users/new', permission: PERMISSIONS.USERS_CREATE },
        { label: 'Roles', href: '/dashboard/users/roles', permission: PERMISSIONS.USERS_ASSIGN_ROLES }
      ]
    },
    {
      label: 'Reports',
      key: 'reports',
      icon: 'BarChart3',
      permission: PERMISSIONS.REPORTS_VIEW,
      children: [
        { label: 'Lead Reports', href: '/dashboard/reports/leads', permission: PERMISSIONS.REPORTS_VIEW },
        { label: 'Employee Reports', href: '/dashboard/reports/employees', permission: PERMISSIONS.REPORTS_EMPLOYEE },
        { label: 'Project Reports', href: '/dashboard/reports/projects', permission: PERMISSIONS.REPORTS_PROJECT }
      ]
    },
    {
      label: 'Logs',
      key: 'logs',
      icon: 'FileText',
      permission: PERMISSIONS.LOGS_VIEW,
      children: [
        { label: 'Activity Logs', href: '/dashboard/logs', permission: PERMISSIONS.LOGS_VIEW },
        { label: 'Analytics', href: '/dashboard/logs?tab=analytics', permission: PERMISSIONS.LOGS_ANALYTICS }
      ]
    },
    {
      label: 'Settings',
      key: 'settings',
      icon: 'Settings',
      permission: PERMISSIONS.SETTINGS_SYSTEM,
      children: [
        { label: 'System', href: '/dashboard/settings/system', permission: PERMISSIONS.SETTINGS_SYSTEM },
        { label: 'Security', href: '/dashboard/settings/security', permission: PERMISSIONS.SETTINGS_SECURITY }
      ]
    }
  ];

  // Filter navigation based on permissions
  return allNavItems.filter(item => {
    // Check if user has permission for main item
    if (item.permission && !rbacUtils.hasPermission(userRole, item.permission)) {
      return false;
    }

    // Filter children based on permissions
    if (item.children) {
      item.children = item.children.filter(child => 
        !child.permission || rbacUtils.hasPermission(userRole, child.permission)
      );
      
      // Hide parent if no accessible children
      return item.children.length > 0;
    }

    return true;
  });
};
