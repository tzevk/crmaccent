'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  User,
  Calendar,
  Clock,
  DollarSign,
  Target,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from 'lucide-react';

export default function LeadViewPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.id) {
      fetchLead(params.id);
    }
  }, [params?.id]);

  const fetchLead = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leads/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lead');
      }
      const data = await response.json();
      setLead(data.lead || data); // Handle both {lead: ...} and direct response
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/dashboard/leads/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const response = await fetch(`/api/leads/${params.id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          router.push('/dashboard/leads');
        } else {
          alert('Failed to delete lead');
        }
      } catch (error) {
        alert('Error deleting lead');
      }
    }
  };

  const handleConvertToProject = async () => {
    if (window.confirm('Convert this lead to a project?')) {
      try {
        const response = await fetch(`/api/leads/${params.id}/convert`, {
          method: 'POST',
        });
        if (response.ok) {
          alert('Lead converted to project successfully');
          router.push('/dashboard/projects');
        } else {
          alert('Failed to convert lead');
        }
      } catch (error) {
        alert('Error converting lead');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'working':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'follow-up':
        return 'bg-orange-100 text-orange-800';
      case 'won':
        return 'bg-emerald-100 text-emerald-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error Loading Lead</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Lead Not Found</h2>
          <p className="mt-2 text-gray-600">The requested lead could not be found.</p>
          <button
            onClick={() => router.push('/dashboard/leads')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard/leads')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{lead.company_name}</h1>
                  <p className="text-sm text-gray-600">Enquiry No: {lead.enquiry_no} | Lead ID: {lead.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.enquiry_status)}`}>
                  {lead.enquiry_status || 'New'}
                </span>
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={handleConvertToProject}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Convert to Project</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Company Information
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                    <p className="text-gray-900">{lead.company_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <p className="text-gray-900">{lead.type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <p className="text-gray-900">{lead.city || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Date</label>
                    <p className="text-gray-900">
                      {lead.enquiry_date ? new Date(lead.enquiry_date).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Type</label>
                    <p className="text-gray-900">{lead.enquiry_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <p className="text-gray-900">{lead.year || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Primary Contact
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                    <p className="text-gray-900">{lead.contact_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {lead.contact_email ? (
                      <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:text-blue-700 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {lead.contact_email}
                      </a>
                    ) : (
                      <p className="text-gray-900">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Project Details
                </h2>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.enquiry_status)}`}>
                      {lead.enquiry_status || 'New'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                    <p className="text-gray-900">{lead.project_status || 'Open'}</p>
                  </div>
                </div>
                {lead.project_description && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-900 whitespace-pre-wrap">{lead.project_description}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Follow-up Information */}
            {(lead.followup1_date || lead.followup2_date || lead.followup3_date) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Follow-up History
                  </h2>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {lead.followup1_date && (
                    <div className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Follow-up 1</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(lead.followup1_date).toLocaleDateString()}
                        </span>
                      </div>
                      {lead.followup1_description && (
                        <p className="mt-2 text-gray-700 text-sm">{lead.followup1_description}</p>
                      )}
                    </div>
                  )}
                  {lead.followup2_date && (
                    <div className="border-l-4 border-yellow-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Follow-up 2</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(lead.followup2_date).toLocaleDateString()}
                        </span>
                      </div>
                      {lead.followup2_description && (
                        <p className="mt-2 text-gray-700 text-sm">{lead.followup2_description}</p>
                      )}
                    </div>
                  )}
                  {lead.followup3_date && (
                    <div className="border-l-4 border-green-500 pl-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Follow-up 3</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(lead.followup3_date).toLocaleDateString()}
                        </span>
                      </div>
                      {lead.followup3_description && (
                        <p className="mt-2 text-gray-700 text-sm">{lead.followup3_description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Status */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Lead Status</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lead.enquiry_status)}`}>
                    {lead.enquiry_status || 'New'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Status</label>
                  <p className="text-gray-900">{lead.project_status || 'Open'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{lead.type || 'New'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <p className="text-gray-900">
                    {lead.created_by_name && lead.created_by_lastname 
                      ? `${lead.created_by_name} ${lead.created_by_lastname}` 
                      : 'Unassigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Timeline
                </h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p className="text-gray-900">
                    {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p className="text-gray-900">
                    {lead.updated_at ? new Date(lead.updated_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enquiry Date</label>
                  <p className="text-gray-900">
                    {lead.enquiry_date ? new Date(lead.enquiry_date).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
                {(lead.followup1_date || lead.followup2_date || lead.followup3_date) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
                    <p className="text-blue-600 font-medium">
                      {lead.followup3_date ? new Date(lead.followup3_date).toLocaleDateString() :
                       lead.followup2_date ? new Date(lead.followup2_date).toLocaleDateString() :
                       lead.followup1_date ? new Date(lead.followup1_date).toLocaleDateString() : 'None scheduled'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="px-6 py-4 space-y-3">
                <button
                  onClick={() => window.open(`mailto:${lead.contact_email}`, '_blank')}
                  disabled={!lead.contact_email}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>Send Email</span>
                </button>
                <button
                  onClick={() => router.push(`/dashboard/leads/${params.id}/activity`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Add Follow-up</span>
                </button>
                <button
                  onClick={() => router.push(`/dashboard/leads/${params.id}/schedule`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
