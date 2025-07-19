'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import ProjectTimeline from '../../../../components/projects/ProjectTimeline.jsx';
import TimeTracker from '../../../../components/projects/TimeTracker.jsx';
import { Calendar, Timer, BarChart3, Users, Activity } from 'lucide-react';

export default function ProjectTimelines() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Management Hub</h1>
                <p className="text-gray-600">Track time and visualize project timelines</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">All Projects</div>
            <div className="text-sm text-gray-600">Overview & Analytics</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
            <Timer className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">Time Tracking</div>
            <div className="text-sm text-gray-600">Log Hours & Monitor Progress</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
            <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">Project Timeline</div>
            <div className="text-sm text-gray-600">Visual Project History</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 text-center">
            <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">Team Activity</div>
            <div className="text-sm text-gray-600">Collaboration & Updates</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-8">
          <div className="border-b border-white/20">
            <div className="flex space-x-6 px-6">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === 'timeline'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity className="h-4 w-4" />
                All Projects Timeline
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
                Global Time Tracking
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'timeline' && (
              <ProjectTimeline 
                showAllProjects={true}
              />
            )}

            {activeTab === 'time-tracking' && (
              <TimeTracker />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
