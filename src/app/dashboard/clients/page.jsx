'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/navigation/Navbar.jsx';
import { Building2, Plus, Search, Filter, Mail, Phone } from 'lucide-react';

export default function AllClients() {
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
        backgroundColor: '#F5F5F5'
      }}>
        <div className="spinner"></div>
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
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-8 h-8" style={{ color: '#64126D' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>All Clients</h1>
          </div>
          <p style={{ color: '#86288F' }}>Manage your client relationships and accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Building2 className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Building2 className="text-green-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Building2 className="text-purple-500" size={24} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹-</p>
              </div>
              <Building2 className="text-orange-500" size={24} />
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                Filter
              </button>
            </div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Plus size={16} />
              Add Client
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Client Management</h3>
            <p className="text-gray-600 mb-6">Client management functionality will be implemented here</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Client contact information</p>
              <p>• Project history</p>
              <p>• Communication logs</p>
              <p>• Revenue tracking</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
