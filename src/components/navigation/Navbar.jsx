'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChevronDown, Home, Target, Users, LayoutList, Briefcase, 
  Calendar, Building2, BarChart3, Settings, Send, LogOut, 
  FileText, Bell, User, Menu, X, ChevronRight, Database
} from 'lucide-react';

export default function Navbar({ user, onLogout, navigationItems, onNavigate, currentPage }) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Define main navigation items with icons
  const mainNavItems = [
    { 
      label: 'Dashboard', 
      key: 'dashboard',
      href: '/dashboard', 
      icon: Home 
    },
    {
      label: 'Masters',
      key: 'masters',
      icon: Database,
      children: [
        { label: 'All Masters', href: '/dashboard/masters' },
        { label: 'Companies', href: '/dashboard/companies' },
        { label: 'Activities', href: '/dashboard/masters/activities' },
        { label: 'Projects', href: '/dashboard/masters/projects' },
        { label: 'Disciplines', href: '/dashboard/masters/disciplines' },
        { label: 'Lead Sources', href: '/dashboard/masters/lead-sources' }
      ]
    },
    {
      label: 'Projects',
      key: 'projects',
      icon: Briefcase,
      children: [
        { label: 'All Projects', href: '/dashboard/projects' },
        { label: 'Add Project', href: '/dashboard/projects/add' },
        { label: 'Task Manager', href: '/dashboard/projects/tasks' },
        { label: 'Manhours Tracker', href: '/dashboard/projects/manhours' }
      ]
    },
    {
      label: 'Leads',
      key: 'leads',
      icon: Target,
      children: [
        { label: 'All Leads', href: '/dashboard/leads' },
        { label: 'Add Lead', href: '/dashboard/leads/add' },
        { label: 'Import Leads', href: '/dashboard/leads/import' },
        { label: 'Outreach', href: '/dashboard/outreach' }
      ]
    },
    {
      label: 'Reports',
      key: 'reports',
      icon: BarChart3,
      children: [
        { label: 'Lead Reports', href: '/dashboard/reports/leads' },
        { label: 'Employee Reports', href: '/dashboard/reports/employees' },
        { label: 'Project Reports', href: '/dashboard/reports/projects' },
        { label: 'Financial Reports', href: '/dashboard/reports/financial' }
      ]
    },
    {
      label: 'Employees',
      key: 'employees',
      icon: Users,
      children: [
        { label: 'All Employees', href: '/dashboard/employees' },
        { label: 'Add Employee', href: '/dashboard/employees/add' },
        { label: 'Departments', href: '/dashboard/employees/departments' },
        { label: 'Designations', href: '/dashboard/employees/designations' }
      ]
    },
    {
      label: 'Users',
      key: 'users',
      icon: Users,
      children: [
        { label: 'All Users', href: '/dashboard/users' },
        { label: 'Create User', href: '/dashboard/users/new' },
        { label: 'Roles', href: '/dashboard/users/roles' },
        { label: 'Permissions', href: '/dashboard/users/permissions' }
      ]
    },
    {
      label: 'Settings',
      key: 'settings',
      icon: Settings,
      children: [
        { label: 'Company Profile', href: '/dashboard/settings/company' },
        { label: 'Email Templates', href: '/dashboard/settings/email-templates' },
        { label: 'System Settings', href: '/dashboard/settings/system' },
        { label: 'Security', href: '/dashboard/settings/security' }
      ]
    },
    {
      label: 'Logout',
      key: 'logout',
      icon: LogOut,
      action: onLogout
    }
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeDropdown && !event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);
  
  // Detect if the path is in a submenu
  const isPathInSubmenu = (item) => {
    if (!item.children) return false;
    return item.children.some(child => child.href && pathname.startsWith(child.href));
  };
  
  // Get the current active section based on the path
  const getCurrentActiveSection = () => {
    for (const item of mainNavItems) {
      if (item.href && item.href === pathname) return item.key;
      if (isPathInSubmenu(item)) return item.key;
    }
    return '';
  };
  
  const handleItemClick = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };
  
  const handleNavigationItem = (href) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="border-b-4" style={{ borderColor: '#64126D', boxShadow: '0 2px 4px rgba(100, 18, 109, 0.1)' }}></div>
      <nav className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 text-xl font-bold group mr-4"
              onClick={() => handleNavigationItem('/dashboard')}
            >
              <div className="p-2 rounded-lg transition-all" style={{ 
                background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)' 
              }}>
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:inline text-gray-800">CRM<span className="text-purple-700">Accent</span></span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-purple-700 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-2 flex-1 justify-start lg:justify-center px-2 gap-x-1">
            {mainNavItems.map((item) => (
              <div key={item.key} className="dropdown-container relative">
                {item.action ? (
                  // For action items like Logout
                  <button
                    onClick={item.action}
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-700 hover:text-purple-700"
                  >
                    <item.icon size={16} className="mr-2" />
                    <span>{item.label}</span>
                  </button>
                ) : item.children ? (
                  <div>
                    <button
                      onClick={() => handleItemClick(item.key)}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        activeDropdown === item.key || getCurrentActiveSection() === item.key
                          ? 'text-white shadow-sm' 
                          : 'text-gray-700 hover:text-purple-700 hover:bg-purple-50'
                      }`}
                      style={{
                        backgroundColor: activeDropdown === item.key || getCurrentActiveSection() === item.key 
                          ? '#64126D' 
                          : 'transparent'
                      }}
                    >
                      <item.icon size={16} className="mr-2" />
                      <span>{item.label}</span>
                      <ChevronDown 
                        size={14} 
                        className={`ml-2 transition-transform ${
                          activeDropdown === item.key ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {activeDropdown === item.key && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
                        <div className="py-2 px-3 bg-gray-50 border-b border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{item.label}</p>
                        </div>
                        <div className="py-2 max-h-96 overflow-y-auto">
                          {item.children.map((child) => (
                            <Link
                              key={child.href || `${item.key}-${child.label}`}
                              href={child.href || "#"}
                              onClick={() => child.href ? handleNavigationItem(child.href) : null}
                              className={`block px-4 py-2.5 text-sm ${
                                child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
                                  ? 'bg-purple-50 text-purple-700 font-medium border-l-4 border-purple-600'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href || "#"}
                    onClick={() => item.href ? handleNavigationItem(item.href) : null}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      item.href && pathname === item.href 
                        ? 'text-white' 
                        : 'text-gray-700 hover:text-purple-700'
                    }`}
                    style={{
                      backgroundColor: item.href && pathname === item.href ? '#64126D' : 'transparent'
                    }}
                  >
                    <item.icon size={16} className="mr-2" />
                    <span>{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
          
          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user && (
              <>
                {/* User Profile Dropdown */}
                <div className="dropdown-container relative">
                  <button
                    onClick={() => handleItemClick('profile')}
                    className="flex items-center space-x-2 px-2 py-1.5 rounded-full hover:bg-gray-100 transition-all"
                  >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)' }}
                    >
                      {user.first_name ? user.first_name.charAt(0) : ''}
                      {user.last_name ? user.last_name.charAt(0) : ''}
                    </div>
                    <ChevronDown size={14} className={activeDropdown === 'profile' ? 'rotate-180' : ''} />
                  </button>
                  
                  {activeDropdown === 'profile' && (
                    <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden border border-gray-200">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : user.role === 'manager' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => handleNavigationItem('/dashboard/profile')}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-700"
                        >
                          <div className="flex items-center">
                            <User size={14} className="mr-2" />
                            Profile Settings
                          </div>
                        </Link>
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            if (onLogout) onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <LogOut size={14} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 pb-3">
            <div className="pt-4 pb-4 space-y-2 sm:px-4">
              {mainNavItems.map((item) => (
                <div key={item.key} className="py-1">
                  {item.action ? (
                    // For action items like Logout in mobile view
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        item.action();
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-purple-700"
                    >
                      <item.icon size={18} className="mr-3" />
                      {item.label}
                    </button>
                  ) : item.children ? (
                    <div>
                      <button
                        onClick={() => handleItemClick(item.key)}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md ${
                          activeDropdown === item.key || getCurrentActiveSection() === item.key
                            ? 'bg-purple-100 text-purple-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <item.icon size={18} className="mr-3" />
                          {item.label}
                        </div>
                        <ChevronRight
                          size={16}
                          className={`transition-transform ${
                            activeDropdown === item.key ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                      
                      {activeDropdown === item.key && (
                        <div className="mt-1 ml-8 border-l-2 border-gray-200 pl-2 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href || `${item.key}-${child.label}`}
                              href={child.href || "#"}
                              onClick={() => child.href ? handleNavigationItem(child.href) : null}
                              className={`block px-4 py-2 text-sm ${
                                child.href && (pathname === child.href || pathname.startsWith(`${child.href}/`))
                                  ? 'text-purple-700 font-medium'
                                  : 'text-gray-700 hover:text-purple-700'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || "#"}
                      onClick={() => item.href ? handleNavigationItem(item.href) : null}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        item.href && pathname === item.href 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                      }`}
                    >
                      <item.icon size={18} className="mr-3" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile User Section */}
              {user && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3"
                        style={{ background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)' }}
                      >
                        {user.first_name ? user.first_name.charAt(0) : ''}
                        {user.last_name ? user.last_name.charAt(0) : ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => handleNavigationItem('/dashboard/profile')}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <User size={14} className="mr-2" />
                        Profile Settings
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut size={14} className="mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}