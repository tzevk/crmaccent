'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Users,
  Target,
  DollarSign
} from 'lucide-react';

// Import components
import Navbar from '../../../components/navigation/Navbar.jsx';
// Import API utility
import { leadsAPI, leadUtils } from '../../../utils/leadsAPI.js';

export default function LeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    hot: 0,
    converted: 0,
    totalValue: 0
  });

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Load leads and stats from API
      loadLeads();
      loadStats();
    } else {
      router.push('/');
    }
  }, [router, searchTerm, statusFilter, sourceFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (sourceFilter !== 'all') filters.source = sourceFilter;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await leadsAPI.getAll(filters);
      setLeads(response.leads || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      setError('Failed to load leads. Please try again.');
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await leadsAPI.getStats();
      const statusBreakdown = response.statusBreakdown || [];
      const valueStats = response.valueStats || {};
      
      setStats({
        total: valueStats.total_leads || 0,
        hot: response.hotLeads || 0,
        converted: statusBreakdown.find(s => s.status === 'converted')?.count || 0,
        totalValue: parseFloat(valueStats.total_value || 0)
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Filter leads (now handled by API)
  const filteredLeads = leads;

  // Action handlers
  const handleViewLead = (leadId) => {
    // TODO: Navigate to lead details page
    router.push(`/dashboard/leads/${leadId}`);
  };

  const handleEditLead = (leadId) => {
    // TODO: Navigate to edit page
    router.push(`/dashboard/leads/edit/${leadId}`);
  };

  const handleDeleteLead = async (leadId) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await leadsAPI.delete(leadId);
        // Reload leads after deletion
        loadLeads();
        loadStats();
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSourceFilterChange = (e) => {
    setSourceFilter(e.target.value);
  };

  const handleImport = () => {
    router.push('/dashboard/leads/import');
  };

  const handleExport = () => {
    if (filteredLeads.length === 0) {
      alert('No leads to export');
      return;
    }
    
    // Generate CSV export
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Name,Company,Email,Phone,Status,Source,Value,Assigned To,Created Date\n" +
      filteredLeads.map(lead => 
        `"${lead.name || ''}","${lead.company || ''}","${lead.email || ''}","${lead.phone || ''}","${lead.status || ''}","${lead.source || ''}","${lead.value || ''}","${lead.assigned_to || ''}","${new Date(lead.created_at).toLocaleDateString()}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: '#64126D' }}>Lead Management</h1>
              <p style={{ color: '#86288F' }}>Manage and track your sales leads</p>
            </div>
            <Link
              href="/dashboard/leads/add"
              className="inline-flex items-center px-6 py-3 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ backgroundColor: '#64126D' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#86288F'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#64126D'}
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Lead
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
                 style={{ borderLeftColor: '#64126D' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#86288F' }}>Total Leads</p>
                  <p className="text-3xl font-bold" style={{ color: '#64126D' }}>{stats.total}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">Ready for data</span>
                  </div>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                  <Users className="w-6 h-6" style={{ color: '#64126D' }} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
                 style={{ borderLeftColor: '#dc2626' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#86288F' }}>Hot Leads</p>
                  <p className="text-3xl font-bold text-red-600">{stats.hot}</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-500">Need attention</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
                 style={{ borderLeftColor: '#16a34a' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#86288F' }}>Converted</p>
                  <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
                  <div className="flex items-center mt-2">
                    <Target className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-500">Success rate</span>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
                 style={{ borderLeftColor: '#86288F' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#86288F' }}>Total Value</p>
                  <p className="text-3xl font-bold" style={{ color: '#64126D' }}>₹{stats.totalValue.toLocaleString()}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-purple-500">Pipeline value</span>
                  </div>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                  <DollarSign className="w-6 h-6" style={{ color: '#86288F' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#86288F' }} />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                  <option value="qualified">Qualified</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={handleSourceFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="all">All Sources</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="cold_call">Cold Call</option>
                  <option value="social_media">Social Media</option>
                  <option value="email_campaign">Email Campaign</option>
                  <option value="trade_show">Trade Show</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handleImport}
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-colors border"
                  style={{ 
                    backgroundColor: '#f3e8ff', 
                    color: '#64126D',
                    borderColor: '#e2d5f3'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ede9fe'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3e8ff'}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button 
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-colors border"
                  style={{ 
                    backgroundColor: '#f3e8ff', 
                    color: '#64126D',
                    borderColor: '#e2d5f3'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ede9fe'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f3e8ff'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#faf7ff' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Lead Info</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Source</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Value</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Assigned To</th>
                  <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Last Contact</th>
                  <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#64126D' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="spinner mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading leads...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100">
                          <Users className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Leads</h3>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button
                          onClick={() => loadLeads()}
                          className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: '#64126D' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#86288F'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#64126D'}
                        >
                          Try Again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#f3e8ff' }}>
                          <Users className="w-8 h-8" style={{ color: '#64126D' }} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2" style={{ color: '#64126D' }}>No leads found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all' 
                            ? 'No leads match your current filters. Try adjusting your search criteria.'
                            : 'Start by adding your first lead to begin managing your sales pipeline.'
                          }
                        </p>
                        <Link
                          href="/dashboard/leads/add"
                          className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all duration-200 hover:shadow-md"
                          style={{ backgroundColor: '#64126D' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#86288F'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#64126D'}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Your First Lead
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{lead.name}</div>
                          <div className="text-sm text-gray-500">{lead.company || 'No company'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center text-sm text-gray-900">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {lead.phone}
                            </div>
                          )}
                          {!lead.email && !lead.phone && (
                            <span className="text-sm text-gray-400">No contact info</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${leadUtils.getStatusColor(lead.status)}`}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="mr-2">{leadUtils.getSourceIcon(lead.source)}</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {lead.source.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {leadUtils.formatCurrency(parseFloat(lead.value || 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{lead.assigned_to || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4">
                        {lead.last_contact ? (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(lead.last_contact).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No contact yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Lead"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/leads/pipeline" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                 style={{ borderLeftColor: '#64126D', borderLeftWidth: '4px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#64126D' }}>Pipeline View</h3>
                <div className="p-2 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: '#64126D' }} />
                </div>
              </div>
              <p style={{ color: '#86288F' }}>Visual pipeline to track lead progression through stages</p>
            </div>
          </Link>

          <Link href="/dashboard/leads/sources" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                 style={{ borderLeftColor: '#2563eb', borderLeftWidth: '4px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#64126D' }}>Lead Sources</h3>
                <div className="p-2 rounded-full bg-blue-100">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p style={{ color: '#86288F' }}>Manage and analyze your lead generation sources</p>
            </div>
          </Link>

          <Link href="/dashboard/leads/import" className="group">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                 style={{ borderLeftColor: '#16a34a', borderLeftWidth: '4px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: '#64126D' }}>Import Leads</h3>
                <div className="p-2 rounded-full bg-green-100">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p style={{ color: '#86288F' }}>Bulk import leads from CSV or other sources</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
