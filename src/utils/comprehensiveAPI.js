// Comprehensive API utilities for project management modules

const API_BASE = '';

// Activity Master API
export const activityMasterAPI = {
  // Get all activities
  getAll: async () => {
    const response = await fetch(`${API_BASE}/api/activity-master`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // Get activity by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/activity-master/${id}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  // Create new activity
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/activity-master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
  },

  // Update activity
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/activity-master/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update activity');
    return response.json();
  },

  // Delete activity
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/activity-master/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete activity');
    return response.json();
  }
};

// Disciplines API
export const disciplinesAPI = {
  // Get all disciplines
  getAll: async () => {
    const response = await fetch(`${API_BASE}/api/disciplines`);
    if (!response.ok) throw new Error('Failed to fetch disciplines');
    return response.json();
  },

  // Get discipline by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/disciplines/${id}`);
    if (!response.ok) throw new Error('Failed to fetch discipline');
    return response.json();
  },

  // Create new discipline
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/disciplines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create discipline');
    return response.json();
  },

  // Update discipline
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/disciplines/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update discipline');
    return response.json();
  },

  // Delete discipline
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/disciplines/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete discipline');
    return response.json();
  }
};

// Employees API
export const employeesAPI = {
  // Get all employees
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/api/employees${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch employees');
    return response.json();
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/employees/${id}`);
    if (!response.ok) throw new Error('Failed to fetch employee');
    return response.json();
  },

  // Create new employee (with auto credentials)
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create employee');
    return response.json();
  },

  // Update employee
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update employee');
    return response.json();
  },

  // Delete employee
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete employee');
    return response.json();
  },

  // Get employee statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE}/api/employees/stats`);
    if (!response.ok) throw new Error('Failed to fetch employee stats');
    return response.json();
  }
};

// Inquiries API
export const inquiriesAPI = {
  // Get all inquiries
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/api/inquiries${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch inquiries');
    return response.json();
  },

  // Get inquiry by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/inquiries/${id}`);
    if (!response.ok) throw new Error('Failed to fetch inquiry');
    return response.json();
  },

  // Create new inquiry
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create inquiry');
    return response.json();
  },

  // Update inquiry
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update inquiry');
    return response.json();
  },

  // Delete inquiry
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete inquiry');
    return response.json();
  },

  // Convert inquiry to project
  convertToProject: async (id, projectData) => {
    const response = await fetch(`${API_BASE}/api/inquiries/${id}/convert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
    if (!response.ok) throw new Error('Failed to convert inquiry');
    return response.json();
  }
};

// Project Scopes API
export const projectScopesAPI = {
  // Get scopes for a project
  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/scopes`);
    if (!response.ok) throw new Error('Failed to fetch project scopes');
    return response.json();
  },

  // Get scope by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-scopes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch scope');
    return response.json();
  },

  // Create new scope
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/project-scopes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create scope');
    return response.json();
  },

  // Update scope
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/project-scopes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update scope');
    return response.json();
  },

  // Delete scope
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-scopes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete scope');
    return response.json();
  }
};

// Project Activities API
export const projectActivitiesAPI = {
  // Get activities for a scope
  getByScope: async (scopeId) => {
    const response = await fetch(`${API_BASE}/api/project-scopes/${scopeId}/activities`);
    if (!response.ok) throw new Error('Failed to fetch scope activities');
    return response.json();
  },

  // Get activities for a project
  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/activities`);
    if (!response.ok) throw new Error('Failed to fetch project activities');
    return response.json();
  },

  // Get activity by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-activities/${id}`);
    if (!response.ok) throw new Error('Failed to fetch activity');
    return response.json();
  },

  // Create new activity
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/project-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
  },

  // Update activity
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/project-activities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update activity');
    return response.json();
  },

  // Delete activity
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-activities/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete activity');
    return response.json();
  }
};

// Project Team API
export const projectTeamAPI = {
  // Get team for a project
  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/team`);
    if (!response.ok) throw new Error('Failed to fetch project team');
    return response.json();
  },

  // Add team member
  addMember: async (data) => {
    const response = await fetch(`${API_BASE}/api/project-team`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add team member');
    return response.json();
  },

  // Update team member
  updateMember: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/project-team/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update team member');
    return response.json();
  },

  // Remove team member
  removeMember: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-team/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to remove team member');
    return response.json();
  }
};

// Project Manuals API
export const projectManualsAPI = {
  // Get manuals for a project
  getByProject: async (projectId) => {
    const response = await fetch(`${API_BASE}/api/projects/${projectId}/manuals`);
    if (!response.ok) throw new Error('Failed to fetch project manuals');
    return response.json();
  },

  // Upload manual
  upload: async (formData) => {
    const response = await fetch(`${API_BASE}/api/project-manuals/upload`, {
      method: 'POST',
      body: formData // FormData object with file and metadata
    });
    if (!response.ok) throw new Error('Failed to upload manual');
    return response.json();
  },

  // Update manual
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/project-manuals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update manual');
    return response.json();
  },

  // Delete manual
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/project-manuals/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete manual');
    return response.json();
  }
};

// Employee Salaries API
export const salariesAPI = {
  // Get salaries for an employee
  getByEmployee: async (employeeId) => {
    const response = await fetch(`${API_BASE}/api/employees/${employeeId}/salaries`);
    if (!response.ok) throw new Error('Failed to fetch employee salaries');
    return response.json();
  },

  // Get all salaries with filters
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/api/salaries${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch salaries');
    return response.json();
  },

  // Create new salary record
  create: async (data) => {
    const response = await fetch(`${API_BASE}/api/salaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create salary record');
    return response.json();
  },

  // Update salary
  update: async (id, data) => {
    const response = await fetch(`${API_BASE}/api/salaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update salary');
    return response.json();
  },

  // Delete salary record
  delete: async (id) => {
    const response = await fetch(`${API_BASE}/api/salaries/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete salary record');
    return response.json();
  }
};

// Export all APIs as a single object for convenience
export const comprehensiveAPI = {
  activityMaster: activityMasterAPI,
  disciplines: disciplinesAPI,
  employees: employeesAPI,
  inquiries: inquiriesAPI,
  projectScopes: projectScopesAPI,
  projectActivities: projectActivitiesAPI,
  projectTeam: projectTeamAPI,
  projectManuals: projectManualsAPI,
  salaries: salariesAPI
};
