'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import components
import Navbar from '../../../components/navigation/Navbar';
import Breadcrumb from '../../../components/ui/Breadcrumb';

export default function AllUsers() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (!['admin', 'manager'].includes(parsedUser.role)) {
        router.push('/dashboard');
        return;
      }
      loadUsers();
    } else {
      router.push('/');
    }
  }, [router]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
        console.log('Users loaded:', data.users?.length || 0);
      } else {
        setError(data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Load users error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    router.push('/dashboard/users/new');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${userItem.first_name} ${userItem.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'User Management', href: '/dashboard/users' },
    { label: 'All Users' }
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar user={user} />
      
      <div className="min-h-screen p-4" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="mb-8">
            <div className="glass-card p-6 border-l-4 animate-fade-in" style={{
              borderLeftColor: '#64126D',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)',
              borderRadius: '16px'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#64126D' }}>
                    User Management
                  </h1>
                  <p className="text-gray-600">Manage user accounts and permissions</p>
                </div>
                <div className="flex space-x-3">
                  {['admin', 'manager'].includes(user.role) && (
                    <button
                      onClick={handleAddUser}
                      className="px-6 py-3 font-medium rounded-lg transition-all flex items-center hover-lift"
                      style={{
                        background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(100, 18, 109, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(100, 18, 109, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 16px rgba(100, 18, 109, 0.3)';
                      }}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add User
                    </button>
                  )}
                </div>
              </div>

              {/* Search and Filter */}
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search users by name, username, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.9)'
                      }}
                      onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                      onBlur={(e) => e.target.style.boxShadow = 'none'}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="user">User</option>
                  </select>

                  <button
                    onClick={loadUsers}
                    className="px-4 py-3 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Refresh users"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border-l-4 border-red-400 rounded-lg animate-fade-in" style={{
              background: 'rgba(254, 242, 242, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div className="glass-card rounded-lg overflow-hidden animate-fade-in" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)'
          }}>
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="spinner mr-3"></div>
                <span className="text-gray-600">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || roleFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Get started by creating a new user.'}
                </p>
                {['admin', 'manager'].includes(user.role) && !searchTerm && roleFilter === 'all' && (
                  <div className="mt-6">
                    <button
                      onClick={handleAddUser}
                      className="px-6 py-3 font-medium rounded-lg transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)',
                        color: 'white'
                      }}
                    >
                      Add your first user
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="px-6 py-4 border-b border-gray-200" style={{
                  background: 'rgba(248, 250, 252, 0.8)'
                }}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{filteredUsers.length}</span> of{' '}
                      <span className="font-medium">{users.length}</span> users
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Admin: {users.filter(u => u.role === 'admin').length}</span>
                      <span>Manager: {users.filter(u => u.role === 'manager').length}</span>
                      <span>User: {users.filter(u => u.role === 'user').length}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead style={{ background: 'rgba(248, 250, 252, 0.8)' }}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                                     style={{
                                       background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)'
                                     }}>
                                  {userItem.first_name.charAt(0)}{userItem.last_name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {userItem.first_name} {userItem.last_name}
                                </div>
                                <div className="text-sm text-gray-500">@{userItem.username}</div>
                                <div className="text-sm text-gray-500">{userItem.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(userItem.role)}`}>
                              {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(userItem.is_active)}`}>
                              {userItem.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(userItem.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-purple-600 hover:text-purple-900 transition-colors" title="View Details">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {['admin', 'manager'].includes(user.role) && (
                                <>
                                  <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Edit User">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button className="text-red-600 hover:text-red-900 transition-colors" title="Delete User">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Summary */}
          {!isLoading && filteredUsers.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
                {(searchTerm || roleFilter !== 'all') && ' (filtered)'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
