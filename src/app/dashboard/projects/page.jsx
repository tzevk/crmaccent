'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/navigation/Navbar.jsx';
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Target,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  Lock
} from 'lucide-react';

// Import API utility with RBAC support
import { projectsAPI } from '../../../utils/projectsAPI.js';
import { rbacUtils, PERMISSIONS } from '../../../utils/rbac.js';

export default function AllProjects() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [rbacError, setRbacError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalBudget: 0
  });

  // Get current user session for RBAC
  const getCurrentUser = () => {
    if (typeof window !== 'undefined') {
      // Set default auth data if not present
      if (!localStorage.getItem('authToken')) {
        localStorage.setItem('authToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userId', '1');
      }
      
      return {
        role: localStorage.getItem('userRole') || 'admin',
        id: localStorage.getItem('userId') || '1'
      };
    }
    return { role: 'admin', id: '1' };
  };

  useEffect(() => {
    // Check authentication and RBAC permissions
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Check if user has permission to view projects
    if (!rbacUtils.hasPermission(currentUser.role, PERMISSIONS.PROJECTS_VIEW)) {
      setRbacError('You do not have permission to view projects.');
      setIsLoading(false);
      return;
    }

    // Load projects and stats from API
    loadProjects();
    loadStats();
  }, [router, searchTerm, statusFilter, priorityFilter]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await projectsAPI.getAll(filters);
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Only load stats if user has permission
      if (user && rbacUtils.hasPermission(user.role, PERMISSIONS.DASHBOARD_STATS)) {
        const response = await projectsAPI.getStats();
        const projectStats = response.projectStats || {};
        
        setStats({
          total: projectStats.total_projects || 0,
          active: projectStats.active_projects || 0,
          completed: projectStats.completed_projects || 0,
          totalBudget: parseFloat(projectStats.total_budget || 0)
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    // Check if user has permission to delete projects
    if (!rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_DELETE)) {
      alert('You do not have permission to delete projects.');
      return;
    }

    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsAPI.delete(projectId);
        // Reload projects after deletion
        loadProjects();
        loadStats();
      } catch (error) {
        console.error('Error deleting project:', error);
        if (error.message.includes('Forbidden') || error.message.includes('permission')) {
          alert('Access denied: ' + error.message);
        } else {
          alert('Failed to delete project. Please try again.');
        }
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: '#F5F5F5'
      }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (rbacError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: '#F5F5F5'
      }}>
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">{rbacError}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Lock className="w-4 h-4 mr-2" />
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show RBAC error if user doesn't have permission
  if (rbacError) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
            <p className="text-red-600 mb-4">{rbacError}</p>
            <p className="text-sm text-red-500">
              Current role: <span className="font-mono">{user?.role}</span>
            </p>
            <p className="text-sm text-red-400 mt-2">
              Required permission: <span className="font-mono">{PERMISSIONS.PROJECTS_VIEW}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      backgroundColor: '#F5F5F5'
    }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8" style={{ color: '#64126D' }} />
                <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>All Projects</h1>
                {/* Role indicator */}
                <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                  {user?.role} view
                </span>
              </div>
              <p style={{ color: '#86288F' }}>Manage and track your project portfolio</p>
            </div>
            
            {/* Only show "New Project" button if user has permission */}
            {rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_CREATE) && (
              <Link
                href="/dashboard/projects/add"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Link>
            )}
            
            {/* Show locked indicator if user can't create projects */}
            {!rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_CREATE) && (
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-500 rounded-lg">
                <Lock className="w-5 h-5 mr-2" />
                Create Restricted
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-2xl font-bold" style={{ color: '#64126D' }}>{stats.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                <p className="text-2xl font-bold text-orange-600">
                  {projectsAPI.formatCurrency(stats.totalBudget)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Projects List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No projects match your current filters.'
                  : 'Get started by creating your first project.'
                }
              </p>
              <Link
                href="/dashboard/projects/add"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manager
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {projects.map((project) => {
                    const progress = projectsAPI.calculateProgress(project.total_tasks, project.completed_tasks);
                    const isOverdue = projectsAPI.isOverdue(project.end_date, project.status);
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center">
                              <span className="mr-2">{projectsAPI.getProjectIcon(project.status)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {project.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {project.total_tasks} tasks
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${projectsAPI.getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${projectsAPI.getPriorityColor(project.priority)}`}>
                            {projectsAPI.getPriorityIcon(project.priority)} {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-purple-600 h-2 rounded-full"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{progress}%</span>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_VIEW_BUDGET) 
                            ? projectsAPI.formatCurrency(project.budget)
                            : (
                              <span className="flex items-center text-gray-400">
                                <Lock className="w-3 h-3 mr-1" />
                                Hidden
                              </span>
                            )
                          }
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {project.manager_name
                            ? `${project.manager_name} ${project.manager_lastname || ''}`.trim()
                            : 'Unassigned'
                          }
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {project.end_date ? (
                              <>
                                {isOverdue && (
                                  <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                                )}
                                <span className={isOverdue ? 'text-red-600' : ''}>
                                  {new Date(project.end_date).toLocaleDateString()}
                                </span>
                              </>
                            ) : (
                              'Not set'
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {/* View - All roles can view */}
                            <Link
                              href={`/dashboard/projects/${project.id}`}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded"
                              title="View Project"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            
                            {/* Edit - Only if user has edit permission */}
                            {rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_EDIT) ? (
                              <Link
                                href={`/dashboard/projects/edit/${project.id}`}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Edit Project"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            ) : (
                              <span 
                                className="text-gray-400 p-1 rounded cursor-not-allowed"
                                title="Edit not permitted"
                              >
                                <Lock className="w-4 h-4" />
                              </span>
                            )}
                            
                            {/* Delete - Only if user has delete permission */}
                            {rbacUtils.hasPermission(user?.role, PERMISSIONS.PROJECTS_DELETE) ? (
                              <button
                                onClick={() => handleDeleteProject(project.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Delete Project"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span 
                                className="text-gray-400 p-1 rounded cursor-not-allowed"
                                title="Delete not permitted"
                              >
                                <Lock className="w-4 h-4" />
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}