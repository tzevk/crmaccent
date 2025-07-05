// Shared navigation configuration for the CRM dashboard
export const navigationItems = [
  {
    id: 'leads',
    title: 'Leads',
    icon: '👥',
    submenus: [
      { title: 'All Leads', href: '/dashboard/leads' },
      { title: 'New Lead', href: '/dashboard/leads/new' },
      { title: 'Lead Sources', href: '/dashboard/leads/sources' },
      { title: 'Lead Status', href: '/dashboard/leads/status' },
      { title: 'Lead Categories', href: '/dashboard/leads/categories' },
      { title: 'Lead Reports', href: '/dashboard/leads/reports' },
      { title: 'Import Leads', href: '/dashboard/leads/import' },
      { title: 'Export Leads', href: '/dashboard/leads/export' }
    ]
  },
  {
    id: 'projects',
    title: 'Projects',
    icon: '📁',
    submenus: [
      { title: 'All Projects', href: '/dashboard/projects' },
      { title: 'New Project', href: '/dashboard/projects/new' },
      { title: 'Project Templates', href: '/dashboard/projects/templates' },
      { title: 'Project Categories', href: '/dashboard/projects/categories' },
      { title: 'Project Status', href: '/dashboard/projects/status' },
      { title: 'Project Reports', href: '/dashboard/projects/reports' },
      { title: 'Project Timeline', href: '/dashboard/projects/timeline' },
      { title: 'Resource Allocation', href: '/dashboard/projects/resources' }
    ]
  },
  {
    id: 'users',
    title: 'User Management',
    icon: '👤',
    submenus: [
      { title: 'All Users', href: '/dashboard/users' },
      { title: 'Add User', href: '/dashboard/users/new' },
      { title: 'User Roles', href: '/dashboard/users/roles' },
      { title: 'Permissions', href: '/dashboard/users/permissions' },
      { title: 'User Groups', href: '/dashboard/users/groups' },
      { title: 'User Activity', href: '/dashboard/users/activity' },
      { title: 'User Reports', href: '/dashboard/users/reports' },
      { title: 'Account Settings', href: '/dashboard/users/settings' }
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
