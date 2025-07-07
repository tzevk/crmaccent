'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { 
  Briefcase, 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar, 
  DollarSign, 
  User, 
  Flag,
  Target,
  Clock,
  CheckSquare,
  Plus,
  Eye,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { projectsAPI } from '../../../../utils/projectsAPI.js';

export default function ProjectDetails() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;
  
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadProject();
      loadProjectTasks();
    } else {
      router.push('/');
    }
  }, [router, projectId]);

  const loadProject = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await projectsAPI.getById(projectId);
      const projectData = response.project;
      
      if (!projectData) {
        throw new Error('Project not found');
      }

      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      setError(error.message || 'Failed to load project details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectTasks = async () => {
    try {
      setIsLoadingTasks(true);
      const response = await projectsAPI.getTasks(projectId);
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Error loading project tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleDeleteProject = async () => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone and will also delete all associated tasks.')) {
      try {
        await projectsAPI.delete(projectId);
        router.push('/dashboard/projects?success=Project deleted successfully');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Project</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const progress = projectsAPI.calculateProgress(project.total_tasks, project.completed_tasks);
  const isOverdue = projectsAPI.isOverdue(project.end_date, project.status);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard/projects"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" style={{ color: '#64126D' }} />
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{projectsAPI.getProjectIcon(project.status)}</span>
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>{project.name}</h1>
                  <p style={{ color: '#86288F' }}>Project Details & Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href={`/dashboard/projects/edit/${projectId}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Project
              </Link>
              <button
                onClick={handleDeleteProject}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Project Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${projectsAPI.getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
                </span>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Priority</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${projectsAPI.getPriorityColor(project.priority)}`}>
                  {projectsAPI.getPriorityIcon(project.priority)} {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </span>
              </div>
              <Flag className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Progress</p>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{progress}%</span>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Budget</p>
                <p className="text-xl font-bold text-purple-600">
                  {projectsAPI.formatCurrency(project.budget)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Description</h2>
              <p className="text-gray-700 leading-relaxed">{project.description}</p>
            </div>

            {/* Project Tasks */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Project Tasks</h2>
                <Link
                  href={`/dashboard/projects/${projectId}/tasks/add`}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Link>
              </div>

              {isLoadingTasks ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No tasks found for this project</p>
                  <Link
                    href={`/dashboard/projects/${projectId}/tasks/add`}
                    className="inline-flex items-center mt-2 text-purple-600 hover:text-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create your first task
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          task.status === 'completed' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'on_hold' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-600">
                            Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.priority}
                        </span>
                        <Link
                          href={`/dashboard/projects/${projectId}/tasks/${task.id}`}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                  {tasks.length > 5 && (
                    <div className="text-center pt-3">
                      <Link
                        href={`/dashboard/projects/${projectId}/tasks`}
                        className="text-purple-600 hover:text-purple-700 text-sm"
                      >
                        View all {tasks.length} tasks →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Project Details Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Project Manager</p>
                    <p className="text-gray-900">
                      {project.manager_name 
                        ? `${project.manager_name} ${project.manager_lastname || ''}`.trim()
                        : 'Unassigned'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <div className="flex items-center">
                      {isOverdue && <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />}
                      <p className={`text-gray-900 ${isOverdue ? 'text-red-600' : ''}`}>
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {project.client_name && (
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="text-gray-900">{project.client_name}</p>
                    </div>
                  </div>
                )}

                {project.department && (
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="text-gray-900">{project.department}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Statistics */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-semibold">{project.total_tasks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Tasks</span>
                  <span className="font-semibold text-green-600">{project.completed_tasks || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-semibold text-blue-600">
                    {(project.total_tasks || 0) - (project.completed_tasks || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining</span>
                  <span className="font-semibold">
                    {project.end_date 
                      ? Math.max(0, Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/projects/${projectId}/tasks`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Manage Tasks
                </Link>
                <Link
                  href={`/dashboard/projects/${projectId}/tasks/add`}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Task
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
