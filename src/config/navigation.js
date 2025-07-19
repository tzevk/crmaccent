// Shared navigation configuration for the CRM dashboard
export const navigationItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: '🏠',
    href: '/dashboard',
  },
  {
    id: 'masters',
    title: 'Masters',
    icon: '�️',
    submenus: [
      { title: 'All Masters', href: '/dashboard/masters' },
      { title: 'Companies', href: '/dashboard/companies' },
      { title: 'Activities', href: '/dashboard/masters/activities' },
      { title: 'Projects', href: '/dashboard/masters/projects' },
      { title: 'Disciplines', href: '/dashboard/masters/disciplines' },
      { title: 'Lead Sources', href: '/dashboard/masters/lead-sources' }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: '📁',
    submenus: [
      { title: 'All Projects', href: '/dashboard/projects' },
      { title: 'Add Project', href: '/dashboard/projects/add' },
      { title: 'Task Manager', href: '/dashboard/projects/tasks' },
      { title: 'Manhours Tracker', href: '/dashboard/projects/manhours' },
      { title: 'Timeline View', href: '/dashboard/projects/timelines' }
    ]
  },
  {
    id: 'leads',
    title: 'Leads',
    icon: '👥',
    submenus: [
      { title: 'All Leads', href: '/dashboard/leads' },
      { title: 'Add Lead', href: '/dashboard/leads/add' },
      { title: 'Import Leads', href: '/dashboard/leads/import' },
      { title: 'Outreach', href: '/dashboard/outreach' }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    icon: '�',
    submenus: [
      { title: 'Lead Reports', href: '/dashboard/reports/leads' },
      { title: 'Employee Reports', href: '/dashboard/reports/employees' },
      { title: 'Project Reports', href: '/dashboard/reports/projects' },
      { title: 'Financial Reports', href: '/dashboard/reports/financial' }
    ]
  },
  {
    id: 'employees',
    title: 'Employees',
    icon: '👨‍💼',
    submenus: [
      { title: 'All Employees', href: '/dashboard/employees' },
      { title: 'Add Employee', href: '/dashboard/employees/add' },
      { title: 'Departments', href: '/dashboard/employees/departments' },
      { title: 'Designations', href: '/dashboard/employees/designations' }
    ]
  },
  {
    id: 'users',
    title: 'Users',
    icon: '👤',
    submenus: [
      { title: 'All Users', href: '/dashboard/users' },
      { title: 'Create User', href: '/dashboard/users/new' },
      { title: 'Roles', href: '/dashboard/users/roles' },
      { title: 'Permissions', href: '/dashboard/users/permissions' }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: '⚙️',
    submenus: [
      { title: 'Company Profile', href: '/dashboard/settings/company' },
      { title: 'Email Templates', href: '/dashboard/settings/email-templates' },
      { title: 'System Settings', href: '/dashboard/settings/system' },
      { title: 'Security', href: '/dashboard/settings/security' }
    ]
  }
];

// Helper function to get current page from pathname
export const getCurrentPageFromPath = (pathname) => {
  if (!pathname) return 'dashboard';
  
  // Remove leading slash and dashboard prefix
  const cleanPath = pathname.replace(/^\/dashboard\/?/, '') || 'dashboard';
  
  // Return the clean path for page identification
  return cleanPath === '' ? 'dashboard' : cleanPath;
};

// Helper function to get breadcrumb items from current page
export const getBreadcrumbItems = (currentPage, navigationItems) => {
  if (!currentPage || currentPage === 'dashboard') {
    return [{ title: 'Dashboard', href: '/dashboard' }];
  }

  const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];
  
  // Find the navigation item and submenu that matches the current page
  for (const navItem of navigationItems) {
    const matchingSubmenu = navItem.submenus?.find(submenu => {
      const submenuPath = submenu.href.replace('/dashboard/', '');
      return currentPage.includes(submenuPath) || currentPage === submenu.href;
    });
    
    if (matchingSubmenu) {
      breadcrumbs.push({ 
        title: navItem.title, 
        href: navItem.submenus[0]?.href || '#' 
      });
      breadcrumbs.push({ 
        title: matchingSubmenu.title, 
        href: matchingSubmenu.href 
      });
      break;
    }
  }
  
  return breadcrumbs;
};

// Helper function to handle navigation with router
export const handleNavigation = (router, href, setCurrentPage) => {
  if (href.startsWith('/dashboard')) {
    // Update current page state
    const page = getCurrentPageFromPath(href);
    setCurrentPage?.(page);
    
    // Navigate to the page
    router.push(href);
  }
};
