'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './Navigation.css';

export default function Navigation({ user }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleDropdown = (moduleName) => {
    setActiveDropdown(activeDropdown === moduleName ? null : moduleName);
  };

  const handleNavigation = (href) => {
    router.push(href);
    setActiveDropdown(null);
  };

  const navigationItems = [
    {
      name: 'Leads',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      submenu: [
        { name: 'All Leads', href: '/leads' },
        { name: 'Add New Lead', href: '/leads/new' },
        { name: 'Lead Pipeline', href: '/leads/pipeline' },
        { name: 'Lead Sources', href: '/leads/sources' },
        { name: 'Lead Reports', href: '/leads/reports' }
      ]
    },
    {
      name: 'Projects',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      submenu: [
        { name: 'All Projects', href: '/projects' },
        { name: 'Create Project', href: '/projects/new' },
        { name: 'Project Timeline', href: '/projects/timeline' },
        { name: 'Project Resources', href: '/projects/resources' },
        { name: 'Project Reports', href: '/projects/reports' }
      ]
    },
    {
      name: 'Master',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      submenu: [
        { name: 'Master Data', href: '/master' },
        { name: 'Categories', href: '/master/categories' },
        { name: 'Locations', href: '/master/locations' },
        { name: 'Equipment', href: '/master/equipment' },
        { name: 'Suppliers', href: '/master/suppliers' }
      ]
    },
    {
      name: 'Calendar',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      submenu: [
        { name: 'Calendar View', href: '/calendar' },
        { name: 'Schedule Meeting', href: '/calendar/new' },
        { name: 'My Events', href: '/calendar/events' },
        { name: 'Team Schedule', href: '/calendar/team' },
        { name: 'Event Types', href: '/calendar/types' }
      ]
    },
    {
      name: 'Reports',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
        </svg>
      ),
      submenu: [
        { name: 'All Reports', href: '/reports' },
        { name: 'Sales Reports', href: '/reports/sales' },
        { name: 'Project Reports', href: '/reports/projects' },
        { name: 'Financial Reports', href: '/reports/financial' },
        { name: 'Custom Reports', href: '/reports/custom' }
      ]
    },
    {
      name: 'User',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      submenu: [
        { name: 'All Users', href: '/users' },
        { name: 'Add User', href: '/users/new' },
        { name: 'User Roles', href: '/users/roles' },
        { name: 'Permissions', href: '/users/permissions' },
        { name: 'User Activity', href: '/users/activity' }
      ]
    },
    {
      name: 'Employee',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 616 0zm6 3a2 2 0 11-4 0 2 2 0 614 0zM7 10a2 2 0 11-4 0 2 2 0 614 0z" />
        </svg>
      ),
      submenu: [
        { name: 'All Employees', href: '/employees' },
        { name: 'Add Employee', href: '/employees/new' },
        { name: 'Employee Profile', href: '/employees/profile' },
        { name: 'Attendance', href: '/employees/attendance' },
        { name: 'Payroll', href: '/employees/payroll' }
      ]
    },
    {
      name: 'Settings',
      icon: (
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
        </svg>
      ),
      submenu: [
        { name: 'General Settings', href: '/settings' },
        { name: 'System Config', href: '/settings/system' },
        { name: 'Email Templates', href: '/settings/email' },
        { name: 'Notifications', href: '/settings/notifications' },
        { name: 'Backup & Restore', href: '/settings/backup' }
      ]
    }
  ];

  return (
    <nav className="navigation">
      <div className="nav-container">
        {/* Desktop Navigation - With Dropdowns */}
        <div className="nav-menu">
          {navigationItems.map((item) => (
            <div key={item.name} className="nav-item-wrapper">
              <button
                className={`nav-item ${activeDropdown === item.name ? 'active' : ''}`}
                onClick={() => toggleDropdown(item.name)}
              >
                {item.icon}
                <span>{item.name}</span>
                <svg 
                  className={`dropdown-arrow ${activeDropdown === item.name ? 'rotated' : ''}`}
                  width="14" 
                  height="14" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === item.name && (
                <div className="dropdown-menu">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.name}
                      className="dropdown-item"
                      onClick={() => handleNavigation(subItem.href)}
                    >
                      {subItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-button">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}
