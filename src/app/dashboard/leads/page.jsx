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
  DollarSign,
  Target,
  Hash,
  User,
  MapPin
} from 'lucide-react';

// Import components
import Navbar from '../../../components/navigation/Navbar.jsx';
// Import API utilities
import leadsAPI from '../../../utils/leadsAPI.js';

// Remove demo data - will be replaced with real API calls
// const demoLeads = [];

export default function LeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsPerPage, setLeadsPerPage] = useState(10);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLeads(1); // Start at page 1
    } else {
      router.push('/');
    }
  }, [router]);
  
  // Reload leads when filters change
  useEffect(() => {
    if (user) {
      loadLeads(1); // Reset to page 1 when filters change
    }
  }, [searchTerm, statusFilter, sourceFilter]);

  const loadLeads = async (page = 1) => {
    try {
      setIsLoading(true);

      const response = await leadsAPI.getLeads({
        limit: leadsPerPage,
        page: page,
        search: searchTerm,
        enquiry_status: statusFilter !== 'all' ? statusFilter : undefined,
        enquiry_type: sourceFilter !== 'all' ? sourceFilter : undefined,
        sortBy: 'created_at',
        sortOrder: 'DESC',
      });

      if (response && response.leads) {
        setLeads(response.leads);
        setCurrentPage(response.pagination?.currentPage || page);
        setTotalPages(response.pagination?.totalPages || Math.ceil((response.pagination?.totalCount || leads.length) / leadsPerPage));
        setTotalLeads(response.pagination?.totalCount || leads.length);
      } else {
        console.error('Failed to load leads:', response);
        setLeads([]);
      }
    } catch (error) {
      console.error('Error loading leads:', error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Working': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Quoted': 'bg-purple-100 text-purple-800 border-purple-200',
      'Won': 'bg-green-100 text-green-800 border-green-200',
      'Lost': 'bg-red-100 text-red-800 border-red-200',
      'Follow-up': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[status] || colors['New'];
  };

  const getSourceIcon = (source) => {
    const icons = {
      'Email': '📧',
      'Phone': '📱',
      'Call': '📱',
      'Website': '🌐',
      'Reference': '👥',
      'Social Media': '📱',
      'Exhibition': '🏢',
      'Existing Company': '🏛️',
      'Enquiry': '❓',
      'Site visit': '🏭',
      'Indiamart': '🛒',
      'Justdial': '📞',
      'GEM': '💎',
      'Projects Today': '📋',
      'Tender Tiger': '🐯',
      'Other': '📝'
    };
    return icons[source] || '📝';
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.enquiry_no?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesStatus = statusFilter === 'all' || lead.enquiry_status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.enquiry_type === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Calculate stats
  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.enquiry_status === 'New' || l.enquiry_status === 'Working').length,
    converted: leads.filter(l => l.enquiry_status === 'Won').length,
    totalValue: leads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0)
  };

  // Action handlers
  const handleViewLead = (leadId) => {
    router.push(`/dashboard/leads/${leadId}`);
  };

  const handleEditLead = (leadId) => {
    router.push(`/dashboard/leads/${leadId}/edit`);
  };

  const handleDeleteLead = async (leadId) => {
    if (confirm(`Are you sure you want to delete this lead?`)) {
      try {
        setIsLoading(true);
        await leadsAPI.delete(leadId);
        // Refresh the leads list
        loadLeads(currentPage);
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImport = () => {
    router.push('/dashboard/leads/import');
  };

  const handleExport = () => {
    if (leads.length === 0) {
      alert('No leads to export');
      return;
    }
    
    // Generate CSV export with the new schema fields
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Sr No,Enquiry No,Year,Company Name,Type,City,Enquiry Date,Enquiry Type,Contact Name,Contact Email,Project Description,Enquiry Status,Project Status\n" +
      filteredLeads.map(lead => 
        `"${lead.sr_no || ''}","${lead.enquiry_no || ''}","${lead.year || ''}","${lead.company_name || ''}","${lead.type || ''}","${lead.city || ''}","${lead.enquiry_date || ''}","${lead.enquiry_type || ''}","${lead.contact_name || ''}","${lead.contact_email || ''}","${lead.project_description || ''}","${lead.enquiry_status || ''}","${lead.project_status || ''}"`
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
              <p className="text-gray-600">Manage and track your sales leads</p>
            </div>
            <Link
              href="/dashboard/leads/add"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Lead
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Leads</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hot Leads</p>
                  <p className="text-3xl font-bold text-red-600">{stats.hot}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Converted</p>
                  <p className="text-3xl font-bold text-green-600">{stats.converted}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-3xl font-bold text-purple-600">₹{stats.totalValue.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="New">New</option>
                  <option value="Working">Working</option>
                  <option value="Quoted">Quoted</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                  <option value="Follow-up">Follow-up</option>
                </select>

                {/* Source Filter */}
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Sources</option>
                  <option value="Reference">Reference</option>
                  <option value="Exhibition">Exhibition</option>
                  <option value="Existing Company">Existing Company</option>
                  <option value="Enquiry">Enquiry</option>
                  <option value="Email">Email</option>
                  <option value="Site visit">Site visit</option>
                  <option value="Call">Call</option>
                  <option value="Website">Website</option>
                  <option value="Indiamart">Indiamart</option>
                  <option value="Justdial">Justdial</option>
                  <option value="Social Media">Social Media</option>
                  <option value="GEM">GEM</option>
                  <option value="Projects Today">Projects Today</option>
                  <option value="Tender Tiger">Tender Tiger</option>
                </select>

                {/* Per Page Selector */}
                <select
                  value={leadsPerPage}
                  onChange={(e) => {
                    setLeadsPerPage(Number(e.target.value));
                    loadLeads(1); // Reset to page 1 when changing items per page
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={handleImport}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </button>
                <button 
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr/Enquiry No</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Info</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enquiry Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center">
                      <div className="spinner mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No leads found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">#{lead.sr_no || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{lead.enquiry_no || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{lead.company_name || 'N/A'}</div>
                          <div className="text-sm text-gray-500 capitalize">{lead.type || 'New'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            {lead.contact_name || 'N/A'}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {lead.contact_email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(lead.enquiry_status || 'New')}`}>
                          {lead.enquiry_status || 'New'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-800 border-gray-200`}>
                          {lead.project_status || 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className="mr-2">{getSourceIcon(lead.enquiry_type || 'Email')}</span>
                          <span className="text-sm text-gray-900 capitalize">
                            {(lead.enquiry_type || 'Email').replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {lead.city || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {lead.enquiry_date ? new Date(lead.enquiry_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/dashboard/leads/${lead.id}`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="View Lead"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link 
                            href={`/dashboard/leads/${lead.id}/edit`}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit Lead"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages} ({totalLeads} total leads)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => loadLeads(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => loadLeads(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg border ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/dashboard/leads/pipeline" className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:border-purple-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pipeline View</h3>
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-gray-600">Visual pipeline to track lead progression through stages</p>
            </div>
          </Link>

          <Link href="/dashboard/leads/sources" className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:border-blue-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600">Manage and analyze your lead generation sources</p>
            </div>
          </Link>

          <Link href="/dashboard/leads/import" className="group">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 group-hover:border-green-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Import Leads</h3>
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600">Bulk import leads from CSV or other sources</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
