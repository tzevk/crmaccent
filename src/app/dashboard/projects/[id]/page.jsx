'use client';
import { use } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import TimeTracker from '../../../../components/projects/TimeTracker.jsx';
import ProjectTimeline from '../../../../components/projects/ProjectTimeline.jsx';
import projectsAPI from '../../../../utils/projectsAPI.js';
import { 
  Briefcase, ArrowLeft, Calendar, FileText, ClipboardList, Tag, 
  Pencil, Trash2, Users, Clock, CheckCircle, AlertCircle, 
  Plus, ChevronDown, ChevronUp, Timer, Timeline
} from 'lucide-react';

export default function ProjectDetail({ params: paramsPromise }) {
      const params = use(paramsPromise); // ⬅️ Correct usage in App Router
 
  const router = useRouter();
  const id = params.id; // Using optional chaining to avoid errors
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(true);
  const [showTeam, setShowTeam] = useState(true);
  const [showDocuments, setShowDocuments] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchProjectDetails();
    } else {
      router.push('/');
    }
  }, [router, id]);

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const projectData = await projectsAPI.getById(id);
      setProject(projectData);
      
      // Fetch tasks for this project
      fetchTasks(id);
    } catch (error) {
      console.error('Failed to fetch project details:', error);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    setTasksLoading(true);
    try {
      const tasksData = await projectsAPI.getTasks(projectId);
      setTasks(tasksData.tasks || []);
    } catch (error) {
      console.error('Failed to fetch project tasks:', error);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(true);
    try {
      await projectsAPI.delete(id);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The requested project could not be found.'}</p>
            <Link href="/dashboard/projects">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <ArrowLeft size={16} />
                Back to Projects
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Briefcase className="text-purple-600" size={32} />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${projectsAPI.getStatusColor(project.status)}`}>
{project.status?.charAt(0).toUpperCase() + project.status?.slice(1).replace('_', ' ') || 'Unknown'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                  ${project.type === 'PROPOSAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {project.type === 'PROPOSAL' ? 'Proposal' : 'Ongoing'}
                </span>
              </div>
              <p className="text-gray-600">Project #{project.project_number} · Client: {project.client_name}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/projects">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ArrowLeft size={16} />
                Back
              </button>
            </Link>
            <Link href={`/dashboard/projects/edit/${id}`}>
              <button className="flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors">
                <Pencil size={16} />
                Edit
              </button>
            </Link>
            <button
              onClick={handleDeleteProject}
              disabled={deleteLoading}
              className={`flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-colors ${
                deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              <Trash2 size={16} />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
        
        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Project Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timeline</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-gray-400" />
                    <p className="text-gray-900">
                      {new Date(project.start_date).toLocaleDateString()} to {new Date(project.end_date).toLocaleDateString()}
                      {' '}({projectsAPI.daysBetween(project.start_date, project.end_date)} days)
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Value</h3>
                  <p className="text-gray-900 mt-1">{projectsAPI.formatCurrency(project.value || 0)}</p>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                  <div className="mt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {projectsAPI.calculateProgress(project.total_tasks || 0, project.completed_tasks || 0)}%
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {project.completed_tasks || 0}/{project.total_tasks || 0} tasks completed
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${projectsAPI.isOverdue(project.end_date, project.status) ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${projectsAPI.calculateProgress(project.total_tasks || 0, project.completed_tasks || 0)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">Description</h3>
                  <p className="text-gray-700 mt-1 whitespace-pre-line">{project.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
            
            {/* Activities Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowActivities(!showActivities)}
              >
                <h2 className="text-xl font-semibold text-gray-900">Activities & Tasks</h2>
                {showActivities ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {showActivities && (
                <div className="mt-4">
                  {tasksLoading ? (
                    <div className="py-4 text-center">
                      <div className="spinner mx-auto"></div>
                      <p className="text-gray-500 mt-2">Loading tasks...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="py-6 text-center border-t">
                      <p className="text-gray-500">No activities or tasks found</p>
                      <Link href={`/dashboard/projects/tasks/add?project=${id}`}>
                        <button className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800">
                          <Plus size={14} />
                          Add Task
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-end mb-4">
                        <Link href={`/dashboard/projects/tasks/add?project=${id}`}>
                          <button className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 border border-purple-200 px-3 py-1 rounded-md">
                            <Plus size={14} />
                            Add Task
                          </button>
                        </Link>
                      </div>
                      
                      <div className="space-y-4">
                        {tasks.map(task => (
                          <div key={task.id} className="p-4 border rounded-md bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-600">{task.description}</p>
                              </div>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {task.status === 'in_progress' ? 'In Progress' : 
                                  task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Users size={12} />
                                <span>{task.assigned_to_name || 'Unassigned'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Team Members */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowTeam(!showTeam)}
              >
                <h2 className="text-xl font-semibold text-gray-900">Team</h2>
                {showTeam ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {showTeam && (
                <div className="mt-4 space-y-3 border-t pt-4">
                  {project.team && project.team.length > 0 ? (
                    project.team.map((member, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-medium">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.role || 'Team Member'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm py-2">No team members assigned</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Documents */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div 
                className="flex items-center justify-between cursor-pointer" 
                onClick={() => setShowDocuments(!showDocuments)}
              >
                <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
                {showDocuments ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
              
              {showDocuments && (
                <div className="mt-4 border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Quotation</p>
                        {project.has_quotation ? (
                          <p className="text-xs text-gray-500">{project.quotation_number} - {new Date(project.quotation_date).toLocaleDateString()}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Not available</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${project.has_quotation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {project.has_quotation ? 'Available' : 'Missing'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList size={18} className="text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Purchase Order</p>
                        {project.has_po ? (
                          <p className="text-xs text-gray-500">{project.po_number} - {new Date(project.po_date).toLocaleDateString()}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Not available</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${project.has_po ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {project.has_po ? 'Available' : 'Missing'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={18} className="text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Invoice</p>
                        {project.has_invoice ? (
                          <p className="text-xs text-gray-500">{project.invoice_number} - {new Date(project.invoice_date).toLocaleDateString()}</p>
                        ) : (
                          <p className="text-xs text-gray-500">Not available</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${project.has_invoice ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                      {project.has_invoice ? 'Available' : 'Missing'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <div className="flex space-x-6 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('time-tracking')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'time-tracking'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Timer className="h-4 w-4" />
                Time Tracking
              </button>
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Timeline className="h-4 w-4" />
                Timeline
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Project Overview</h3>
                  <p className="text-gray-600">Project details are shown in the cards above. Use the other tabs to track time and view timeline.</p>
                </div>
              </div>
            )}

            {activeTab === 'time-tracking' && (
              <TimeTracker 
                projectId={id} 
                onTimeLogged={fetchProjectDetails}
              />
            )}

            {activeTab === 'timeline' && (
              <ProjectTimeline 
                projectId={id}
                showAllProjects={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}