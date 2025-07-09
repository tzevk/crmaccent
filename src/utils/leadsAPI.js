// API utility functions for leads management with updated schema support

const API_BASE_URL = '/api/leads';
const COMPANIES_API_URL = '/api/companies';

// Constants for validation and dropdown options
const leadConstants = {
  TYPES: ['New', 'Existing', 'Renewal'],
  
  ENQUIRY_TYPES: [
    'Reference',
    'Exhibition',
    'Existing Company',
    'Enquiry',
    'Email',
    'Site visit',
    'Call',
    'Website',
    'Indiamart',
    'Justdial',
    'Social Media',
    'GEM',
    'Projects Today',
    'Tender Tiger',
    'Other'
  ],
  
  ENQUIRY_STATUSES: ['New', 'Working', 'Quoted', 'Won', 'Lost', 'Follow-up'],
  
  PROJECT_STATUSES: ['Open', 'Active', 'On Hold', 'Closed', 'Cancelled']
};

// Generic API request handler with improved error handling
async function apiRequest(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

// Lead API functions
export const leadsAPI = {
  // Generate enquiry number with better format
  generateEnquiryNumber(year = new Date().getFullYear()) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${year.toString().slice(-2)}${timestamp.toString().slice(-6)}${random.toString().padStart(3, '0')}`;
  },

  // Get all leads with optional filtering and pagination
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();
    
    // Add all supported query parameters from the new schema
    if (params.enquiry_status) queryParams.append('enquiry_status', params.enquiry_status);
    if (params.project_status) queryParams.append('project_status', params.project_status);
    if (params.company_name) queryParams.append('company_name', params.company_name);
    if (params.enquiry_type) queryParams.append('enquiry_type', params.enquiry_type);
    if (params.type) queryParams.append('type', params.type);
    if (params.city) queryParams.append('city', params.city);
    if (params.contact_name) queryParams.append('contact_name', params.contact_name);
    if (params.contact_email) queryParams.append('contact_email', params.contact_email);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.year) queryParams.append('year', params.year);
    if (params.followup_required) queryParams.append('followup_required', params.followup_required);

    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    return await apiRequest(url);
  },

  // Get lead by ID
  async getById(id) {
    try {
      const result = await apiRequest(`${API_BASE_URL}/${id}`);
      return result;
    } catch (error) {
      console.error(`Error fetching lead with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new lead
  async create(leadData) {
    return await apiRequest(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  },

  // Update lead
  async update(id, leadData) {
    return await apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  },

  // Delete lead
  async delete(id) {
    return await apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  async getLeads(params = {}) {
    return await this.getAll(params);
  },

  // Get lead statistics
  async getStats() {
    return await apiRequest(`${API_BASE_URL}/stats`);
  },

  // Get lead activities for a specific lead
  async getActivities(leadId) {
    try {
      return await apiRequest(`${API_BASE_URL}/${leadId}/activities`);
    } catch (error) {
      console.error(`Error fetching activities for lead ${leadId}:`, error);
      // Return empty activities array to avoid breaking UI
      return { activities: [] };
    }
  },

  // Add activity to lead
  async addActivity(leadId, activityData) {
    return await apiRequest(`${API_BASE_URL}/${leadId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  },

  // Update lead status
  async updateStatus(id, status) {
    return await apiRequest(`${API_BASE_URL}/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(typeof status === 'string' ? { status } : status),
    });
  },

  // Convert lead to project
  async convertToProject(id, projectData) {
    return await apiRequest(`${API_BASE_URL}/${id}/convert`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },

  // Add follow-up to lead
  async addFollowUp(id, followUpData) {
    return await apiRequest(`${API_BASE_URL}/${id}/followup`, {
      method: 'POST',
      body: JSON.stringify(followUpData),
    });
  },

  // Search leads by company name
  async searchByCompany(companyName) {
    return await apiRequest(`${API_BASE_URL}?company_name=${encodeURIComponent(companyName)}`);
  },

  // Get leads by enquiry status
  async getByEnquiryStatus(status) {
    return await apiRequest(`${API_BASE_URL}?enquiry_status=${encodeURIComponent(status)}`);
  },

  // Get leads by project status
  async getByProjectStatus(status) {
    return await apiRequest(`${API_BASE_URL}?project_status=${encodeURIComponent(status)}`);
  },

  // Get leads by year
  async getByYear(year) {
    return await apiRequest(`${API_BASE_URL}?year=${year}`);
  },

  // Get leads requiring follow-up
  async getFollowUpRequired() {
    return await apiRequest(`${API_BASE_URL}?followup_required=true`);
  },

  // Bulk update leads
  async bulkUpdate(leadIds, updateData) {
    return await apiRequest(`${API_BASE_URL}/bulk-update`, {
      method: 'PUT',
      body: JSON.stringify({ leadIds, updateData }),
    });
  },

  // Export leads
  async export(params = {}) {
    const queryParams = new URLSearchParams(params);
    return await apiRequest(`${API_BASE_URL}/export?${queryParams.toString()}`);
  },

  // Get all companies for dropdown
  async getCompanies() {
    return await apiRequest(COMPANIES_API_URL);
  },

  // Search companies
  async searchCompanies(searchTerm) {
    return await apiRequest(`${COMPANIES_API_URL}?search=${encodeURIComponent(searchTerm)}`);
  },

  // Get leads by date range
  async getByDateRange(startDate, endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return await apiRequest(`${API_BASE_URL}?${params.toString()}`);
  },

  // Get recent leads (last 30 days)
  async getRecent(limit = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return await apiRequest(`${API_BASE_URL}?start_date=${thirtyDaysAgo.toISOString().split('T')[0]}&limit=${limit}&sortBy=created_at&sortOrder=DESC`);
  },

  // Update multiple fields of a lead
  async updateFields(id, fields) {
    return await apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(fields),
    });
  },

  // Clone/duplicate a lead
  async clone(id, modifications = {}) {
    const original = await this.getById(id);
    const { id: _, created_at, updated_at, enquiry_no, ...leadData } = original.lead || original;
    
    // Generate new enquiry number
    const newEnquiryNo = this.generateEnquiryNumber();
    
    const newLead = {
      ...leadData,
      enquiry_no: newEnquiryNo,
      enquiry_status: 'New',
      project_status: 'Open',
      ...modifications
    };

    return await this.create(newLead);
  }
};


// API Health and Setup utilities
export const apiUtils = {
  // Check API health
  async checkHealth() {
    try {
      const [leadsResponse, companiesResponse, statsResponse] = await Promise.allSettled([
        apiRequest(`${API_BASE_URL}?limit=1`),
        apiRequest(COMPANIES_API_URL),
        apiRequest(`${API_BASE_URL}/stats`)
      ]);

      return {
        leads: leadsResponse.status === 'fulfilled',
        companies: companiesResponse.status === 'fulfilled',
        stats: statsResponse.status === 'fulfilled',
        overall: leadsResponse.status === 'fulfilled' && 
                companiesResponse.status === 'fulfilled' && 
                statsResponse.status === 'fulfilled'
      };
    } catch (error) {
      console.error('API Health Check Error:', error);
      return {
        leads: false,
        companies: false,
        stats: false,
        overall: false,
        error: error.message
      };
    }
  },

  // Setup database tables (calls setup endpoints)
  async setupDatabase() {
    try {
      const [companiesSetup, leadsSetup] = await Promise.allSettled([
        apiRequest('/api/setup-companies-db'),
        apiRequest('/api/setup-updated-leads-db')
      ]);

      return {
        companies: companiesSetup.status === 'fulfilled' ? companiesSetup.value : companiesSetup.reason,
        leads: leadsSetup.status === 'fulfilled' ? leadsSetup.value : leadsSetup.reason,
        success: companiesSetup.status === 'fulfilled' && leadsSetup.status === 'fulfilled'
      };
    } catch (error) {
      console.error('Database Setup Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validate API endpoints
  async validateEndpoints() {
    const endpoints = [
      { name: 'Get Leads', url: `${API_BASE_URL}?limit=1` },
      { name: 'Get Companies', url: COMPANIES_API_URL },
      { name: 'Get Stats', url: `${API_BASE_URL}/stats` }
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        await apiRequest(endpoint.url);
        results[endpoint.name] = { status: 'success', error: null };
      } catch (error) {
        results[endpoint.name] = { status: 'error', error: error.message };
      }
    }

    return results;
  }
};

// Export utility functions for dealing with lead UI elements
export const leadUtils = {
  // Get status color based on status
  getStatusColor(status, type = 'enquiry') {
    // Normalize the status string
    const normalizedStatus = typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Unknown';
    
    const colors = {
      // Enquiry statuses
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Working': 'bg-purple-100 text-purple-800 border-purple-200',
      'Quoted': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Won': 'bg-green-100 text-green-800 border-green-200',
      'Lost': 'bg-red-100 text-red-800 border-red-200',
      'Follow-up': 'bg-orange-100 text-orange-800 border-orange-200',
      'Converted': 'bg-teal-100 text-teal-800 border-teal-200',
      
      // Project statuses
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'Active': 'bg-green-100 text-green-800 border-green-200',
      'On Hold': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Closed': 'bg-gray-100 text-gray-800 border-gray-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    
    return colors[normalizedStatus] || 'bg-gray-100 text-gray-500 border-gray-200';
  },
  
  // Get source icon for UI display
  getSourceIcon(source) {
    switch (source?.toLowerCase()) {
      case 'email': return '📧';
      case 'phone': return '📞';
      case 'call': return '📱';
      case 'website': return '🌐';
      case 'reference': return '👥';
      case 'referral': return '👥';
      case 'social media': return '📱';
      case 'exhibition': return '🏢';
      case 'existing company': return '🏛️';
      case 'enquiry': return '❓';
      case 'site visit': return '🏭';
      case 'indiamart': return '🛒';
      case 'justdial': return '📞';
      case 'gem': return '💎';
      case 'projects today': return '📅';
      case 'tender tiger': return '🐯';
      default: return '📋';
    }
  },
  
  // Format currency values for display
  formatCurrency(amount) {
    if (!amount || isNaN(amount)) return 'Not specified';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },
  
  // Validate lead form data
  validateLead(formData) {
    const errors = {};
    let isValid = true;
    
    // Basic validations
    if (!formData.name?.trim()) {
      errors.name = 'Contact name is required';
      isValid = false;
    }
    
    if (!formData.company?.trim()) {
      errors.company = 'Company name is required';
      isValid = false;
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (formData.value && isNaN(parseFloat(formData.value))) {
      errors.value = 'Lead value must be a valid number';
      isValid = false;
    }
    
    return { isValid, errors };
  }
};

// Add 'Converted' status to the existing getStatusColor function

// Export enhanced leadsAPI as default
export default leadsAPI;
