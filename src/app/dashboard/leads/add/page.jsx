'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  X,
  User, 
  Building, 
  Mail, 
  Phone, 
  Calendar,
  MessageSquare,
  Hash,
  MapPin,
  FileText,
  Activity,
  Plus
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';
import QuickAddCompany from '../../../../components/leads/QuickAddCompany.jsx';
// Import API utilities
import leadsAPI from '../../../../utils/leadsAPI.js';

export default function AddLeadPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [showQuickAddCompany, setShowQuickAddCompany] = useState(false);
  const [formData, setFormData] = useState({
    sr_no: '', // Will be auto-generated
    enquiry_no: '', // Will be auto-generated
    year: new Date().getFullYear(),
    company_name: '',
    type: 'New',
    city: '',
    enquiry_date: new Date().toISOString().split('T')[0],
    enquiry_type: 'Email',
    contact_name: '',
    contact_email: '',
    project_description: '',
    enquiry_status: 'New',
    project_status: 'Open',
    followup1_date: '',
    followup1_description: '',
    followup2_date: '',
    followup2_description: '',
    followup3_date: '',
    followup3_description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCompanies();
      
      // Generate serial number and enquiry number
      const currentYear = new Date().getFullYear();
      const enquiryNo = leadsAPI.generateEnquiryNumber(currentYear);
      
      // Generate a random SR number between 1000-9999
      const srNo = Math.floor(1000 + Math.random() * 9000);
      
      // Update form data with generated numbers
      setFormData(prev => ({
        ...prev,
        sr_no: srNo,
        enquiry_no: enquiryNo,
        year: currentYear
      }));
      
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const response = await fetch('/api/companies');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle different response structures
      let companiesArray = [];
      if (data.companies && Array.isArray(data.companies)) {
        companiesArray = data.companies;
      } else if (Array.isArray(data)) {
        companiesArray = data;
      }
      
      setCompanies(companiesArray);
    } catch (error) {
      // Handle error silently in production
      setCompanies([]);
    } finally {
      setCompaniesLoading(false);
    }
  };

  const handleCompanyAdded = (newCompany) => {
    // Add new company to the list
    setCompanies(prev => [...prev, newCompany]);
    // Select the newly added company
    setFormData(prev => ({ ...prev, company_name: newCompany.name }));
    // Close the modal
    setShowQuickAddCompany(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Enquiry number validation removed as it's auto-generated

    if (!formData.company_name?.trim()) {
      newErrors.company_name = 'Company name is required';
    }

    if (!formData.contact_name?.trim()) {
      newErrors.contact_name = 'Contact name is required';
    }

    if (!formData.contact_email?.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
    }

    if (!formData.project_description?.trim()) {
      newErrors.project_description = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          created_by: user?.id
        })
      });

      if (response.ok) {
        router.push('/dashboard/leads');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create lead');
      }
    } catch (error) {
      // Show user-friendly error message without logging to console
      alert('Error creating lead: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }

    // Generate CSV export with the new schema fields
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Sr No,Enquiry No,Year,Company Name,Type,City,Enquiry Date,Enquiry Type,Contact Name,Contact Email,Project Description,Enquiry Status,Project Status\n" +
      filteredLeads.map(lead => 
        `"${lead.sr_no || ''}","${lead.enquiry_no || ''}","${lead.year || ''}","${lead.company_name || ''}","${lead.type || ''}","${lead.city || ''}","${lead.enquiry_date || ''}","${lead.enquiry_type || ''}","${lead.contact_name || ''}","${lead.contact_email || ''}","${lead.project_description || ''}","${lead.enquiry_status || ''}","${lead.project_status || ''}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/leads" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="text-gray-600" size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Lead</h1>
              <p className="text-gray-600">Create a new lead enquiry</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building className="text-purple-600" size={24} />
              Lead Information
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash size={16} className="inline mr-1" />
                  Serial Number (Auto-generated)
                </label>
                <input
                  type="text"
                  name="sr_no"
                  value={formData.sr_no}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically generated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash size={16} className="inline mr-1" />
                  Enquiry Number (Auto-generated)
                </label>
                <input
                  type="text"
                  name="enquiry_no"
                  value={formData.enquiry_no}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">Automatically generated</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter year"
                />
              </div>
            </div>

            {/* Company and Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Building size={16} className="inline mr-1" />
                    Company Name *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCompany(true)}
                    className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-sm"
                  >
                    <Plus size={14} />
                    Quick Add
                  </button>
                </div>
                <select
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  disabled={companiesLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.company_name ? 'border-red-500' : 'border-gray-300'} ${companiesLoading ? 'bg-gray-100' : ''}`}
                >
                  <option value="">
                    {companiesLoading 
                      ? 'Loading companies...' 
                      : `Select a company (${companies.length} available)`
                    }
                  </option>
                  {!companiesLoading && companies.map((company) => (
                    <option key={company.id || company.name} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
                {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity size={16} className="inline mr-1" />
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Existing">Existing</option>
                  <option value="Renewal">Renewal</option>
                </select>
              </div>
            </div>

            {/* Location and Date */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Enquiry Date
                </label>
                <input
                  type="date"
                  name="enquiry_date"
                  value={formData.enquiry_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  Enquiry Type
                </label>
                <select
                  name="enquiry_type"
                  value={formData.enquiry_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent \${errors.contact_name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter contact name"
                />
                {errors.contact_name && <p className="text-red-500 text-sm mt-1">{errors.contact_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent \${errors.contact_email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter contact email"
                />
                {errors.contact_email && <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>}
              </div>
            </div>

            {/* Project Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Project Description *
              </label>
              <textarea
                name="project_description"
                value={formData.project_description}
                onChange={handleInputChange}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent \${errors.project_description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe the project requirements..."
              />
              {errors.project_description && <p className="text-red-500 text-sm mt-1">{errors.project_description}</p>}
            </div>

            {/* Status Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity size={16} className="inline mr-1" />
                  Enquiry Status
                </label>
                <select
                  name="enquiry_status"
                  value={formData.enquiry_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="New">New</option>
                  <option value="Working">Working</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Follow-up">Follow-up</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity size={16} className="inline mr-1" />
                  Project Status
                </label>
                <select
                  name="project_status"
                  value={formData.project_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Open">Open</option>
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Closed">Closed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Follow-up Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Follow-up Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up 1 Date
                  </label>
                  <input
                    type="date"
                    name="followup1_date"
                    value={formData.followup1_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow-up 1 Description
                  </label>
                  <textarea
                    name="followup1_description"
                    value={formData.followup1_description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter follow-up details..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between rounded-b-lg">
            <Link 
              href="/dashboard/leads"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X size={16} />
              Cancel
            </Link>
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="spinner-small"></div>
              ) : (
                <Save size={16} />
              )}
              {isLoading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>

        {/* Quick Add Company Modal */}
        {showQuickAddCompany && (
          <QuickAddCompany 
            onCompanyAdded={handleCompanyAdded}
            onClose={() => setShowQuickAddCompany(false)}
          />
        )}
      </div>
    </div>
  );
}
