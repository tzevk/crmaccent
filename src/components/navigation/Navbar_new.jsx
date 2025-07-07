'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown, Home, Target, Users, LayoutList,
  Briefcase, Calendar, Building2, BarChart3, Settings
} from 'lucide-react'
import { getNavigationItems } from '../../utils/rbac.js'

// Mock user session - in production, get from auth context
const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    return {
      role: localStorage.getItem('userRole') || 'user',
      id: localStorage.getItem('userId') || '1'
    };
  }
  return { role: 'user', id: '1' };
};

const Navbar = () => {
  const [expandedItems, setExpandedItems] = useState({})
  const [user, setUser] = useState(null)
  const [navItems, setNavItems] = useState([])
  const pathname = usePathname()

  // Initialize user and navigation items
  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    const userNavItems = getNavigationItems(currentUser.role)
    setNavItems(userNavItems)
  }, [])

  // Icon mapping for navigation items
  const iconMap = {
    Home,
    Target,
    Users,
    LayoutList,
    Briefcase,
    Calendar,
    Building2,
    BarChart3,
    Settings
  }

  const toggleDropdown = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const isActiveLink = (href) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Get the icon component for a navigation item
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName]
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null
  }

  if (!user || navItems.length === 0) {
    return null // Don't render until user and nav items are loaded
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: `2px solid #86288F` }}>
      <nav className="max-w-screen-2xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight" style={{ color: '#64126D' }}>
          ATS CRM
        </Link>

        {/* User Role Indicator */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 capitalize">
            {user.role} User
          </span>
        </div>

        {/* Navigation */}
        <ul className="flex gap-6 items-center">
          {navItems.map((item) =>
            item.children ? (
              <li key={item.key} className="relative group">
                <button
                  onClick={() => toggleDropdown(item.key)}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors"
                  style={{
                    backgroundColor: expandedItems[item.key] ? '#86288F' : 'transparent',
                    color: expandedItems[item.key] ? '#FFFFFF' : '#64126D'
                  }}
                  onMouseEnter={(e) => {
                    if (!expandedItems[item.key]) {
                      e.target.style.backgroundColor = '#86288F';
                      e.target.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!expandedItems[item.key]) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64126D';
                    }
                  }}
                >
                  {getIcon(item.icon)}
                  {item.label}
                  <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {expandedItems[item.key] && (
                  <ul className="absolute top-11 left-0 bg-white shadow-lg rounded-md w-56 z-50" style={{ border: `2px solid #86288F` }}>
                    {item.children.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={() => setExpandedItems({})}
                          className="block px-4 py-2 text-sm transition-colors rounded-md"
                          style={{
                            backgroundColor: isActiveLink(sub.href) ? '#86288F' : 'transparent',
                            color: isActiveLink(sub.href) ? '#FFFFFF' : '#64126D',
                            fontWeight: isActiveLink(sub.href) ? 'bold' : 'normal'
                          }}
                          onMouseEnter={(e) => {
                            if (!isActiveLink(sub.href)) {
                              e.target.style.backgroundColor = '#86288F';
                              e.target.style.color = '#FFFFFF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActiveLink(sub.href)) {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#64126D';
                            }
                          }}
                        >
                          {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-all"
                  style={{
                    backgroundColor: isActiveLink(item.href) ? '#86288F' : 'transparent',
                    color: isActiveLink(item.href) ? '#FFFFFF' : '#64126D'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveLink(item.href)) {
                      e.target.style.backgroundColor = '#86288F';
                      e.target.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveLink(item.href)) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64126D';
                    }
                  }}
                >
                  {getIcon(item.icon)}
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
