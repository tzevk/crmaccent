'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, Settings, User, Database } from 'lucide-react';

export default function PermissionChecker() {
  const [permissionData, setPermissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/permissions', {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPermissionData(data.debug);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fixPermissions = async (action, params = {}) => {
    try {
      setFixing(true);
      const response = await fetch('/api/debug/fix-permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, ...params })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Success: ${result.message}`);
        // Refresh permission data
        await checkPermissions();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setFixing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission Check Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => fixPermissions('create_default_roles')}
                disabled={fixing}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {fixing ? 'Fixing...' : 'Setup Default Roles'}
              </button>
              
              <button
                onClick={() => fixPermissions('ensure_project_permissions')}
                disabled={fixing}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {fixing ? 'Fixing...' : 'Setup Project Permissions'}
              </button>
              
              <button
                onClick={() => fixPermissions('grant_admin_permissions', { userId: 1 })}
                disabled={fixing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {fixing ? 'Fixing...' : 'Grant Admin Access (User ID 1)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasProjectAccess = permissionData?.hasProjectViewPermission;
  const userPerms = permissionData?.userPermissions || [];
  const projectPerms = userPerms.filter(p => p.category === 'project');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-lg p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">Permission Checker</h1>
            </div>
          </div>

          <div className="p-6">
            {/* Current User Info */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Current User
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-gray-900">
                      {permissionData?.currentUser?.firstName} {permissionData?.currentUser?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{permissionData?.currentUser?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-gray-900">{permissionData?.currentUser?.roleDisplayName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Permission Status */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Access Status</h2>
              <div className={`flex items-center p-4 rounded-lg ${
                hasProjectAccess 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {hasProjectAccess ? (
                  <>
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-green-800">Access Granted</p>
                      <p className="text-green-600">You have permission to view projects</p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <p className="font-medium text-red-800">Insufficient Permissions</p>
                      <p className="text-red-600">You don't have permission to view projects</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Project Permissions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Permissions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['project:view', 'project:create', 'project:edit', 'project:delete', 'project:manage_team'].map(perm => {
                  const hasPermission = userPerms.some(p => p.name === perm);
                  return (
                    <div key={perm} className={`p-3 rounded-lg border ${
                      hasPermission 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center">
                        {hasPermission ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          hasPermission ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {perm.split(':')[1].replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permission Summary */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-blue-600">
                    {permissionData?.permissionSummary?.totalPermissions}
                  </p>
                  <p className="text-blue-800 font-medium">Total Permissions</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-green-600">
                    {permissionData?.permissionSummary?.userPermissionCount}
                  </p>
                  <p className="text-green-800 font-medium">Your Permissions</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-purple-600">
                    {permissionData?.allRoles?.length}
                  </p>
                  <p className="text-purple-800 font-medium">System Roles</p>
                </div>
              </div>
            </div>

            {/* Quick Fix Actions */}
            {!hasProjectAccess && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Quick Fix Actions
                </h2>
                <p className="text-yellow-700 mb-4">
                  If you should have access to projects, try these quick fixes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => fixPermissions('ensure_project_permissions')}
                    disabled={fixing}
                    className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {fixing ? 'Fixing...' : 'Setup Project Permissions'}
                  </button>
                  <button
                    onClick={() => fixPermissions('grant_admin_permissions', { 
                      userId: permissionData?.currentUser?.id 
                    })}
                    disabled={fixing}
                    className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {fixing ? 'Fixing...' : 'Grant Admin Access'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
