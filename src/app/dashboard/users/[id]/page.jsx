'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ChevronLeft, Save, Trash2, CheckCircle2, XCircle } from 'lucide-react';

// Import components
import Navbar from '../../../components/navigation/Navbar';
import Breadcrumb from '../../../components/ui/Breadcrumb';

// Import navigation configuration
import { navigationItems, getCurrentPageFromPath, handleNavigation, getBreadcrumbItems } from '../../../config/navigation';

export default function UserDetail({ params }) {
  const router = useRouter();
  const userId = params.id;
  const [user, setUser] = useState(null); // Current logged-in user
  const [userData, setUserData] = useState(null); // User being viewed
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState('users/detail');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    is_active: true,
    department: '',
    job_title: ''
  });
  
  // List of departments (could be fetched from API)
  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Support',
    'Research & Development',
    'Executive'
  ];

  useEffect(() => {
    // Set current page based on pathname
    const pathname = window.location.pathname;
    const page = getCurrentPageFromPath(pathname);
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Check if user has permission to view other users
      if (!['admin', 'manager'].includes(parsedUser.role) && parsedUser.id !== parseInt(userId)) {
        router.push('/dashboard');
        return;
      }
      
      // Load user data
      loadUserData();
    } else {
      router.push('/');
    }
  }, [router, userId]);

  const loadUserData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserData(data.user);
        
        // Initialize form data
        setFormData({
          username: data.user.username || '',
          email: data.user.email || '',
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          role: data.user.role || 'user',
          is_active: data.user.is_active === 1 || data.user.is_active === true,
          department: data.user.department || '',
          job_title: data.user.job_title || ''
        });
      } else {
        setError(data.message || 'Failed to load user data');
      }
    } catch (error) {
      console.error('Load user error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('User updated successfully!');
        setUserData(data.user); // Update displayed user data
        setIsEditMode(false);
        
        // If updating the current user, update local storage
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser.id === parseInt(userId)) {
          const updatedUser = {
            ...currentUser,
            ...data.user
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } else {
        setError(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSuccess('User deleted successfully! Redirecting...');
        setIsRedirecting(true);
        
        // Redirect to users list after delay
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete user');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Delete user error:', error);
      setError('Network error. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard/users');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authMode');
    router.push('/');
  };

  const handleNavigationClick = (href, title) => {
    handleNavigation(router, href, setCurrentPage);
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Breadcrumb items - using shared configuration
  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/dashboard/users' },
    { label: isLoading ? 'User Details' : `${userData?.first_name || ''} ${userData?.last_name || ''}`, href: '#' }
  ];

  return (
    <>
      {/* Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        navigationItems={navigationItems}
        onNavigate={handleNavigationClick}
        currentPage={currentPage}
      />
      
      <div className="min-h-screen p-4" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="max-w-4xl mx-auto">
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
                  <div className="flex items-center">
                    <button
                      onClick={handleBack}
                      className="mr-4 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label="Go back"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-3xl font-bold mb-1" style={{ color: '#64126D' }}>
                      {isLoading ? (
                        'Loading User...'
                      ) : (
                        `${userData?.first_name || ''} ${userData?.last_name || ''}`
                      )}
                    </h1>
                  </div>
                  <p className="text-gray-600">
                    {isLoading ? 'Loading user details...' : 'User details and account management'}
                  </p>
                </div>
                
                {!isLoading && userData && (
                  <div className="flex space-x-3">
                    {isEditMode ? (
                      <>
                        <button
                          onClick={() => {
                            setIsEditMode(false);
                            // Reset form to current user data
                            setFormData({
                              username: userData.username || '',
                              email: userData.email || '',
                              first_name: userData.first_name || '',
                              last_name: userData.last_name || '',
                              role: userData.role || 'user',
                              is_active: userData.is_active === 1 || userData.is_active === true,
                              department: userData.department || '',
                              job_title: userData.job_title || ''
                            });
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={isSaving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-6 py-2 font-medium rounded-lg transition-all flex items-center"
                          style={{
                            background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)',
                            color: 'white',
                            boxShadow: '0 4px 16px rgba(100, 18, 109, 0.3)'
                          }}
                        >
                          {isSaving ? (
                            <>
                              <div className="spinner-small mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Only show edit/delete if admin/manager or own profile */}
                        {(['admin', 'manager'].includes(user.role) || user.id === parseInt(userId)) && (
                          <>
                            <button
                              onClick={() => setIsEditMode(true)}
                              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                              Edit Profile
                            </button>
                            
                            {/* Only admins can delete other users, any user can delete themselves */}
                            {(user.role === 'admin' || user.id === parseInt(userId)) && (
                              <button
                                onClick={() => setShowDeleteConfirmation(true)}
                                className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 border-l-4 border-red-400 rounded-lg animate-fade-in" style={{
              background: 'rgba(254, 242, 242, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 border-l-4 border-green-400 rounded-lg animate-fade-in" style={{
              background: 'rgba(240, 253, 244, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading ? (
            <div className="glass-card p-12 rounded-lg animate-fade-in flex items-center justify-center" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)'
            }}>
              <div className="spinner mr-3"></div>
              <span className="text-gray-600">Loading user details...</span>
            </div>
          ) : userData ? (
            <>
              {/* User Details */}
              <div className="glass-card rounded-lg overflow-hidden animate-fade-in" style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)'
              }}>
                {/* Basic Info Section */}
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-xl font-medium text-gray-800">Basic Information</h2>
                </div>
                <div className="p-6">
                  {isEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-6">
                        <div className="h-20 w-20 rounded-full flex items-center justify-center text-white font-semibold text-2xl"
                             style={{
                               background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)'
                             }}>
                          {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Full Name</h4>
                            <p className="text-lg font-medium text-gray-900">{userData.first_name} {userData.last_name}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Status</h4>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(userData.is_active === 1 || userData.is_active === true)}`}>
                              {userData.is_active === 1 || userData.is_active === true ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Role</h4>
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(userData.role)}`}>
                              {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Member Since</h4>
                            <p className="text-gray-900">{new Date(userData.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Account Information Section */}
                <div className="px-6 py-5 border-t border-b border-gray-200" style={{
                  background: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <h2 className="text-xl font-medium text-gray-800">Account Information</h2>
                </div>
                <div className="p-6">
                  {isEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                      </div>

                      {/* Only admins can change roles */}
                      {user.role === 'admin' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Role *
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                            style={{
                              background: 'rgba(255, 255, 255, 0.9)'
                            }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                          >
                            <option value="user">User - Basic access</option>
                            <option value="manager">Manager - Management features</option>
                            <option value="admin">Admin - Full system access</option>
                          </select>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                          Active Account
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Username</h4>
                        <p className="text-gray-900">@{userData.username}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="text-gray-900">{userData.email}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Last Login</h4>
                        <p className="text-gray-900">
                          {userData.last_login_at ? new Date(userData.last_login_at).toLocaleString() : 'Never logged in'}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                        <p className="text-gray-900">{new Date(userData.updated_at).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Professional Information Section */}
                <div className="px-6 py-5 border-t border-b border-gray-200" style={{
                  background: 'rgba(248, 250, 252, 0.5)'
                }}>
                  <h2 className="text-xl font-medium text-gray-800">Professional Information</h2>
                </div>
                <div className="p-6">
                  {isEditMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                        >
                          <option value="">-- Select Department --</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title
                        </label>
                        <input
                          type="text"
                          name="job_title"
                          value={formData.job_title}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                          style={{
                            background: 'rgba(255, 255, 255, 0.9)'
                          }}
                          onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                          onBlur={(e) => e.target.style.boxShadow = 'none'}
                          placeholder="Enter job title"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Department</h4>
                        <p className="text-gray-900">{userData.department || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Job Title</h4>
                        <p className="text-gray-900">{userData.job_title || 'Not specified'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card p-12 rounded-lg animate-fade-in text-center" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)'
            }}>
              <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
              <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or has been deleted.</p>
              <button 
                onClick={handleBack} 
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Back to Users
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete User Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this user account? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                onClick={() => setShowDeleteConfirmation(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="spinner-small mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
