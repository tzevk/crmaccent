'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  X,
  Building, 
  User,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function LeadEditPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form field definitions based on database schema
  const formFields = {
    company_info: {
      title: 'Company Information',
      icon: Building,
      fields: [
        { key: 'company_name', label: 'Company Name', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['New', 'Existing', 'Renewal'] },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'enquiry_date', label: 'Enquiry Date', type: 'datetime-local' },
        { key: 'enquiry_type', label: 'Enquiry Type', type: 'select', options: ['Email', 'Phone', 'Website', 'Referral', 'Social Media', 'Other'] },
        { key: 'year', label: 'Year', type: 'number' }
      ]
    },
    contact_info: {
      title: 'Contact Information',
      icon: User,
      fields: [
        { key: 'contact_name', label: 'Contact Name', type: 'text' },
        { key: 'contact_email', label: 'Email', type: 'email' }
      ]
    },
    project_info: {
      title: 'Project Details',
      icon: Target,
      fields: [
        { key: 'enquiry_status', label: 'Enquiry Status', type: 'select', options: ['New', 'Working', 'Quoted', 'Won', 'Lost', 'Follow-up'] },
        { key: 'project_status', label: 'Project Status', type: 'select', options: ['Open', 'Active', 'On Hold', 'Closed', 'Cancelled'] },
        { key: 'project_description', label: 'Project Description', type: 'textarea', rows: 4 }
      ]
    },
    followup_info: {
      title: 'Follow-up Information',
      icon: Calendar,
      fields: [
        { key: 'followup1_date', label: 'Follow-up 1 Date', type: 'datetime-local' },
        { key: 'followup1_description', label: 'Follow-up 1 Description', type: 'textarea', rows: 2 },
        { key: 'followup2_date', label: 'Follow-up 2 Date', type: 'datetime-local' },
        { key: 'followup2_description', label: 'Follow-up 2 Description', type: 'textarea', rows: 2 },
        { key: 'followup3_date', label: 'Follow-up 3 Date', type: 'datetime-local' },
        { key: 'followup3_description', label: 'Follow-up 3 Description', type: 'textarea', rows: 2 }
      ]
    }
  };

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
      const leadData = data.lead || data;
      setLead(leadData);
      
      // Initialize form data with current lead values
      const initialFormData = {};
      Object.values(formFields).forEach(section => {
        section.fields.forEach(field => {
          if (leadData[field.key] !== undefined) {
            if (field.type === 'datetime-local' && leadData[field.key]) {
              // Convert database datetime to datetime-local format
              const date = new Date(leadData[field.key]);
              initialFormData[field.key] = date.toISOString().slice(0, 16);
            } else {
              initialFormData[field.key] = leadData[field.key] || '';
            }
          }
        });
      });
      setFormData(initialFormData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      // Convert datetime-local fields back to database format
      const submitData = { ...formData };
      Object.values(formFields).forEach(section => {
        section.fields.forEach(field => {
          if (field.type === 'datetime-local' && submitData[field.key]) {
            submitData[field.key] = new Date(submitData[field.key]).toISOString();
          }
        });
      });

      const response = await fetch(`/api/leads/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/leads/${params.id}`);
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {field.label}</option>
            {field.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            rows={field.rows || 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
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

  if (error && !lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
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

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/dashboard/leads/${params.id}`)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
                  <p className="text-sm text-gray-600">
                    {lead?.company_name} | Enquiry No: {lead?.enquiry_no} | ID: {lead?.id}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.push(`/dashboard/leads/${params.id}`)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-green-800">Lead updated successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="form-scrollable">
          <form onSubmit={handleSubmit} className="space-y-6">
          {Object.entries(formFields).map(([sectionKey, section]) => {
            const IconComponent = section.icon;
            return (
              <div key={sectionKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <IconComponent className="h-5 w-5 mr-2 text-blue-600" />
                    {section.title}
                  </h2>
                </div>
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {section.fields.map((field) => (
                      <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/leads/${params.id}`)}
                className="px-6 py-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
