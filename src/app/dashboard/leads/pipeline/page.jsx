'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  User,
  Building,
  Phone,
  Mail
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';

// TODO: Implement API integration for leads data
// TODO: Implement drag and drop functionality for moving leads between stages
// TODO: Calculate real conversion rates and pipeline statistics
// TODO: Add lead filtering and search functionality
// TODO: Implement real-time updates for collaborative editing

export default function PipelineViewPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pipeline stages configuration
  const pipelineStages = [
    { id: 'cold', name: 'Cold Leads', color: 'blue' },
    { id: 'warm', name: 'Warm Leads', color: 'orange' },
    { id: 'hot', name: 'Hot Leads', color: 'red' },
    { id: 'qualified', name: 'Qualified', color: 'purple' },
    { id: 'converted', name: 'Converted', color: 'green' }
  ];

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // TODO: Replace with real API call to load leads
      // Example: 
      // fetchLeads()
      //   .then(data => setLeads(data))
      //   .catch(error => console.error('Error loading leads:', error))
      //   .finally(() => setIsLoading(false));
      
      // For now, just set empty array and stop loading
      setLeads([]);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  }, [router]);

  const getLeadsByStage = (stageId) => {
    return leads.filter(lead => lead.status === stageId);
  };

  const getStageColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 border-blue-300 text-blue-900',
      orange: 'bg-orange-100 border-orange-300 text-orange-900',
      red: 'bg-red-100 border-red-300 text-red-900',
      purple: 'bg-purple-100 border-purple-300 text-purple-900',
      green: 'bg-green-100 border-green-300 text-green-900'
    };
    return colors[color] || colors.blue;
  };

  const getStageValue = (stageId) => {
    return getLeadsByStage(stageId).reduce((sum, lead) => sum + lead.value, 0);
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

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Leads
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline View</h1>
              <p className="text-gray-600">Visual representation of leads progression through sales stages</p>
            </div>
            <Link
              href="/dashboard/leads/add"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Lead
            </Link>
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {pipelineStages.map((stage) => {
            const stageLeads = getLeadsByStage(stage.id);
            const value = getStageValue(stage.id);
            
            return (
              <div key={stage.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{stage.name}</h3>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">{stageLeads.length}</p>
                    <p className="text-sm text-gray-600">leads</p>
                    <p className="text-lg font-semibold text-green-600">₹{value.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Board */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <div className="w-12 h-12 text-gray-400">📊</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Leads in Pipeline</h3>
                <p className="text-gray-600 mb-6">Start by adding some leads to see your pipeline visualization</p>
                <Link
                  href="/dashboard/leads/add"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Lead
                </Link>
              </div>
              <div className="mt-8 text-sm text-gray-500">
                <p>• Drag and drop leads between stages</p>
                <p>• Track progress through your sales funnel</p>
                <p>• Monitor deal values and conversion rates</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-96">
              {pipelineStages.map((stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                
                return (
                  <div key={stage.id} className="flex flex-col">
                    {/* Stage Header */}
                    <div className={`rounded-lg border-2 p-4 mb-4 ${getStageColor(stage.color)}`}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{stage.name}</h3>
                        <span className="text-sm font-medium">{stageLeads.length}</span>
                      </div>
                      <p className="text-sm mt-1 font-medium">
                        ₹{getStageValue(stage.id).toLocaleString()}
                      </p>
                    </div>

                    {/* Stage Cards */}
                    <div className="space-y-4 flex-1">
                      {stageLeads.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No leads in this stage</p>
                        </div>
                      ) : (
                        stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                          >
                            {/* Lead content will be rendered here when leads exist */}
                            <div className="mb-3">
                              <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                {lead.name}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mt-1">
                                <Building className="w-3 h-3 mr-1" />
                                {lead.company}
                              </div>
                            </div>
                            <div className="flex items-center mb-3">
                              <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                              <span className="font-semibold text-green-600">
                                ₹{lead.value.toLocaleString()}
                              </span>
                            </div>
                            {/* More lead details... */}
                          </div>
                        ))
                      )}

                      {/* Add Lead to Stage */}
                      <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors">
                        <Plus className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-sm">Add Lead</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline Statistics - TODO: Implement real statistics from API */}
        {leads.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion Rate</h3>
              <div className="space-y-2">
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Statistics will be calculated</p>
                  <p className="text-sm">based on lead data</p>
                  <p className="text-xs mt-2 text-gray-400">TODO: Implement conversion rate calculations</p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Deal Size</h3>
              <div className="space-y-2">
                {pipelineStages.map((stage) => {
                  const leads = getLeadsByStage(stage.id);
                  const avgValue = leads.length > 0 ? getStageValue(stage.id) / leads.length : 0;
                  
                  return (
                    <div key={stage.id} className="flex justify-between">
                      <span className="text-sm text-gray-600">{stage.name}</span>
                      <span className="text-sm font-medium">₹{avgValue.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Health</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Total Pipeline Value</span>
                    <span className="text-sm font-medium">
                      ₹{leads.reduce((sum, lead) => sum + (lead.value || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">TODO: Calculate pipeline health metrics</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Expected Close Rate</span>
                    <span className="text-sm font-medium">0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">TODO: Calculate expected close rate</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
