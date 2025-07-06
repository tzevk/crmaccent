'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { Users, BarChart, Download, Filter, Clock } from 'lucide-react';

export default function EmployeeReports() {
  const router = useRouter();
  const [user, setUser] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Employee Reports</h1>
          </div>
          <p className="text-gray-600">Track employee performance and productivity</p>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select Department</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="development">Development</option>
                <option value="support">Support</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                <option value="">Select Time Period</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Advanced Filters
              </button>
            </div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Productivity</p>
                <p className="text-2xl font-bold text-gray-900">-%</p>
              </div>
              <BarChart className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">-h</p>
              </div>
              <Clock className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <BarChart className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Charts and Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Department</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Department performance comparison
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart placeholder - Time tracking overview
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee Performance</h3>
            <p className="text-gray-600 mb-6">Employee reporting and analytics functionality will be implemented here</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Individual performance metrics</p>
              <p>• Time tracking analysis</p>
              <p>• Task completion rates</p>
              <p>• Team productivity insights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
