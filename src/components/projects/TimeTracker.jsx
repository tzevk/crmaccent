import { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Calendar, 
  User, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Timer,
  Save,
  X
} from 'lucide-react';

const TimeTracker = ({ projectId, onTimeLogged }) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    task_id: '',
    actual_hours: '',
    work_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTimeData();
    fetchProjects();
  }, [projectId]);

  useEffect(() => {
    if (newEntry.project_id || projectId) {
      fetchTasks(newEntry.project_id || projectId);
    }
  }, [newEntry.project_id, projectId]);

  const fetchTimeData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (projectId) {
        params.append('projectId', projectId);
      }

      const response = await fetch(`/api/projects/time-tracking?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch time tracking data');
      }

      const data = await response.json();
      setTimeEntries(data.timeEntries);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  const fetchTasks = async (selectedProjectId) => {
    if (!selectedProjectId) return;
    
    try {
      const response = await fetch(`/api/projects/tasks?projectId=${selectedProjectId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  const handleAddTimeEntry = async (e) => {
    e.preventDefault();
    
    if (!newEntry.task_id || !newEntry.actual_hours) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/projects/time-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newEntry,
          project_id: projectId || newEntry.project_id,
          user_id: 1 // TODO: Get from auth context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log time');
      }

      // Reset form
      setNewEntry({
        task_id: '',
        actual_hours: '',
        work_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      setShowAddForm(false);
      
      // Refresh data
      await fetchTimeData();
      
      if (onTimeLogged) {
        onTimeLogged();
      }

      alert('Time logged successfully!');
    } catch (err) {
      alert('Failed to log time: ' + err.message);
    }
  };

  const formatHours = (hours) => {
    if (!hours) return '0.0h';
    return `${parseFloat(hours).toFixed(1)}h`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-700">Loading time tracking data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Time Data</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchTimeData}
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
      {/* Header and Summary */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Timer className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900">Time Tracking</h2>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Log Time
          </button>
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatHours(summary.totalActualHours)}</div>
              <div className="text-sm text-gray-600">Total Logged</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatHours(summary.totalEstimatedHours)}</div>
              <div className="text-sm text-gray-600">Estimated</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{summary.completionRate}%</div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
            
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <User className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{summary.completedTasks}/{summary.totalTasks}</div>
              <div className="text-sm text-gray-600">Tasks Done</div>
            </div>
          </div>
        )}
      </div>

      {/* Add Time Entry Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Log Time Entry</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleAddTimeEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <select
                    value={newEntry.project_id || ''}
                    onChange={(e) => setNewEntry({ ...newEntry, project_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.project_number})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task *
                </label>
                <select
                  value={newEntry.task_id}
                  onChange={(e) => setNewEntry({ ...newEntry, task_id: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.task_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={newEntry.actual_hours}
                  onChange={(e) => setNewEntry({ ...newEntry, actual_hours: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2.5"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Date *
                </label>
                <input
                  type="date"
                  value={newEntry.work_date}
                  onChange={(e) => setNewEntry({ ...newEntry, work_date: e.target.value })}
                  className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={newEntry.notes}
                onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Additional details about the work performed..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                <Save className="h-4 w-4" />
                Log Time
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Entries List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Time Entries</h3>
        
        {timeEntries.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Entries</h3>
            <p className="text-gray-600">Start logging time to see your entries here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Task</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Project</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estimated</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actual</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {timeEntries.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-100 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{entry.task_name}</div>
                      {entry.description && (
                        <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{entry.project_name}</div>
                      <div className="text-sm text-gray-600">{entry.project_number}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{formatHours(entry.estimated_hours)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        entry.actual_hours > entry.estimated_hours ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatHours(entry.actual_hours)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'completed' ? 'bg-green-100 text-green-800' :
                        entry.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{entry.user_name}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {entry.due_date ? formatDate(entry.due_date) : 'No due date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
