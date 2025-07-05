'use client';

import { useState, useRef, useEffect } from 'react';
import { navStyles, buttonStyles, textStyles } from '../../styles/componentStyles';

export default function Navbar({ user, onLogout, navigationItems, onNavigate, currentPage }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (activeDropdown && dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown].contains(event.target)) {
        setActiveDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNavigation = (href, title) => {
    setActiveDropdown(null);
    onNavigate(href, title);
  };

  // Check if the current page belongs to a navigation item
  const isActiveNavItem = (item) => {
    if (!currentPage) return false;
    
    // Direct match for current page
    if (currentPage === item.id) return true;
    
    // Check if current page matches any submenu href
    return item.submenus?.some(submenu => {
      const submenuPath = submenu.href.replace('/dashboard/', '');
      return currentPage.includes(submenuPath) || currentPage === submenu.href;
    });
  };

  // Check if a submenu item is active
  const isActiveSubmenu = (submenu) => {
    if (!currentPage) return false;
    const submenuPath = submenu.href.replace('/dashboard/', '');
    return currentPage.includes(submenuPath) || currentPage === submenu.href;
  };

  return (
    <nav className={navStyles.navbar}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="flex items-center">
                <div className={navStyles.logo}>
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className={navStyles.logoText}
                >
                  CRM Accent
                </button>
              </div>
            </div>
            
            {/* Desktop Navigation Links with Dropdowns */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navigationItems.map((item) => (
                <div key={item.id} className="relative" ref={el => dropdownRefs.current[item.id] = el}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                      isActiveNavItem(item) 
                        ? 'text-[#64126D] bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm border border-purple-100' 
                        : 'text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                    }`}
                  >
                    <span className="mr-2 text-lg">{item.icon}</span>
                    {item.title}
                    <svg 
                      className={`ml-2 w-4 h-4 transition-all duration-300 ${
                        activeDropdown === item.id 
                          ? 'rotate-180 text-[#64126D]' 
                          : isActiveNavItem(item) 
                            ? 'text-[#64126D]' 
                            : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Desktop Dropdown Menu */}
                  {activeDropdown === item.id && (
                    <div className={navStyles.dropdown}>
                      <div className="py-2" role="menu">
                        {item.submenus.map((submenu, index) => (
                          <button
                            key={index}
                            onClick={() => handleNavigation(submenu.href, submenu.title)}
                            className={`block w-full text-left px-4 py-3 text-sm transition-all duration-200 transform hover:translate-x-1 ${
                              isActiveSubmenu(submenu)
                                ? 'text-[#64126D] bg-gradient-to-r from-purple-100 to-pink-100 font-medium'
                                : 'text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                            }`}
                            role="menuitem"
                          >
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                isActiveSubmenu(submenu)
                                  ? 'bg-gradient-to-r from-[#64126D] to-[#86288F]'
                                  : 'bg-gradient-to-r from-[#64126D] to-[#86288F] opacity-60'
                              }`}></div>
                              {submenu.title}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-gray-500 capitalize bg-gradient-to-r from-[#64126D] to-[#86288F] bg-clip-text text-transparent font-medium">{user.role}</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#64126D] to-[#86288F] flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white transform hover:scale-110 transition-all duration-200">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-105"
                title="Sign Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={navStyles.mobileNav}>
        {navigationItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => toggleDropdown(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg mx-2 ${
                isActiveNavItem(item)
                  ? 'text-[#64126D] bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm border border-purple-100'
                  : 'text-gray-700 hover:text-[#64126D] hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.title}
              </div>
              <svg 
                className={`w-5 h-5 transition-all duration-300 ${
                  activeDropdown === item.id 
                    ? 'rotate-180 text-[#64126D]' 
                    : isActiveNavItem(item) 
                      ? 'text-[#64126D]' 
                      : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Mobile Submenu */}
            {activeDropdown === item.id && (
              <div className={navStyles.mobileDropdown}>
                {item.submenus.map((submenu, index) => (
                  <button
                    key={index}
                    onClick={() => handleNavigation(submenu.href, submenu.title)}
                    className={`block w-full text-left px-6 py-3 text-sm transition-all duration-200 first:rounded-t-lg last:rounded-b-lg ${
                      isActiveSubmenu(submenu)
                        ? 'text-[#64126D] bg-white/70 font-medium'
                        : 'text-gray-700 hover:text-[#64126D] hover:bg-white/50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        isActiveSubmenu(submenu)
                          ? 'bg-gradient-to-r from-[#64126D] to-[#86288F]'
                          : 'bg-gradient-to-r from-[#64126D] to-[#86288F] opacity-60'
                      }`}></div>
                      {submenu.title}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
