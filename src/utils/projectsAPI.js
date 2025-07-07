// API utility functions for projects with RBAC support

import { rbacUtils, PERMISSIONS } from './rbac.js';

const API_BASE_URL = '/api/projects';

// Get current user session (mock implementation)
// In production, this would get user info from JWT token or session storage
const getCurrentUser = () => {
  // Mock user data - in real app, get from auth context or localStorage
  if (typeof window !== 'undefined') {
    const userRole = localStorage.getItem('userRole') || 'user';
    const userId = localStorage.getItem('userId') || '1';
    
    return {
      id: parseInt(userId),
      role: userRole,
      permissions: rbacUtils.getRolePermissions(userRole)
    };
  }
  
  return { id: 1, role: 'user', permissions: [] };
};

// Generic API request handler with auth headers
async function apiRequest(url, options = {}) {
  const user = getCurrentUser();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': user.role,
      'x-user-id': user.id.toString(),
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

// RBAC Helper Methods
export const rbacAPI = {
  // Check if current user can perform an action
  canPerformAction: (action, resource = 'projects') => {
    const user = getCurrentUser();
    const permission = `${resource.toUpperCase()}:${action.toUpperCase()}`;
    return rbacUtils.hasPermission(user.role, permission);
  },

  // Check if current user can view projects
  canViewProjects: () => rbacAPI.canPerformAction('view', 'projects'),
  
  // Check if current user can create projects
  canCreateProjects: () => rbacAPI.canPerformAction('create', 'projects'),
  
  // Check if current user can edit projects
  canEditProjects: () => rbacAPI.canPerformAction('edit', 'projects'),
  
  // Check if current user can delete projects
  canDeleteProjects: () => rbacAPI.canPerformAction('delete', 'projects'),
  
  // Check if current user can manage project budgets
  canManageBudgets: () => {
    const user = getCurrentUser();
    return rbacUtils.hasPermission(user.role, PERMISSIONS.PROJECTS_VIEW_BUDGET) ||
           rbacUtils.hasPermission(user.role, PERMISSIONS.PROJECTS_EDIT_BUDGET);
  },

  // Check if current user can assign team members
  canAssignTeam: () => {
    const user = getCurrentUser();
    return rbacUtils.hasPermission(user.role, PERMISSIONS.PROJECTS_ASSIGN_TEAM);
  },

  // Check if current user can view/edit tasks
  canViewTasks: () => rbacAPI.canPerformAction('view', 'tasks'),
  canCreateTasks: () => rbacAPI.canPerformAction('create', 'tasks'),
  canEditTasks: () => rbacAPI.canPerformAction('edit', 'tasks'),
  canDeleteTasks: () => rbacAPI.canPerformAction('delete', 'tasks'),

  // Get current user info
  getCurrentUser,

  // Filter UI elements based on permissions
  filterUIElements: (elements) => {
    return elements.filter(element => {
      if (element.requiredPermission) {
        const user = getCurrentUser();
        return rbacUtils.hasPermission(user.role, element.requiredPermission);
      }
      return true;
    });
  },

  // Get role-specific project actions
  getAvailableActions: (project = null) => {
    const user = getCurrentUser();
    const actions = [];

    if (rbacAPI.canViewProjects()) actions.push({ key: 'view', label: 'View Details', icon: '👁️' });
    if (rbacAPI.canEditProjects()) actions.push({ key: 'edit', label: 'Edit Project', icon: '✏️' });
    if (rbacAPI.canDeleteProjects()) actions.push({ key: 'delete', label: 'Delete', icon: '🗑️' });
    if (rbacAPI.canAssignTeam()) actions.push({ key: 'team', label: 'Manage Team', icon: '👥' });
    if (rbacAPI.canCreateTasks()) actions.push({ key: 'tasks', label: 'Add Tasks', icon: '➕' });

    // Filter actions based on project ownership if project is provided
    if (project && user.role === 'staff') {
      // Staff can only edit/delete their own projects
      return actions.filter(action => {
        if (['edit', 'delete'].includes(action.key)) {
          return project.project_manager_id === user.id;
        }
        return true;
      });
    }

    return actions;
  }
};

// Projects API functions
export const projectsAPI = {
  // RBAC methods
  rbac: rbacAPI,
  
  // Get all projects with RBAC filtering
  getAll: async (filters = {}) => {
    if (!rbacAPI.canViewProjects()) {
      throw new Error('Insufficient permissions to view projects');
    }

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

  // Get a single project by ID with RBAC check
  getById: async (id) => {
    if (!rbacAPI.canViewProjects()) {
      throw new Error('Insufficient permissions to view projects');
    }
    return apiRequest(`${API_BASE_URL}/${id}`);
  },

  // Create a new project with RBAC check
  create: async (projectData) => {
    if (!rbacAPI.canCreateProjects()) {
      throw new Error('Insufficient permissions to create projects');
    }
    return apiRequest(API_BASE_URL, {
      method: 'POST',
      body: projectData,
    });
  },

  // Update a project with RBAC check
  update: async (id, projectData) => {
    if (!rbacAPI.canEditProjects()) {
      throw new Error('Insufficient permissions to edit projects');
    }
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: projectData,
    });
  },

  // Delete a project with RBAC check
  delete: async (id) => {
    if (!rbacAPI.canDeleteProjects()) {
      throw new Error('Insufficient permissions to delete projects');
    }
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },

  // Get project statistics
  getStats: async () => {
    return apiRequest(`${API_BASE_URL}/stats`);
  },

  // Get all tasks across all projects with RBAC filtering
  getAllTasks: async (filters = {}) => {
    if (!rbacAPI.canViewTasks()) {
      throw new Error('Insufficient permissions to view tasks');
    }

    // ...existing code...
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

  // Get tasks for a specific project with RBAC check
  getTasks: async (projectId, filters = {}) => {
    if (!rbacAPI.canViewTasks()) {
      throw new Error('Insufficient permissions to view tasks');
    }

    // ...existing code...
    const queryParams = new URLSearchParams();
    queryParams.append('project_id', projectId);
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    return apiRequest(`${API_BASE_URL}/tasks?${queryParams.toString()}`);
  },

  // Create a new task with RBAC check
  createTask: async (taskData) => {
    if (!rbacAPI.canCreateTasks()) {
      throw new Error('Insufficient permissions to create tasks');
    }
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      body: taskData,
    });
  },

  // Update a task with RBAC check
  updateTask: async (taskId, taskData) => {
    if (!rbacAPI.canEditTasks()) {
      throw new Error('Insufficient permissions to edit tasks');
    }
    return apiRequest(`${API_BASE_URL}/tasks`, {
      method: 'PUT',
      body: { id: taskId, ...taskData },
    });
  },

  // Delete a task with RBAC check
  deleteTask: async (taskId) => {
    if (!rbacAPI.canDeleteTasks()) {
      throw new Error('Insufficient permissions to delete tasks');
    }
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
