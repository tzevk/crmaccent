// API utility functions for projects

const API_BASE_URL = '/api/projects';

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

// Projects API functions
export const projectsAPI = {
  // Get all projects with optional filters
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

  // Get a single project by ID
  getById: async (id) => {
    return apiRequest(`${API_BASE_URL}/${id}`);
  },

  // Create a new project
  create: async (projectData) => {
    return apiRequest(API_BASE_URL, {
      method: 'POST',
      body: projectData,
    });
  },

  // Update a project
  update: async (id, projectData) => {
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  },

  // Delete a project
  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get project statistics
  getStats: async () => {
    return apiRequest(`${API_BASE_URL}/stats`);
  },

  // Get all tasks across all projects with optional filters
  getAllTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/tasks?${queryParams.toString()}`
      : `${API_BASE_URL}/tasks`;

    return apiRequest(url);
  },

  // Get tasks for a specific project
  getTasks: async (projectId, filters = {}) => {
    const queryParams = new URLSearchParams();
    queryParams.append('project_id', projectId);
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    return apiRequest(`${API_BASE_URL}/tasks?${queryParams.toString()}`);
  },

  // Create a new task
  createTask: async (taskData) => {
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: taskData,
    });
  },

  // Update a task
  updateTask: async (taskId, taskData) => {
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'PUT',
      body: { id: taskId, ...taskData },
    });
  },

  // Delete a task
  deleteTask: async (taskId) => {
    return apiRequest(`${API_BASE_URL}/tasks?id=${taskId}`, {
      method: 'DELETE',
    });
  },

  // Get a single task by ID
  getTaskById: async (taskId) => {
    return apiRequest(`${API_BASE_URL}/tasks?id=${taskId}`);
  },

  // Utility functions
  // Calculate project progress
  calculateProgress: (totalTasks, completedTasks) => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  },

  // Calculate days between dates
  daysBetween: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if project is overdue
  isOverdue: (endDate, status) => {
    if (status === 'completed' || status === 'cancelled') return false;
    const today = new Date();
    const end = new Date(endDate);
    return end < today;
  },

  // Get project icon based on status
  getProjectIcon: (status) => {
    const icons = {
      planning: '📋',
      active: '🚀',
      on_hold: '⏸️',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  },

  // Get status color for UI
  getStatusColor: (status) => {
    const colors = {
      planning: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || colors.planning;
  },

  // Get priority color for UI
  getPriorityColor: (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || colors.medium;
  },

  // Get priority icon
  getPriorityIcon: (priority) => {
    const icons = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      urgent: '🔴'
    };
    return icons[priority] || '🟡';
  }
};

// Tasks API functions
export const tasksAPI = {
  // Get all tasks with optional filters
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const url = queryParams.toString() 
      ? `${API_BASE_URL}/tasks?${queryParams.toString()}`
      : `${API_BASE_URL}/tasks`;

    return apiRequest(url);
  },

  // Create a new task
  create: async (taskData) => {
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: taskData,
    });
  },

  // Update a task
  update: async (taskData) => {
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'PUT',
      body: taskData,
    });
  },

  // Delete a task
  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/tasks?id=${id}`, {
      method: 'DELETE',
    });
  }
};

export default projectsAPI;
