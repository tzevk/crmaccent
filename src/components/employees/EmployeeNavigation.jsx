'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Plus, Settings, FileText, Building, 
  Award, UserCheck, Download, BarChart3
} from 'lucide-react';

export default function EmployeeNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'All Employees',
      href: '/dashboard/employees',
      icon: Users,
      description: 'View and manage all employees'
    },
    {
      name: 'Add Employee',
      href: '/dashboard/employees/add',
      icon: Plus,
      description: 'Add a new employee'
    },
    {
      name: 'Departments',
      href: '/dashboard/employees/departments',
      icon: Building,
      description: 'Manage departments'
    },
    {
      name: 'Designations',
      href: '/dashboard/employees/designations',
      icon: Award,
      description: 'Manage job titles and designations'
    },
    {
      name: 'Reports',
      href: '/dashboard/employees/reports',
      icon: BarChart3,
      description: 'Employee reports and analytics'
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Management</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isActive
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <Icon 
                  size={24} 
                  className={`mb-2 ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                  }`} 
                />
                <span className={`font-medium text-sm ${
                  isActive ? 'text-blue-900' : 'text-gray-900'
                }`}>
                  {item.name}
                </span>
                <span className={`text-xs mt-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Quick Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">-</div>
            <div className="text-sm text-gray-500">Total Employees</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">-</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">-</div>
            <div className="text-sm text-gray-500">On Leave</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">-</div>
            <div className="text-sm text-gray-500">Departments</div>
          </div>
        </div>
      </div>
    </div>
  );
}
