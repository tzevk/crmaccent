'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown, Home, Target, Users, LayoutList,
  Briefcase, Calendar, Building2, BarChart3, Settings
} from 'lucide-react'

// Define navigation items with icons and submenus
const navItems = [

  // Main navigation items
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  {
    label: 'Leads',
    key: 'leads',
    icon: Target,
    children: [
      { label: 'All Leads', href: '/dashboard/leads' },
      { label: 'Add Lead', href: '/dashboard/leads/add' },
      { label: 'Pipeline', href: '/dashboard/leads/pipeline' }
    ]
  },

  {
  label: 'Masters',
  key: 'masters',
  icon: LayoutList,
  children: [
    { label: 'Users Master', href: '/dashboard/masters/users' },
    { label: 'Project Master', href: '/dashboard/masters/projects' },
    { label: 'Leads Master', href: '/dashboard/masters/lead-sources' },
  ]
},

  {
    label: 'Companies',
    key: 'companies',
    icon: Building2,
    children: [
      { label: 'All Companies', href: '/dashboard/companies' },
      { label: 'Add Company', href: '/dashboard/companies/add' },
      { label: 'Outreach Tracker', href: '/dashboard/companies/outreach' }
    ]
  },
  {
    label: 'Projects',
    key: 'projects',
    icon: Briefcase,
    children: [
      { label: 'All Projects', href: '/dashboard/projects' },
      { label: 'Task Manager', href: '/dashboard/projects/tasks' },
      { label: 'Manhours Tracker', href: '/dashboard/projects/manhours' }
    ]
  },
  {
    label: 'Activities',
    key: 'activities',
    icon: Calendar,
    children: [
      { label: 'My Tasks', href: '/dashboard/daily/my-tasks' },
      { label: 'Calendar View', href: '/dashboard/daily/calendar' }
    ]
  },
  {
    label: 'Users',
    key: 'users',
    icon: Users,
    children: [
      { label: 'All Users', href: '/dashboard/users' },
      { label: 'Create User', href: '/dashboard/users/new' },
      { label: 'Roles', href: '/dashboard/users/roles' }
    ]
  },
  {
    label: 'Reports',
    key: 'reports',
    icon: BarChart3,
    children: [
      { label: 'Lead Reports', href: '/dashboard/reports/leads' },
      { label: 'Employee Reports', href: '/dashboard/reports/employees' }
    ]
  },
  {
    label: 'Settings',
    key: 'settings',
    icon: Settings,
    children: [
      { label: 'System', href: '/dashboard/settings/system' },
      { label: 'Security', href: '/dashboard/settings/security' }
    ]
  }
]

export default function Navbar() {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState(null)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: `2px solid #86288F` }}>
      <nav className="max-w-screen-2xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold tracking-tight" style={{ color: '#64126D' }}>ATS CRM</Link>

        {/* Navigation */}
        <ul className="flex gap-6 items-center">
          {navItems.map((item) =>
            item.children ? (
              <li key={item.key} className="relative group">
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === item.key ? null : item.key)
                  }
                  className="flex items-center gap-1 px-3 py-2 text-sm rounded-md transition-colors"
                  style={{
                    backgroundColor: activeDropdown === item.key ? '#86288F' : 'transparent',
                    color: activeDropdown === item.key ? '#FFFFFF' : '#64126D'
                  }}
                  onMouseEnter={(e) => {
                    if (activeDropdown !== item.key) {
                      e.target.style.backgroundColor = '#86288F';
                      e.target.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeDropdown !== item.key) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64126D';
                    }
                  }}
                >
                  <item.icon size={16} />
                  {item.label}
                  <ChevronDown size={14} className="ml-1 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                {activeDropdown === item.key && (
                  <ul className="absolute top-11 left-0 bg-white shadow-lg rounded-md w-56 z-50" style={{ border: `2px solid #86288F` }}>
                    {item.children.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block px-4 py-2 text-sm transition-colors rounded-md"
                          style={{
                            backgroundColor: pathname === sub.href ? '#86288F' : 'transparent',
                            color: pathname === sub.href ? '#FFFFFF' : '#64126D',
                            fontWeight: pathname === sub.href ? 'bold' : 'normal'
                          }}
                          onMouseEnter={(e) => {
                            if (pathname !== sub.href) {
                              e.target.style.backgroundColor = '#86288F';
                              e.target.style.color = '#FFFFFF';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (pathname !== sub.href) {
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
                    backgroundColor: pathname === item.href ? '#86288F' : 'transparent',
                    color: pathname === item.href ? '#FFFFFF' : '#64126D'
                  }}
                  onMouseEnter={(e) => {
                    if (pathname !== item.href) {
                      e.target.style.backgroundColor = '#86288F';
                      e.target.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pathname !== item.href) {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#64126D';
                    }
                  }}
                >
                  <item.icon size={16} />
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