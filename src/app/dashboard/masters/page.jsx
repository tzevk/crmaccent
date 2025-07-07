'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/navigation/Navbar.jsx';
import { 
  Settings, 
  BookOpen, 
  Users, 
  Activity,
  Building,
  FileText,
  DollarSign,
  ChevronRight,
  Plus,
  Eye
} from 'lucide-react';

export default function MastersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      router.push('/');
    }
  }, [router]);

  const masterModules = [
    {
      id: 'disciplines',
      name: 'Disciplines Master',
      description: 'Manage engineering disciplines with date ranges and categories',
      icon: BookOpen,
      path: '/dashboard/masters/disciplines',
      color: 'from-blue-500 to-blue-600',
      features: ['Add/Edit/Delete disciplines', 'Date range management', 'Category organization']
    },
    {
      id: 'employees',
      name: 'Employee Master',
      description: 'Manage employees with auto-generated user credentials',
      icon: Users,
      path: '/dashboard/masters/employees',
      color: 'from-green-500 to-green-600',
      features: ['Employee profiles', 'Auto user creation', 'Role management', 'Department assignment']
    },
    {
      id: 'activities',
      name: 'Activity Master',
      description: 'Predefined activities for project scopes and tasks',
      icon: Activity,
      path: '/dashboard/masters/activities',
      color: 'from-purple-500 to-purple-600',
      features: ['Predefined activities', 'Category grouping', 'Template management']
    },
    {
      id: 'inquiries',
      name: 'Inquiries',
      description: 'Manage client inquiries that flow into projects',
      icon: Building,
      path: '/dashboard/masters/inquiries',
      color: 'from-orange-500 to-orange-600',
      features: ['Client inquiries', 'Status tracking', 'Convert to projects']
    },
    {
      id: 'project-scopes',
      name: 'Project Scopes',
      description: 'Define project scopes and deliverables',
      icon: FileText,
      path: '/dashboard/masters/project-scopes',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Scope definition', 'Deliverable tracking', 'Budget allocation']
    },
    {
      id: 'salaries',
      name: 'Salary Management',
      description: 'Employee salary records - monthly and hourly rates',
      icon: DollarSign,
      path: '/dashboard/masters/salaries',
      color: 'from-emerald-500 to-emerald-600',
      features: ['Monthly salaries', 'Hourly rates', 'Bonus tracking', 'History management']
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" style={{ color: '#64126D' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>Master Data Management</h1>
          </div>
          <p style={{ color: '#86288F' }}>Comprehensive management of all master data modules for your project management system</p>
        </div>

        {/* Master Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterModules.map((module) => {
            const IconComponent = module.icon;
            
            return (
              <div key={module.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${module.color} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <Link
                    href={module.path}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Link>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-gray-600 mb-4">{module.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Key Features:</p>
                  <ul className="space-y-1">
                    {module.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={module.path}
                    className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors group"
                  >
                    <span className="text-sm font-medium">Manage {module.name}</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/masters/employees"
              className="flex items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-green-800 font-medium">Add Employee</span>
            </Link>
            
            <Link
              href="/dashboard/masters/disciplines"
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-blue-800 font-medium">Add Discipline</span>
            </Link>
            
            <Link
              href="/dashboard/masters/activities"
              className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all duration-200"
            >
              <Plus className="w-5 h-5 text-purple-600 mr-3" />
              <span className="text-purple-800 font-medium">Add Activity</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
