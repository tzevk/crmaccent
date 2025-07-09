'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import projectsAPI from '../../../../utils/projectsAPI.js';
import { Briefcase, ArrowLeft, Plus, FileText, ClipboardList, Calendar, Users, Tag, Trash } from 'lucide-react';

export default function AddProject() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]); // Will hold companies data
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projectNumber, setProjectNumber] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    project_number: '',
    type: 'PROPOSAL',
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    value: '',
    description: '',
    status: 'planning',
    assigned_to: [],
    has_quotation: false,
    quotation_number: '',
    quotation_date: '',
    has_po: false,
    po_number: '',
    po_date: '',
    has_invoice: false,
    invoice_number: '',
    invoice_date: '',
    activities: [{ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' }]
  });

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchClients();
      fetchUsers();
      generateProjectNumber();
    } else {
      router.push('/');
    }
  }, [router]);

  const generateProjectNumber = async () => {
    try {
      // Generate a unique project number if the API endpoint isn't available
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = Date.now().toString().slice(-6);
      const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      // Format: PRJ-YY-MM-XXXXX
      const generatedNumber = `PRJ-${year}-${month}-${timestamp.slice(0, 4)}${randomDigits}`;
      
      setProjectNumber(generatedNumber);
      setFormData(prev => ({
        ...prev,
        project_number: generatedNumber
      }));
    } catch (error) {
      console.error('Failed to generate project number:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setClients(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => {
      const isAlreadyAssigned = prev.assigned_to.includes(userId);
      
      if (isAlreadyAssigned) {
        return {
          ...prev,
          assigned_to: prev.assigned_to.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          assigned_to: [...prev.assigned_to, userId]
        };
      }
    });
  };

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const activities = [...prev.activities];
      activities[index] = {
        ...activities[index],
        [name]: value
      };
      return {
        ...prev,
        activities
      };
    });
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { title: '', description: '', assigned_to: '', due_date: '', status: 'pending' }
      ]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => {
      const activities = [...prev.activities];
      activities.splice(index, 1);
      return {
        ...prev,
        activities
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await projectsAPI.create(formData);
      
      if (response.id) {
        setSuccess('Project created successfully!');
        setTimeout(() => {
          router.push(`/dashboard/projects/${response.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          </div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="project_number" className="block text-sm font-medium text-gray-700 mb-1">Project Number</label>
                    <input
                      id="project_number"
                      name="project_number"
                      type="text"
                      value={formData.project_number}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      readOnly
                    />
                    <p className="mt-1 text-xs text-gray-500">Auto-generated number</p>
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="PROPOSAL">Proposal</option>
                      <option value="ONGOING">Ongoing</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <select
                      id="client_id"
                      name="client_id"
                      value={formData.client_id}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select Company</option>
                      {clients.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">Project Value (₹)</label>
                    <input
                      id="value"
                      name="value"
                      type="number"
                      value={formData.value}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  ></textarea>
                </div>
              </div>
              
              {/* Team Assignment - Improved */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Team Assignment</h2>
                
                <div className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Select team members who will work on this project. Click on a user to add/remove from the team.</p>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-xs text-gray-500">Selected</span>
                    <div className="w-3 h-3 rounded-full bg-gray-300 ml-2"></div>
                    <span className="text-xs text-gray-500">Available</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {users.map(user => (
                    <div 
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.assigned_to.includes(user.id) 
                          ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                        formData.assigned_to.includes(user.id) ? 'bg-purple-600' : 'bg-gray-400'
                      }`}>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs">{user.role || 'Team Member'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {users.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500">No users available for assignment</p>
                    <p className="text-sm text-gray-400 mt-1">Add users to your team first</p>
                  </div>
                )}
                
                {formData.assigned_to.length > 0 && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm font-medium text-purple-800 mb-1">Selected Team Members ({formData.assigned_to.length})</p>
                    <p className="text-xs text-purple-600">
                      {users.filter(u => formData.assigned_to.includes(u.id)).map(u => u.name).join(', ')}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Document Information */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Document Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quotation */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={20} className="text-blue-600" />
                      <h3 className="font-medium">Quotation</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="has_quotation"
                          name="has_quotation"
                          type="checkbox"
                          checked={formData.has_quotation}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="has_quotation" className="ml-2 block text-sm text-gray-700">
                          Has Quotation
                        </label>
                      </div>
                      
                      {formData.has_quotation && (
                        <>
                          <div>
                            <label htmlFor="quotation_number" className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                            <input
                              id="quotation_number"
                              name="quotation_number"
                              type="text"
                              value={formData.quotation_number}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="quotation_date" className="block text-sm font-medium text-gray-700 mb-1">Quotation Date</label>
                            <input
                              id="quotation_date"
                              name="quotation_date"
                              type="date"
                              value={formData.quotation_date}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Purchase Order */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ClipboardList size={20} className="text-green-600" />
                      <h3 className="font-medium">Purchase Order</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="has_po"
                          name="has_po"
                          type="checkbox"
                          checked={formData.has_po}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="has_po" className="ml-2 block text-sm text-gray-700">
                          Has Purchase Order
                        </label>
                      </div>
                      
                      {formData.has_po && (
                        <>
                          <div>
                            <label htmlFor="po_number" className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                            <input
                              id="po_number"
                              name="po_number"
                              type="text"
                              value={formData.po_number}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="po_date" className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                            <input
                              id="po_date"
                              name="po_date"
                              type="date"
                              value={formData.po_date}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Invoice */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={20} className="text-purple-600" />
                      <h3 className="font-medium">Invoice</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="has_invoice"
                          name="has_invoice"
                          type="checkbox"
                          checked={formData.has_invoice}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="has_invoice" className="ml-2 block text-sm text-gray-700">
                          Has Invoice
                        </label>
                      </div>
                      
                      {formData.has_invoice && (
                        <>
                          <div>
                            <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                            <input
                              id="invoice_number"
                              name="invoice_number"
                              type="text"
                              value={formData.invoice_number}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                            <input
                              id="invoice_date"
                              name="invoice_date"
                              type="date"
                              value={formData.invoice_date}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Activities */}
              <div>
                <div className="flex items-center justify-between border-b pb-2 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Activities</h2>
                  <button 
                    type="button" 
                    onClick={addActivity}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Plus size={16} />
                    Add Activity
                  </button>
                </div>
                
                {formData.activities.map((activity, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">Activity #{index + 1}</h4>
                      {formData.activities.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeActivity(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor={`activity-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          id={`activity-title-${index}`}
                          name="title"
                          type="text"
                          value={activity.title}
                          onChange={(e) => handleActivityChange(index, e)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`activity-assigned-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                        <select
                          id={`activity-assigned-${index}`}
                          name="assigned_to"
                          value={activity.assigned_to}
                          onChange={(e) => handleActivityChange(index, e)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select User</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor={`activity-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <input
                          id={`activity-date-${index}`}
                          name="due_date"
                          type="date"
                          value={activity.due_date}
                          onChange={(e) => handleActivityChange(index, e)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor={`activity-status-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          id={`activity-status-${index}`}
                          name="status"
                          value={activity.status}
                          onChange={(e) => handleActivityChange(index, e)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label htmlFor={`activity-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          id={`activity-description-${index}`}
                          name="description"
                          rows="2"
                          value={activity.description}
                          onChange={(e) => handleActivityChange(index, e)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}