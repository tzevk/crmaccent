'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NavigationMinimal from '@/components/navigation/Navigation';
import '../convert-detail.css';

export default function EmployeeConvertDetail() {
  const router = useRouter();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    phone: '',
    position: ''
  });
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
      return;
    }

    if (id) {
      fetchEmployee();
    }
  }, [id, router]);

  const fetchEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${id}`);
      if (!response.ok) {
        throw new Error('Employee not found');
      }
      const data = await response.json();
      setEmployee(data);
      
      // Pre-populate form data
      setFormData({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: generatePassword(),
        role: 'user',
        department: data.department || '',
        phone: data.phone || '',
        position: data.position || ''
      });
    } catch (error) {
      console.error('Error fetching employee:', error);
      setError('Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGeneratePassword = () => {
    const newPassword = generatePassword();
    setFormData(prev => ({
      ...prev,
      password: newPassword
    }));
  };

  const handleConvert = async () => {
    if (converting) return;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setConverting(true);
      setError(null);

      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        position: formData.position,
        employee_id: employee.id
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to convert employee');
      }

      // Show success and redirect
      alert('Employee successfully converted to user account!');
      router.push('/employees/convert');

    } catch (error) {
      console.error('Error converting employee:', error);
      setError(`Failed to convert employee: ${error.message}`);
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <NavigationMinimal user={user} />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading employee...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="page-container">
        <NavigationMinimal user={user} />
        <div className="main-content">
          <div className="error-container">
            <div className="error-content">
              <div className="error-icon">⚠️</div>
              <div className="error-message">{error}</div>
              <button 
                onClick={() => router.push('/employees/convert')}
                className="btn btn-primary"
              >
                Back to Employee List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <NavigationMinimal user={user} />
      <div className="main-content">
        <div className="page-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={() => router.push('/employees/convert')}
                className="back-button"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Employee List
              </button>
              <div className="header-titles">
                <h1 className="page-title">Convert Employee to User</h1>
                <div className="employee-info">
                  {employee && (
                    <>
                      <span className="employee-name">{employee.firstName} {employee.lastName}</span>
                      <span className="employee-email">{employee.email}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-alert-content">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="convert-form-container">
          <div className="form-header">
            <h2>User Account Configuration</h2>
            <p>Configure all user account details and convert the employee</p>
          </div>

          <form className="convert-form" onSubmit={(e) => e.preventDefault()}>
            {/* Basic Information Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Basic Information
              </h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="form-control"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="form-control"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="form-control"
                    placeholder="Enter department"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="form-control"
                    placeholder="Enter position"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-control"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password Configuration
              </h3>
              
              <div className="password-section">
                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <div className="password-input-group">
                    <input
                      type="text"
                      id="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="form-control password-input"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="generate-btn"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generate
                    </button>
                  </div>
                </div>

                <div className="password-info">
                  <div className="info-card">
                    <div className="info-icon">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="info-content">
                      <h4>Password Requirements</h4>
                      <ul>
                        <li>Generated passwords are 12 characters long</li>
                        <li>Include uppercase, lowercase, and numbers</li>
                        <li>User will need to change on first login</li>
                        <li>Save securely - password cannot be recovered</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Role & Permissions
              </h3>
              
              <div className="role-options">
                <div 
                  className={`role-card ${formData.role === 'user' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('role', 'user')}
                >
                  <div className="role-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="role-content">
                    <h4>Standard User</h4>
                    <p>Basic access to CRM features</p>
                    <ul>
                      <li>View and manage leads</li>
                      <li>Access dashboard</li>
                      <li>Create proposals</li>
                      <li>View reports</li>
                    </ul>
                  </div>
                </div>

                <div 
                  className={`role-card ${formData.role === 'manager' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('role', 'manager')}
                >
                  <div className="role-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="role-content">
                    <h4>Manager</h4>
                    <p>Enhanced access with team management</p>
                    <ul>
                      <li>All standard user features</li>
                      <li>Manage team members</li>
                      <li>Advanced analytics</li>
                      <li>System configuration</li>
                    </ul>
                  </div>
                </div>

                <div 
                  className={`role-card ${formData.role === 'admin' ? 'selected' : ''}`}
                  onClick={() => handleInputChange('role', 'admin')}
                >
                  <div className="role-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="role-content">
                    <h4>Administrator</h4>
                    <p>Full system access and control</p>
                    <ul>
                      <li>All manager features</li>
                      <li>User management</li>
                      <li>System settings</li>
                      <li>Database access</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                onClick={handleConvert}
                className="btn btn-success convert-btn"
                disabled={converting || !formData.name || !formData.email || !formData.password}
              >
                {converting ? (
                  <>
                    <div className="btn-spinner"></div>
                    Converting...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Convert Employee to User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
