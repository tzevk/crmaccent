'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Sign in successful! Redirecting to dashboard...`);
        setIsRedirecting(true);
        console.log('User signed in:', data.user);
        console.log('Production mode - database authentication successful');
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authMode', 'production');
        
        // Redirect to dashboard with smooth transition
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } else {
        setError(data.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #64126D 0%, #86288F 100%)' }}>
      <div className="w-full max-w-md overflow-auto max-h-screen">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <svg
              className="w-8 h-8"
              style={{ color: '#64126D' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white"></h1>
          <p className="text-white opacity-90 mt-2">Sign in to your account</p>
        </div>

        {/* Demo Credentials Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🎯 Demo Mode - Test Credentials</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Admin:</strong> username: <code>admin</code> | password: <code>password123</code></div>
            <div><strong>Manager:</strong> username: <code>manager</code> | password: <code>password123</code></div>
            <div><strong>User:</strong> username: <code>testuser</code> | password: <code>password123</code></div>
          </div>
        </div>

        {/* Sign In Form */}
        <div className="bg-white shadow-xl rounded-2xl p-8 overflow-hidden">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6 overflow-hidden">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: '#64126D' }}>
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-200 bg-white overflow-hidden text-ellipsis"
                style={{ 
                  borderColor: '#86288F',
                  color: '#64126D'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #86288F'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Enter your username"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#64126D' }}>
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all duration-200 bg-white overflow-hidden"
                style={{ 
                  borderColor: '#86288F',
                  color: '#64126D'
                }}
                onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #86288F'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Enter your password"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center overflow-hidden"
              style={{ 
                backgroundColor: (isLoading || isRedirecting) ? '#86288F' : '#64126D',
                opacity: (isLoading || isRedirecting) ? 0.7 : 1
              }}
              onMouseEnter={(e) => !(isLoading || isRedirecting) && (e.target.style.backgroundColor = '#86288F')}
              onMouseLeave={(e) => !(isLoading || isRedirecting) && (e.target.style.backgroundColor = '#64126D')}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : isRedirecting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecting to dashboard...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white opacity-75">
            © 2025 Accent Techno Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
