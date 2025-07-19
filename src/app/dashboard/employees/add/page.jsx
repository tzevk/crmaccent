'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar';
import { UserPlus, Save, ArrowLeft, User, Phone, Mail, Calendar, Building, Briefcase, MapPin, FileText, UserCheck, Key } from 'lucide-react';

export default function AddEmployeePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);
  
  // Active tab for multi-step form
  const [activeTab, setActiveTab] = useState('basic');
  
  // Create user account toggle
  const [createUserAccount, setCreateUserAccount] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    // Basic Info
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    profile_image: '',
    
    // Job Details
    department: '',
    designation: '',
    reporting_manager_id: '',
    join_date: new Date().toISOString().split('T')[0],
    employment_status: 'active',
    
    // Address
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    
    // User Account (optional)
    create_user_account: false,
    username: '',
    password: '',
    role: 'user',
    
    // System fields
    created_by: null
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(prev => ({
        ...prev,
        created_by: parsedUser.id
      }));
      
      // Fetch departments and designations
      fetchDepartments();
      fetchDesignations();
      fetchManagers();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/employees/departments');
      const data = await response.json();
      
      if (response.ok) {
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await fetch('/api/employees/designations');
      const data = await response.json();
      
      if (response.ok) {
        setDesignations(data.designations || []);
      }
    } catch (error) {
      console.error('Failed to fetch designations:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch('/api/employees?limit=100');
      const data = await response.json();
      
      if (response.ok) {
        setManagers(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch managers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'create_user_account') {
      setCreateUserAccount(checked);
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Auto-generate username if empty and name changes
    if ((name === 'first_name' || name === 'last_name') && !formData.username && formData.first_name) {
      const first = formData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const last = name === 'last_name' 
        ? value.toLowerCase().replace(/[^a-z0-9]/g, '')
        : formData.last_name.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      let newUsername = '';
      
      if (first && last) {
        newUsername = `${first}.${last}`;
      } else if (first) {
        newUsername = first;
      }
      
      if (newUsername) {
        setFormData(prev => ({ ...prev, username: newUsername }));
      }
    }
  };
  
  const validateForm = () => {
    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('First name, last name, and email are required');
      return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    // User account validation if creating one
    if (createUserAccount) {
      if (!formData.username || !formData.password) {
        setError('Username and password are required if creating a user account');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Employee added successfully!');
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          date_of_birth: '',
          gender: '',
          profile_image: '',
          department: '',
          designation: '',
          reporting_manager_id: '',
          join_date: new Date().toISOString().split('T')[0],
          employment_status: 'active',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          create_user_account: false,
          username: '',
          password: '',
          role: 'user',
          created_by: user.id
        });
        
        setCreateUserAccount(false);
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/dashboard/employees');
        }, 2000);
      } else {
        setError(data.message || 'Failed to add employee');
      }
    } catch (err) {
      setError('Error adding employee. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <UserPlus className="mr-2" /> Add New Employee
            </h1>
            <p className="text-gray-600">Create a new employee record</p>
          </div>
          
          <Link
            href="/dashboard/employees"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1" size={18} /> Back to Employees
          </Link>
        </div>
        
        {/* Error and success messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        {/* Form with tabs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'basic' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('basic')}
            >
              <User className="mr-2" size={16} /> Basic Information
            </button>
            
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'job' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('job')}
            >
              <Briefcase className="mr-2" size={16} /> Job Details
            </button>
            
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'address' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('address')}
            >
              <MapPin className="mr-2" size={16} /> Address
            </button>
            
            <button 
              className={`px-4 py-3 text-sm font-medium flex items-center ${activeTab === 'account' 
                ? 'text-blue-600 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('account')}
            >
              <Key className="mr-2" size={16} /> User Account
            </button>
          </div>
          
          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="mr-2" size={18} /> Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="text"
                    name="profile_image"
                    value={formData.profile_image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/profile.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a URL to an image. For a full image upload feature, please use the document upload option.
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('job')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next: Job Details
                  </button>
                </div>
              </div>
            )}
            
            {/* Job Details Tab */}
            {activeTab === 'job' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Briefcase className="mr-2" size={18} /> Employment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Designation/Job Title
                    </label>
                    <select
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Designation</option>
                      {designations.map((desig) => (
                        <option key={desig.id} value={desig.title}>
                          {desig.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reporting Manager
                    </label>
                    <select
                      name="reporting_manager_id"
                      value={formData.reporting_manager_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Manager</option>
                      {managers.map((manager) => (
                        <option key={manager.id} value={manager.id}>
                          {manager.first_name} {manager.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      name="join_date"
                      value={formData.join_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Status
                  </label>
                  <select
                    name="employment_status"
                    value={formData.employment_status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="on_leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                    <option value="resigned">Resigned</option>
                  </select>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('basic')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next: Address
                  </button>
                </div>
              </div>
            )}
            
            {/* Address Tab */}
            {activeTab === 'address' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <MapPin className="mr-2" size={18} /> Address Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Street address"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mumbai"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Maharashtra"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal/Zip Code
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="400001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="India"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('job')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next: User Account
                  </button>
                </div>
              </div>
            )}
            
            {/* User Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Key className="mr-2" size={18} /> User Account
                </h3>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="create_user_account"
                      checked={createUserAccount}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Create a user account for this employee
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    This will allow the employee to log into the system
                  </p>
                </div>
                
                {createUserAccount && (
                  <div className="border border-gray-200 rounded-md p-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          required={createUserAccount}
                          className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="johndoe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required={createUserAccount}
                          className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="••••••"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="user">Regular User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('address')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={16} /> Save Employee
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
