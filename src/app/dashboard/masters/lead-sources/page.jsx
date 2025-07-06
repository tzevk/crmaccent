'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { Target, Plus, Search, Filter } from 'lucide-react';

export default function LeadSourcesMaster() {
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
            <Target className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Lead Sources Master</h1>
          </div>
          <p className="text-gray-600">Manage lead sources and tracking configurations</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search lead sources..."
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
              Add Source
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center py-12">
            <Target className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lead Sources Master</h3>
            <p className="text-gray-600 mb-6">Lead source management functionality will be implemented here</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Lead source definitions</p>
              <p>• Tracking configurations</p>
              <p>• Attribution settings</p>
              <p>• Performance metrics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
