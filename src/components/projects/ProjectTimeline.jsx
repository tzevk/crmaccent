import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Building2,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';

const ProjectTimeline = ({ projectId, showAllProjects = false }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [projectStats, setProjectStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchTimelineData();
  }, [projectId, dateFilter]);

  const fetchTimelineData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (projectId && !showAllProjects) {
        params.append('projectId', projectId);
      }
      
      if (dateFilter.startDate) {
        params.append('startDate', dateFilter.startDate);
      }
      
      if (dateFilter.endDate) {
        params.append('endDate', dateFilter.endDate);
      }

      const response = await fetch(`/api/projects/timeline?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch timeline data');
      }

      const data = await response.json();
      setTimelineData(data.timeline);
      setProjectStats(data.projectStats);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType, status) => {
    switch (eventType) {
      case 'project':
        return <Building2 className="h-4 w-4" />;
      case 'task':
        return status === 'completed' ? 
          <CheckCircle className="h-4 w-4 text-emerald-500" /> : 
          <Clock className="h-4 w-4 text-blue-500" />;
      case 'log':
        return <Activity className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType, status, priority) => {
    if (eventType === 'task') {
      switch (status) {
        case 'completed': return 'bg-emerald-50/80 backdrop-blur-sm border-emerald-200/60';
        case 'in_progress': return 'bg-blue-50/80 backdrop-blur-sm border-blue-200/60';
        case 'pending': return 'bg-amber-50/80 backdrop-blur-sm border-amber-200/60';
        default: return 'bg-white/60 backdrop-blur-sm border-gray-200/60';
      }
    }
    
    if (eventType === 'project') {
      switch (priority) {
        case 'urgent': return 'bg-red-50/80 backdrop-blur-sm border-red-200/60';
        case 'high': return 'bg-orange-50/80 backdrop-blur-sm border-orange-200/60';
        case 'medium': return 'bg-blue-50/80 backdrop-blur-sm border-blue-200/60';
        case 'low': return 'bg-emerald-50/80 backdrop-blur-sm border-emerald-200/60';
        default: return 'bg-white/60 backdrop-blur-sm border-gray-200/60';
      }
    }

    return 'bg-purple-50/80 backdrop-blur-sm border-purple-200/60';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-700">Loading timeline...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Timeline</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTimelineData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              {projectId && !showAllProjects ? 'Project Timeline' : 'Projects Timeline'}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="date"
              value={dateFilter.startDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={dateFilter.endDate}
              onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="End Date"
            />
          </div>
        </div>
      </div>

      {/* Project Statistics (if single project) */}
      {projectStats && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Tasks Complete</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projectStats.completed_tasks}/{projectStats.total_tasks}
                  </p>
                </div>
                <div className="bg-emerald-500/20 backdrop-blur-sm p-2 rounded-lg border border-emerald-200/30">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.task_completion_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Hours Logged</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projectStats.total_actual_hours}h
                  </p>
                </div>
                <div className="bg-blue-500/20 backdrop-blur-sm p-2 rounded-lg border border-blue-200/30">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                of {projectStats.total_estimated_hours}h estimated
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projectStats.hours_completion_percentage}%
                  </p>
                </div>
                <div className="bg-purple-500/20 backdrop-blur-sm p-2 rounded-lg border border-purple-200/30">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2">
                <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-2 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${projectStats.hours_completion_percentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Status</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {projectStats.status}
                  </p>
                </div>
                <div className="bg-amber-500/20 backdrop-blur-sm p-2 rounded-lg border border-amber-200/30">
                  <BarChart3 className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Priority: {projectStats.priority}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {summary && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-blue-600">{summary.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-emerald-600">{summary.eventTypes.projects}</div>
              <div className="text-sm text-gray-600">Projects</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-purple-600">{summary.eventTypes.tasks}</div>
              <div className="text-sm text-gray-600">Tasks</div>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold text-amber-600">{summary.eventTypes.activities}</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline Events</h3>
        
        {timelineData.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Events</h3>
            <p className="text-gray-600">No events found for the selected criteria.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>
            
            <div className="space-y-6">
              {timelineData.map((event, index) => (
                <div key={index} className="relative flex items-start">
                  <div className="absolute left-6 w-4 h-4 bg-white/80 backdrop-blur-sm rounded-full border-2 border-blue-300/60 flex items-center justify-center shadow-sm">
                    {getEventIcon(event.event_type, event.status)}
                  </div>
                  
                  <div className="ml-16 flex-1">
                    <div className={`p-4 rounded-xl border-2 ${getEventColor(event.event_type, event.status, event.priority)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{event.event_title}</h4>
                        <span className="text-sm text-gray-500 ml-4 whitespace-nowrap">
                          {formatDate(event.event_date)}
                        </span>
                      </div>
                      
                      {event.project_name && (
                        <p className="text-sm text-gray-700 mb-2">
                          <Building2 className="inline h-4 w-4 mr-1" />
                          {event.project_name} ({event.project_number})
                        </p>
                      )}
                      
                      {event.client_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          Client: {event.client_name}
                        </p>
                      )}
                      
                      {event.event_description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {event.event_description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          {event.status && (
                            <span className={`px-2 py-1 rounded-full ${
                              event.status === 'completed' ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200/60' :
                              event.status === 'in_progress' ? 'bg-blue-100/80 text-blue-800 border border-blue-200/60' :
                              event.status === 'pending' ? 'bg-amber-100/80 text-amber-800 border border-amber-200/60' :
                              'bg-gray-100/80 text-gray-800 border border-gray-200/60'
                            }`}>
                              {event.status.replace('_', ' ').toUpperCase()}
                            </span>
                          )}
                          {event.priority && (
                            <span className={`px-2 py-1 rounded-full ${
                              event.priority === 'urgent' ? 'bg-red-100/80 text-red-800 border border-red-200/60' :
                              event.priority === 'high' ? 'bg-orange-100/80 text-orange-800 border border-orange-200/60' :
                              event.priority === 'medium' ? 'bg-blue-100/80 text-blue-800 border border-blue-200/60' :
                              'bg-emerald-100/80 text-emerald-800 border border-emerald-200/60'
                            }`}>
                              {event.priority.toUpperCase()}
                            </span>
                          )}
                        </div>
                        
                        {event.created_by_name && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {event.created_by_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;
