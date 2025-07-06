// API utility functions for leads

const API_BASE_URL = '/api/leads';

// Generic API request handler
async function apiRequest(url, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Leads API functions
export const leadsAPI = {
  // Get all leads with optional filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = queryParams.toString() 
      ? `${API_BASE_URL}?${queryParams.toString()}`
      : API_BASE_URL;

    return apiRequest(url);
  },

  // Get a single lead by ID
  getById: async (id) => {
    return apiRequest(`${API_BASE_URL}/${id}`);
  },

  // Create a new lead
  create: async (leadData) => {
    return apiRequest(API_BASE_URL, {
      method: 'POST',
      body: leadData,
    });
  },

  // Update a lead
  update: async (id, leadData) => {
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: leadData,
    });
  },

  // Delete a lead
  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get lead statistics
  getStats: async () => {
    return apiRequest(`${API_BASE_URL}/stats`);
  },

  // Get lead activities
  getActivities: async (leadId = null, limit = 50) => {
    const queryParams = new URLSearchParams({ limit: limit.toString() });
    if (leadId) {
      queryParams.append('lead_id', leadId);
    }
    
    return apiRequest(`${API_BASE_URL}/activities?${queryParams.toString()}`);
  },

  // Create a lead activity
  createActivity: async (activityData) => {
    return apiRequest(`${API_BASE_URL}/activities`, {
      method: 'POST',
      body: activityData,
    });
  },

  // Get lead sources
  getSources: async (activeOnly = true) => {
    const queryParams = new URLSearchParams({ 
      active_only: activeOnly.toString() 
    });
    
    return apiRequest(`${API_BASE_URL}/sources?${queryParams.toString()}`);
  },

  // Create a lead source
  createSource: async (sourceData) => {
    return apiRequest(`${API_BASE_URL}/sources`, {
      method: 'POST',
      body: sourceData,
    });
  },

  // Update a lead source
  updateSource: async (sourceData) => {
    return apiRequest(`${API_BASE_URL}/sources`, {
      method: 'PUT',
      body: sourceData,
    });
  },

  // Delete a lead source
  deleteSource: async (id) => {
    return apiRequest(`${API_BASE_URL}/sources?id=${id}`, {
      method: 'DELETE',
    });
  }
};

// Utility functions for form handling
export const leadUtils = {
  // Validate lead data before submission
  validateLead: (leadData) => {
    const errors = {};

    if (!leadData.name || leadData.name.trim() === '') {
      errors.name = 'Name is required';
    }

    if (leadData.email && !isValidEmail(leadData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (leadData.phone && !isValidPhone(leadData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (leadData.value && isNaN(parseFloat(leadData.value))) {
      errors.value = 'Value must be a valid number';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Format lead data for display
  formatLead: (lead) => {
    return {
      ...lead,
      value: parseFloat(lead.value || 0),
      created_at: new Date(lead.created_at).toLocaleDateString(),
      updated_at: new Date(lead.updated_at).toLocaleDateString(),
      last_contact: lead.last_contact 
        ? new Date(lead.last_contact).toLocaleDateString()
        : null,
      next_follow_up: lead.next_follow_up 
        ? new Date(lead.next_follow_up).toLocaleDateString()
        : null,
    };
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      hot: 'bg-red-100 text-red-800 border-red-200',
      warm: 'bg-orange-100 text-orange-800 border-orange-200',
      cold: 'bg-blue-100 text-blue-800 border-blue-200',
      qualified: 'bg-purple-100 text-purple-800 border-purple-200',
      converted: 'bg-green-100 text-green-800 border-green-200',
      lost: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors.cold;
  },

  // Get source icon
  getSourceIcon: (source) => {
    const icons = {
      website: '🌐',
      referral: '👥',
      cold_call: '📞',
      social_media: '📱',
      email_campaign: '📧',
      trade_show: '🏢',
      google_ads: '🔍',
      linkedin: '💼',
      other: '📝'
    };
    return icons[source] || icons.other;
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
};

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

export default leadsAPI;
