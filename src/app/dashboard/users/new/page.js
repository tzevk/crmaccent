'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import components
import Navbar from '../../../../components/navigation/Navbar';
import Breadcrumb from '../../../../components/ui/Breadcrumb';

// Import navigation configuration
import { navigationItems, getCurrentPageFromPath, handleNavigation, getBreadcrumbItems } from '../../../../config/navigation';

export default function AddUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [currentPage, setCurrentPage] = useState('users/new');

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
      
      // Check if user has permission to add users (admin or manager)
      if (!['admin', 'manager'].includes(parsedUser.role)) {
        router.push('/dashboard');
        return;
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const modeText = data.demo ? ' (Demo Mode)' : '';
        setSuccess(`User "${data.user.username}" created successfully!${modeText} Redirecting to user list...`);
        setIsRedirecting(true);
        
        console.log('User created:', data.user);
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          role: 'user',
          password: '',
          confirmPassword: ''
        });

        // Redirect to users list after delay
        setTimeout(() => {
          router.push('/dashboard/users');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
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
  const breadcrumbItems = getBreadcrumbItems(currentPage, navigationItems).map(item => ({
    label: item.title,
    href: item.href
  }));

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
                  <h1 className="text-3xl font-bold mb-2" style={{ color: '#64126D' }}>
                    Add New User
                  </h1>
                  <p className="text-gray-600">Create a new user account with role-based permissions</p>
                </div>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ← Back to Users
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="glass-card p-8 animate-fade-in" style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(100, 18, 109, 0.1)',
            borderRadius: '16px'
          }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 border-l-4 border-red-400 rounded-lg animate-fade-in" style={{
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

              {success && (
                <div className="p-4 border-l-4 border-green-400 rounded-lg animate-fade-in" style={{
                  background: 'rgba(240, 253, 244, 0.95)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{success}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
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
                    placeholder="Enter first name"
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
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Account Information */}
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
                    placeholder="Enter username"
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
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Role Selection */}
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
                  {user?.role === 'admin' && (
                    <option value="admin">Admin - Full system access</option>
                  )}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {user?.role !== 'admin' && 'Only admins can create other admin users'}
                </p>
              </div>

              {/* Password Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                    placeholder="Enter password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)'
                    }}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #64126D'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                    placeholder="Confirm password"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  disabled={isLoading || isRedirecting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isRedirecting}
                  className="px-8 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                  style={{
                    background: isLoading || isRedirecting 
                      ? 'linear-gradient(135deg, #86288F 0%, #64126D 100%)'
                      : 'linear-gradient(135deg, #64126D 0%, #86288F 100%)',
                    color: 'white',
                    boxShadow: '0 4px 16px rgba(100, 18, 109, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isRedirecting) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 25px rgba(100, 18, 109, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && !isRedirecting) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 16px rgba(100, 18, 109, 0.3)';
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner-small mr-3"></div>
                      Creating User...
                    </>
                  ) : isRedirecting ? (
                    <>
                      <div className="spinner-small mr-3"></div>
                      Redirecting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
