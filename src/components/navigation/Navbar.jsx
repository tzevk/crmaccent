'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChevronDown, Home, Target, Users, LayoutList,
  Briefcase, Calendar, Building2, BarChart3, Settings, Send
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
      { label: 'Import Leads', href: '/dashboard/leads/import' }
    ]
  },

  {
    label: 'Companies',
    key: 'companies',
    icon: Building2,
    children: [
      { label: 'All Companies', href: '/dashboard/companies' },
      { label: 'Add Company', href: '/dashboard/companies/add' }
    ]
  },

  {
    label: 'Outreach',
    key: 'outreach',
    icon: Send,
    children: [
      { label: 'Outreach Tracker', href: '/dashboard/outreach' },
      { label: 'New Outreach', href: '/dashboard/outreach/new' }
    ]
  },

  {
    label: 'Masters',
    key: 'masters',
    icon: LayoutList,
    children: [
      { label: 'All Masters', href: '/dashboard/masters' },
      { label: 'Users Master', href: '/dashboard/masters/users' },
      { label: 'Projects Master', href: '/dashboard/masters/projects' },
      { label: 'Activities Master', href: '/dashboard/masters/activities' },
      { label: 'Disciplines Master', href: '/dashboard/masters/disciplines' },
      { label: 'Lead Sources Master', href: '/dashboard/masters/lead-sources' }
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
    <header className="sticky top-0 z-50 bg-white shadow-lg border-b-4 border-purple-600">
      <nav className="max-w-screen-2xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Enhanced Logo */}
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-3 text-2xl font-bold tracking-tight group"
        >
          <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg group-hover:from-purple-700 group-hover:to-purple-800 transition-all">
            <Target className="h-6 w-6 text-white" />
          </div>
          <div className="hidden sm:block">
          </div>
        </Link>

        {/* Enhanced Navigation */}
        <ul className="flex gap-2 items-center">
          {navItems.map((item) =>
            item.children ? (
              <li key={item.key} className="relative group">
                <button
                  onClick={() =>
                    setActiveDropdown(activeDropdown === item.key ? null : item.key)
                  }
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeDropdown === item.key
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                  <ChevronDown 
                    size={14} 
                    className={`ml-1 transition-transform duration-200 ${
                      activeDropdown === item.key ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {activeDropdown === item.key && (
                  <ul className="absolute top-12 left-0 bg-white shadow-xl rounded-xl w-64 z-50 border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-2 border-b border-purple-200">
                      <div className="text-sm font-semibold text-purple-800">{item.label}</div>
                    </div>
                    {item.children.map((sub) => (
                      <li key={sub.href}>
                        <Link
                          href={sub.href}
                          onClick={() => setActiveDropdown(null)}
                          className={`block px-4 py-3 text-sm transition-all duration-200 hover:bg-purple-50 ${
                            pathname === sub.href
                              ? 'bg-purple-100 text-purple-800 font-semibold border-r-4 border-purple-600'
                              : 'text-gray-700 hover:text-purple-700'
                          }`}
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
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
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