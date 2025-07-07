'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, 
  CheckSquare, Clock, AlertCircle, Target 
} from 'lucide-react';

// Add CSS for spinner
const styles = `
  .spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #8b5cf6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function TasksDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get auth token from localStorage
      const authToken = typeof window !== 'undefined' 
        ? localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A'
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A';
      
      const response = await fetch('/api/tasks/stats', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching task statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">
      Unable to load task statistics
    </div>;
  }

  const completionRate = stats.totalTasks > 0 
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)
    : 0;

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="space-y-6">
        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
                <p className="text-xs text-gray-500 mt-2">All time</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <CheckSquare className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingTasks}</p>
                <p className="text-xs text-gray-500 mt-2">Awaiting action</p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completedTasks}</p>
                <p className="text-xs text-green-600 mt-2 font-medium">{completionRate}% completion rate</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckSquare className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600">Overdue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.overdueTasks}</p>
                <p className="text-xs text-red-600 mt-2 font-medium">Need attention</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Focus & This Week */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 rounded-full p-2">
                <Calendar className="text-purple-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Today's Focus</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Due Today</span>
                <span className="text-xl font-bold text-purple-600">{stats.todayTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">High Priority</span>
                <span className="text-xl font-bold text-red-600">{stats.tasksByPriority.high || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">In Progress</span>
                <span className="text-xl font-bold text-blue-600">{stats.inProgressTasks}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">This Week</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Week's Tasks</span>
                <span className="text-xl font-bold text-gray-900">{stats.thisWeekTasks}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Upcoming Deadlines</span>
                <span className="text-xl font-bold text-orange-600">{stats.upcomingDeadlines}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600">Recently Created</span>
                <span className="text-xl font-bold text-blue-600">{stats.recentlyCreated}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Priority Breakdown</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">High Priority</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {stats.tasksByPriority.high || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Medium Priority</span>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  {stats.tasksByPriority.medium || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Low Priority</span>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {stats.tasksByPriority.low || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Category Distribution</h3>
            <div className="space-y-4">
              {Object.entries(stats.tasksByCategory || {}).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-700 capitalize">{category.replace('-', ' ')}</span>
                  <span className="text-lg font-bold text-purple-600">{count}</span>
                </div>
              ))}
              {Object.keys(stats.tasksByCategory || {}).length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Target className="text-gray-400" size={24} />
                  </div>
                  <p className="text-sm text-gray-500">No tasks categorized yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trends & Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-indigo-100 rounded-full p-2">
              <Target className="text-indigo-600" size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Performance Trends</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <div className="flex items-center justify-center gap-2 mb-3">
                {stats.trends?.direction === 'up' ? (
                  <div className="bg-green-100 rounded-full p-2">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                ) : stats.trends?.direction === 'down' ? (
                  <div className="bg-red-100 rounded-full p-2">
                    <TrendingDown className="text-red-600" size={20} />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                )}
                <span className="text-3xl font-bold text-gray-900">
                  {stats.trends?.monthlyChangePercentage || 0}%
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-700">Monthly Change</p>
              <p className="text-xs text-gray-500 mt-2">
                {stats.trends?.monthlyChange > 0 ? '+' : ''}{stats.trends?.monthlyChange || 0} tasks vs last month
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-3">
                {stats.thisMonthTasks}
              </div>
              <p className="text-sm font-semibold text-gray-700">This Month</p>
              <p className="text-xs text-gray-500 mt-2">
                Total tasks created
              </p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-3xl font-bold text-green-600 mb-3">
                {completionRate}%
              </div>
              <p className="text-sm font-semibold text-gray-700">Completion Rate</p>
              <p className="text-xs text-gray-500 mt-2">
                Overall task completion
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
