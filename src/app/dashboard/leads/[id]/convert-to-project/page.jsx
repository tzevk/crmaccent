'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save,
  AlertCircle,
  Loader2,
  Calendar,
  Users,
  FileText,
  Briefcase
} from 'lucide-react';

// Import components
import Navbar from '../../../../../components/navigation/Navbar.jsx';
// Import API utility
import { leadsAPI as leadAPI } from '../../../../../utils/leadsAPI.js';
import { projectsAPI } from '../../../../../utils/projectsAPI.js';

export default function ConvertToProjectPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params?.id; // Using optional chaining to avoid errors
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  
  // Project form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PROPOSAL', // Default type
    client_id: '',
    start_date: '',
    end_date: '',
    status: 'planning', // Default status
    value: '',
    assigned_to: '',
    team_members: [],
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLeadDetails();
      fetchUsers();
    } else {
      router.push('/');
    }
  }, [leadId, router]);

  const loadLeadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await leadAPI.getById(leadId);
      setLead(response);
      
      // Pre-populate project form with lead data
      setFormData({
        ...formData,
        name: `Project for ${response.company_name || response.contact_name || 'Lead'}`,
        description: response.requirement || '',
        client_id: response.company_id || '',
        value: response.estimated_value || 0,
        assigned_to: response.assigned_to || '',
      });
    } catch (error) {
      console.error('Error loading lead details:', error);
      setError('Failed to load lead details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Assume we have an API endpoint to fetch users
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTeamMembersChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
    setFormData({ ...formData, team_members: selectedOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.client_id) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Generate unique project number (you might have a different logic for this)
      const projectNumber = `PROJ-${Date.now().toString().slice(-6)}`;
      
      // Prepare project data
      const projectData = {
        ...formData,
        project_number: projectNumber,
        lead_id: leadId,
        created_by: user?.id,
      };
      
      // Create project
      const response = await projectsAPI.create(projectData);
      
      // Update lead status to 'converted'
      await leadAPI.update(leadId, { enquiry_status: 'converted' });
      
      // Show success message and redirect
      alert('Lead successfully converted to project!');
      router.push(`/dashboard/projects/${response.projectId}`);
    } catch (error) {
      console.error('Error converting lead to project:', error);
      setError('Failed to convert lead to project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error && !lead) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <Link
              href={`/dashboard/leads/${leadId}`}
              className="text-purple-600 hover:text-purple-800 underline mt-2 inline-block"
            >
              Return to Lead Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href={`/dashboard/leads/${leadId}`}
              className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Lead
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-purple-900">
            Convert Lead to Project
          </h1>
          <p className="text-gray-600 mt-2">
            Create a new project based on lead: <span className="font-medium">{lead?.contact_name} ({lead?.company_name})</span>
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>
            
            {/* Project Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="PROPOSAL">Proposal</option>
                <option value="ONGOING">Ongoing</option>
              </select>
            </div>
            
            {/* Project Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Client ID - Hidden, will be set from the lead */}
            <input
              type="hidden"
              name="client_id"
              value={formData.client_id}
            />
            
            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Value
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Assigned To (will be saved as project_manager_id in database) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Manager
              </label>
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Project Manager</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Team Members */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Members
              </label>
              <select
                name="team_members"
                multiple
                value={formData.team_members}
                onChange={handleTeamMembersChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                size="3"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple team members
              </p>
            </div>
            
            {/* Description */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter project description"
              ></textarea>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <Link
              href={`/dashboard/leads/${leadId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md mr-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-5 py-2 ${isSubmitting ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Create Project
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
