'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, TrendingUp, TrendingDown, Clock, 
  Users, MapPin, BarChart3, Target 
} from 'lucide-react';

export default function CalendarDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/calendar/stats', {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('authToken') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiYWRtaW5AY3JtYWNjZW50LmNvbSIsImlhdCI6MTc1MTg3NDAzOSwiZXhwIjoxNzUxOTYwNDM5fQ.4iR05fF_6DxhHpPzibKn3By-NP7Z1E6dAGvpFUImP4A'}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching calendar statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="spinner"></div>
    </div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">
      Unable to load calendar statistics
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <Calendar className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Events</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Scheduled today</p>
            </div>
            <Clock className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Future events</p>
            </div>
            <TrendingUp className="text-purple-500" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{stats.thisWeekEvents}</p>
              <p className="text-xs text-gray-500 mt-1">Week's schedule</p>
            </div>
            <Calendar className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* This Month & Deadlines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">This Month</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Events</span>
              <span className="text-lg font-semibold text-gray-900">{stats.thisMonthEvents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Recently Created</span>
              <span className="text-lg font-semibold text-blue-600">{stats.recentlyCreated}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Upcoming Deadlines</span>
              <span className="text-lg font-semibold text-red-600">{stats.upcomingDeadlines}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-green-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Event Distribution</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.eventsByType || {}).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'meeting' ? 'bg-blue-500' :
                    type === 'call' ? 'bg-green-500' :
                    type === 'task' ? 'bg-purple-500' :
                    type === 'deadline' ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">{type}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.eventsByType || {}).length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No events scheduled yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Priority Breakdown & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">High Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.eventsByPriority?.high || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Medium Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.eventsByPriority?.medium || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Low Priority</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.eventsByPriority?.low || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-indigo-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {stats.trends?.direction === 'up' ? (
                <TrendingUp className="text-green-500" size={20} />
              ) : stats.trends?.direction === 'down' ? (
                <TrendingDown className="text-red-500" size={20} />
              ) : (
                <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              )}
              <span className="text-2xl font-bold text-gray-900">
                {stats.trends?.monthlyChangePercentage || 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Monthly Change</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.trends?.monthlyChange > 0 ? '+' : ''}{stats.trends?.monthlyChange || 0} events vs last month
            </p>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Activity Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {stats.totalEvents}
            </div>
            <p className="text-sm text-gray-600">Total Events</p>
            <p className="text-xs text-gray-500 mt-1">
              All time count
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {stats.thisWeekEvents}
            </div>
            <p className="text-sm text-gray-600">This Week</p>
            <p className="text-xs text-gray-500 mt-1">
              Current week schedule
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {stats.upcomingEvents}
            </div>
            <p className="text-sm text-gray-600">Upcoming</p>
            <p className="text-xs text-gray-500 mt-1">
              Future scheduled events
            </p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {stats.pastEvents}
            </div>
            <p className="text-sm text-gray-600">Past Events</p>
            <p className="text-xs text-gray-500 mt-1">
              Completed events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
