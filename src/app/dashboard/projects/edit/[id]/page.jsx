'use client';

import { use } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../../components/navigation/Navbar.jsx';
import { Briefcase, ArrowLeft, Save, X } from 'lucide-react';

export default function EditProjectPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const router = useRouter();
  const projectId = params.id;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    status: '',
    start_date: '',
    end_date: '',
    value: '',
    client_id: '',
    project_manager_id: '',
    lead_id: '',
    notes: ''
  });
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProjectData();
      fetchDropdownData();
    } else {
      router.push('/');
    }
  }, [router, projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch project data');
      }
      
      const data = await response.json();
      const project = data.project;
      
      setFormData({
        name: project.name || '',
        description: project.description || '',
        type: project.type || '',
        status: project.status || '',
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        value: project.value || '',
        client_id: project.client_id || '',
        project_manager_id: project.project_manager_id || '',
        lead_id: project.lead_id || '',
        notes: project.notes || ''
      });
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Failed to load project data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [clientsRes, usersRes, leadsRes] = await Promise.all([
        fetch('/api/companies'),
        fetch('/api/users'),
        fetch('/api/leads')
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.companies || []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updated_by: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      router.push(`/dashboard/projects/${projectId}`);
    } catch (error) {
      console.error('Error updating project:', error);
      setError('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/projects/${projectId}`}>
              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft size={20} />
                Back to Project
              </button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="text-purple-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
              <p className="text-gray-600">Update project information and details</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select project type</option>
                  <option value="PROPOSAL">Proposal</option>
                  <option value="ONGOING">Ongoing</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter project description"
              />
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="planning">Planning</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Relationships */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="project_manager_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Manager
                </label>
                <select
                  id="project_manager_id"
                  name="project_manager_id"
                  value={formData.project_manager_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select project manager</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="lead_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Related Lead
                </label>
                <select
                  id="lead_id"
                  name="lead_id"
                  value={formData.lead_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select related lead</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.company_name} - {lead.contact_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Financial */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Project Value (₹)
              </label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter project value"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Additional notes or comments"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <Link href={`/dashboard/projects/${projectId}`}>
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
