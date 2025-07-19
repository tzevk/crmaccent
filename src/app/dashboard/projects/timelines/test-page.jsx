'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timeline, Timer, BarChart3, Users } from 'lucide-react';

// Simple test components to isolate the issue
const TestProjectTimeline = ({ projectId, showAllProjects = false }) => {
  return <div>ProjectTimeline Component Loaded</div>;
};

const TestTimeTracker = ({ projectId, onTimeLogged }) => {
  return <div>TimeTracker Component Loaded</div>;
};

export default function TestProjectTimelines() {
  const [activeTab, setActiveTab] = useState('timeline');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-8">
          <div className="flex items-center gap-3">
            <Timeline className="h-8 w-8 text-blue-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Project Management Hub</h1>
              <p className="text-gray-600">Testing component imports</p>
            </div>
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
                <Timeline className="h-4 w-4" />
                Test Timeline
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
                Test Time Tracking
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'timeline' && (
              <TestProjectTimeline showAllProjects={true} />
            )}

            {activeTab === 'time-tracking' && (
              <TestTimeTracker />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
