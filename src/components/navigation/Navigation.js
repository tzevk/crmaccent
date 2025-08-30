'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './NavigationMinimal.css';

export default function NavigationMinimal({ user }) {
  const [activeModule, setActiveModule] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const handleNavigation = (href) => {
    router.push(href);
    setActiveModule(null);
  };

  const toggleModule = (moduleName) => {
    setActiveModule((curr) => (curr === moduleName ? null : moduleName));
  };

  // Update breadcrumb based on current path
  useEffect(() => {
    if (!pathname) return;
    const pathSegments = pathname.split('/').filter(Boolean);
    const crumbItems = [];

    if (pathSegments.length > 0) {
      crumbItems.push({ name: 'Home', href: '/dashboard' });

      pathSegments.forEach((segment, index) => {
        const name = segment.charAt(0).toUpperCase() + segment.slice(1);
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        crumbItems.push({ name, href });
      });
    }

    setBreadcrumb(crumbItems);
  }, [pathname]);

  const navigationModules = [
    {
      name: 'Dashboard',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5v14M16 5v14" />
        </svg>
      ),
      color: 'var(--primary)',
      items: [
        { name: 'Overview', href: '/dashboard' },
        { name: 'Analytics', href: '/dashboard/analytics' },
        { name: 'Reports', href: '/dashboard/reports' },
      ],
    },
    {
      name: 'Leads',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: '#3B82F6',
      badge: '12',
      items: [
        { name: 'All Leads', href: '/leads' },
        { name: 'Add Lead', href: '/leads/new' },
        { name: 'Pipeline', href: '/leads/pipeline' },
        { name: 'Convert', href: '/leads/convert' },
      ],
    },
    {
      name: 'Proposals',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: '#10B981',
      badge: '5',
      items: [
        { name: 'All Proposals', href: '/proposals' },
        { name: 'Create New', href: '/proposals/new' },
        { name: 'Templates', href: '/proposals/templates' },
        { name: 'Won/Lost', href: '/proposals/archive' },
      ],
    },
    {
      name: 'Projects',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: '#8B5CF6',
      items: [
        { name: 'Active Projects', href: '/projects' },
        { name: 'Create Project', href: '/projects/new' },
        { name: 'Timeline', href: '/projects/timeline' },
        { name: 'Resources', href: '/projects/resources' },
      ],
    },
    {
      name: 'Master',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      color: '#F59E0B',
      items: [
        { name: 'Lead Master', href: '/master/leads' },
        { name: 'Project Master', href: '/master/projects' },
        { name: 'Proposal Master', href: '/master/proposals' },
        { name: 'Company Master', href: '/companies' },
        { name: 'Employee Master', href: '/master/employees' },
        { name: 'User Master', href: '/master/users' },
        { name: 'Categories', href: '/master/categories' },
        { name: 'Settings', href: '/master/settings' },
        { name: 'System Config', href: '/master/config' },
      ],
    },
    {
      name: 'Employees',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: '#EF4444',
      items: [
        { name: 'All Employees', href: '/employees' },
        { name: 'Departments', href: '/employees/departments' },
      ],
    },
  ];

  return (
    <nav className="nav-minimal">
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand">
          <div className="brand-icon">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="brand-text">CRM Accent</span>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-container">
          {breadcrumb.map((crumb, index) => (
            <div key={index} className="breadcrumb-item">
              {index > 0 && <span className="breadcrumb-separator">/</span>}
              <button
                className={`breadcrumb-link ${index === breadcrumb.length - 1 ? 'active' : ''}`}
                onClick={() => handleNavigation(crumb.href)}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        {/* Module Navigation */}
        <div className="nav-modules">
          {navigationModules.map((module) => (
            <div key={module.name} className="nav-module">
              <button
                className={`module-btn ${activeModule === module.name ? 'active' : ''}`}
                onClick={() => toggleModule(module.name)}
                style={{ '--module-color': module.color }}
              >
                <span className="module-icon">{module.icon}</span>
                <span className="module-name">{module.name}</span>
                {module.badge && <span className="module-badge">{module.badge}</span>}
                <svg className="module-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {activeModule === module.name && (
                <div className="module-dropdown">
                  {module.items.map((item) => (
                    <button
                      key={item.name}
                      className="dropdown-item"
                      onClick={() => handleNavigation(item.href)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Section */}
        <div className="nav-user">
          <div className="user-info">
            <div className="user-avatar">
              {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || user?.username || 'User'}</span>
              <span className="user-role">Admin</span>
            </div>
          </div>

          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}