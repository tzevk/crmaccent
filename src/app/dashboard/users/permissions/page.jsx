'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Check, 
  X, 
  Settings,
  Users,
  Target,
  BarChart3,
  Mail
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';

export default function PermissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // TODO: Load permissions from API
      setPermissions([
        {
          module: 'Lead Management',
          icon: Target,
          permissions: {
            'View Leads': { admin: true, manager: true, sales: true, viewer: true },
            'Create Leads': { admin: true, manager: true, sales: true, viewer: false },
            'Edit Leads': { admin: true, manager: true, sales: true, viewer: false },
            'Delete Leads': { admin: true, manager: true, sales: false, viewer: false },
            'Assign Leads': { admin: true, manager: true, sales: false, viewer: false }
          }
        },
        {
          module: 'User Management',
          icon: Users,
          permissions: {
            'View Users': { admin: true, manager: true, sales: false, viewer: false },
            'Create Users': { admin: true, manager: false, sales: false, viewer: false },
            'Edit Users': { admin: true, manager: false, sales: false, viewer: false },
            'Delete Users': { admin: true, manager: false, sales: false, viewer: false }
          }
        },
        {
          module: 'Reports',
          icon: BarChart3,
          permissions: {
            'View Reports': { admin: true, manager: true, sales: true, viewer: true },
            'Export Data': { admin: true, manager: true, sales: false, viewer: false },
            'Advanced Analytics': { admin: true, manager: true, sales: false, viewer: false }
          }
        },
        {
          module: 'Communications',
          icon: Mail,
          permissions: {
            'Send Emails': { admin: true, manager: true, sales: true, viewer: false },
            'Manage Templates': { admin: true, manager: true, sales: false, viewer: false },
            'View Campaign Stats': { admin: true, manager: true, sales: true, viewer: false }
          }
        },
        {
          module: 'System Settings',
          icon: Settings,
          permissions: {
            'System Configuration': { admin: true, manager: false, sales: false, viewer: false },
            'Database Settings': { admin: true, manager: false, sales: false, viewer: false },
            'Security Settings': { admin: true, manager: false, sales: false, viewer: false },
            'Integration Settings': { admin: true, manager: false, sales: false, viewer: false }
          }
        }
      ]);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  }, [router]);

  const roles = ['admin', 'manager', 'sales', 'viewer'];
  const roleLabels = {
    admin: 'Administrator',
    manager: 'Manager',
    sales: 'Sales Rep',
    viewer: 'Viewer'
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Permissions Management</h1>
          <p className="text-gray-600">Configure role-based permissions for system access</p>
        </div>

        {/* Permissions Table */}
        <div className="space-y-8">
          {permissions.map((module, moduleIndex) => {
            const ModuleIcon = module.icon;
            return (
              <div key={moduleIndex} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <ModuleIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{module.module}</h3>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Permission
                        </th>
                        {roles.map(role => (
                          <th key={role} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {roleLabels[role]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(module.permissions).map(([permission, rolePerms], permIndex) => (
                        <tr key={permIndex} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {permission}
                          </td>
                          {roles.map(role => (
                            <td key={role} className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center">
                                {rolePerms[role] ? (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4 text-green-600" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                    <X className="w-4 h-4 text-red-600" />
                                  </div>
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
