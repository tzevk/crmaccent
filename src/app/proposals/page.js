'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import './proposals.css';

export default function ProposalsPage() {
  const [user, setUser] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [convertingId, setConvertingId] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [conversionStep, setConversionStep] = useState('proposal'); // proposal -> lead -> project
  const [convertingToLead, setConvertingToLead] = useState(false);
  const [convertingToProject, setConvertingToProject] = useState(false);
  const [leadId, setLeadId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    awarded: 0,
    lost: 0,
    totalValue: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchProposals();
  }, [router]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proposals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch proposals');
      }
      
      const proposalsData = await response.json();
      
      setProposals(proposalsData);
      
      // Calculate stats
      const totalProposals = proposalsData.length;
      const pendingCount = proposalsData.filter(p => 
        ['Submitted', 'Under Discussion', 'Awaiting Response'].includes(p.current_status)
      ).length;
      const awardedCount = proposalsData.filter(p => p.current_status === 'Awarded').length;
      const lostCount = proposalsData.filter(p => 
        ['Lost', 'Closed'].includes(p.current_status)
      ).length;
      const totalValue = proposalsData
        .filter(p => p.estimated_value)
        .reduce((sum, p) => sum + parseFloat(p.estimated_value || 0), 0);
      
      setStats({
        total: totalProposals,
        pending: pendingCount,
        awarded: awardedCount,
        lost: lostCount,
        totalValue: totalValue
      });
      
    } catch (error) {
      console.error('Error fetching proposals:', error);
      setError('Failed to load proposals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency = 'INR') => {
    if (!value) return '-';
    const num = parseFloat(value);
    if (currency === 'INR') {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const exportToCSV = () => {
    const headers = ['Proposal ID', 'Title', 'Client', 'Status', 'Value', 'Currency', 'Submission Date', 'Expected Decision'];
    const csvData = [
      headers,
      ...filteredProposals.map(proposal => [
        proposal.proposal_id,
        proposal.proposal_title,
        proposal.client_name,
        proposal.current_status,
        proposal.estimated_value || '0',
        proposal.currency || 'INR',
        formatDate(proposal.proposal_date),
        formatDate(proposal.expected_decision_date)
      ])
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `proposals_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Convert proposal to project (NEW FLOW: leads -> proposals -> projects)
  const convertProposalToProject = async (proposalId) => {
    setConvertingToLead(true); // Reusing the loading state
    try {
      const response = await fetch('/api/proposals/convert-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ proposalId })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert(`Successfully converted to project! Project ID: ${result.project_id}`);
        // Update the proposal status locally if needed
        setProposals(prev => prev.map(p => 
          p.id === proposalId 
            ? { ...p, current_status: 'Converted to Project' }
            : p
        ));
      } else {
        throw new Error(result.error || 'Failed to convert to project');
      }
    } catch (error) {
      console.error('Error converting to project:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setConvertingToLead(false);
    }
  };

  // Delete proposal
  const deleteProposal = async (proposalId, proposalTitle) => {
    if (!confirm(`Are you sure you want to delete the proposal "${proposalTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Proposal deleted successfully!');
        // Remove the proposal from the local state
        setProposals(prev => prev.filter(p => p.id !== proposalId));
      } else {
        throw new Error(result.error || 'Failed to delete proposal');
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Convert lead to project
  const convertToProject = async (leadId) => {
    setConvertingToProject(true);
    try {
      const response = await fetch('/api/leads/convert-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setConversionStep('project');
        alert(`Successfully converted to project! Project ID: ${result.project_number}`);
        // Refresh proposals list to update statuses
        await fetchProposals();
      } else {
        throw new Error(result.error || 'Failed to convert to project');
      }
    } catch (error) {
      console.error('Error converting to project:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setConvertingToProject(false);
    }
  };

  // Open conversion modal
  const openConversionModal = (proposal) => {
    setSelectedProposal(proposal);
    setShowConvertModal(true);
    setConversionStep('proposal');
    setLeadId(null);
  };

  // Close conversion modal
  const closeConversionModal = () => {
    setShowConvertModal(false);
    setSelectedProposal(null);
    setConversionStep('proposal');
    setLeadId(null);
  };

  if (!user) return null;

  const getStatusColor = (status) => {
    const colors = {
      'Draft': '#6b7280',
      'Submitted': '#3b82f6', 
      'Under Discussion': '#f59e0b',
      'Awaiting Response': '#8b5cf6',
      'Awarded': '#10b981',
      'Lost': '#ef4444',
      'Closed': '#64748b'
    };
    return colors[status] || '#6b7280';
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesStatus = statusFilter === 'All' || proposal.current_status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      proposal.proposal_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proposal.proposal_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  if (!user) return null;

  return (
    <div className="proposals-page">
      <Navigation user={user} />
      
      <main className="proposals-main">
        <div className="proposals-container">
          {/* Modern Header Section */}
          <div className="modern-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">Proposals Management</h1>
                <p className="page-subtitle">Manage and track all your business proposals</p>
              </div>
              <div className="header-actions">
                <Link href="/proposals/new" className="action-btn primary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  New Proposal
                </Link>
                <button className="action-btn secondary" onClick={exportToCSV}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading proposals...</p>
              </div>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-content">
                <p className="error-text">{error}</p>
                <button onClick={fetchProposals} className="action-btn secondary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Modern Stats Grid */}
              <div className="stats-section">
                <div className="stats-grid">
                  <div className="stat-card primary">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.total}</div>
                      <div className="stat-label">Total Proposals</div>
                      <div className="stat-change neutral">All proposals</div>
                    </div>
                  </div>

                  <div className="stat-card warning">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.pending}</div>
                      <div className="stat-label">Pending Review</div>
                      <div className="stat-change neutral">Awaiting response</div>
                    </div>
                  </div>

                  <div className="stat-card success">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 101.946 1.946l1.999 3.46a11.952 11.952 0 00-8.91l-3.44-1.999a3.42 3.42 0 00-1.946z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{stats.awarded}</div>
                      <div className="stat-label">Awarded</div>
                      <div className="stat-change positive">{formatCurrency(stats.totalValue)}</div>
                    </div>
                  </div>

                  <div className="stat-card info">
                    <div className="stat-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="stat-content">
                      <div className="stat-value">{((stats.awarded / (stats.total || 1)) * 100).toFixed(1)}%</div>
                      <div className="stat-label">Success Rate</div>
                      <div className="stat-change positive">Win ratio</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Filters */}
              <div className="filters-section">
                <div className="filter-card">
                  <div className="filter-header">
                    <h3>Filter Proposals</h3>
                  </div>
                  <div className="filter-controls">
                    <select 
                      className="modern-select" 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Submitted">Submitted</option>
                      <option value="Under Discussion">Under Discussion</option>
                      <option value="Awaiting Response">Awaiting Response</option>
                      <option value="Awarded">Awarded</option>
                      <option value="Lost">Lost</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modern Proposals Table */}
              <div className="content-card proposals-list">
                <div className="card-header">
                  <h2 className="card-title">
                    <div className="title-icon">
                      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Recent Proposals
                  </h2>
                  <div className="card-actions">
                    <input 
                      type="text" 
                      placeholder="Search proposals..." 
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="view-all-btn" onClick={() => setSearchQuery('')}>
                      Clear
                    </button>
                  </div>
                </div>

                <div className="card-content">
                  {filteredProposals.length === 0 ? (
                    <div className="empty-state">
                      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>No proposals found</p>
                    </div>
                  ) : (
                    <div className="modern-table">
                      <div className="table-header-row">
                        <div className="table-cell">Proposal</div>
                        <div className="table-cell">Client</div>
                        <div className="table-cell">Value</div>
                        <div className="table-cell">Status</div>
                        <div className="table-cell">Date</div>
                        <div className="table-cell">Actions</div>
                      </div>
                      
                      {filteredProposals.slice(0, 10).map((proposal) => (
                        <div key={proposal.id} className="table-row">
                          <div className="table-cell proposal-info" data-label="Proposal">
                            <div className="proposal-details">
                              <div className="proposal-id">{proposal.proposal_id}</div>
                              <div className="proposal-title">{proposal.proposal_title}</div>
                              <div className="proposal-type">{proposal.project_type || 'General'}</div>
                            </div>
                          </div>
                          
                          <div className="table-cell" data-label="Client">
                            <div className="client-info">
                              <div className="client-name">{proposal.client_name}</div>
                            </div>
                          </div>
                          
                          <div className="table-cell" data-label="Value">
                            <div className="value-info">
                              <div className="proposal-value">{formatCurrency(proposal.estimated_value, proposal.currency)}</div>
                            </div>
                          </div>
                          
                          <div className="table-cell" data-label="Status">
                            <span className={`modern-status-badge status-${proposal.current_status?.toLowerCase().replace(/ /g, '-')}`}>
                              {proposal.current_status}
                            </span>
                          </div>
                          
                          <div className="table-cell" data-label="Date">
                            <div className="date-info">
                              <div className="submission-date">{formatDate(proposal.proposal_date)}</div>
                              <div className="decision-date">Due: {formatDate(proposal.expected_decision_date)}</div>
                            </div>
                          </div>
                          
                          <div className="table-cell" data-label="Actions">
                            <div className="action-buttons">
                              <button 
                                className="action-btn-small primary"
                                title="View Details"
                                onClick={() => router.push(`/proposals/${proposal.id}`)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              
                              <button 
                                className="action-btn-small secondary"
                                title="Edit Proposal"
                                onClick={() => router.push(`/proposals/edit/${proposal.id}`)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              
                              <button 
                                className="action-btn-small danger"
                                title="Delete Proposal"
                                onClick={() => deleteProposal(proposal.id, proposal.proposal_title)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                              
                              {(proposal.current_status === 'Awarded' || proposal.current_status === 'Submitted') && (
                                <button 
                                  className="action-btn-small success"
                                  title="Convert to Project"
                                  onClick={() => convertProposalToProject(proposal.id)}
                                  disabled={convertingToLead}
                                >
                                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Conversion Modal */}
      {showConvertModal && selectedProposal && (
        <div className="modal-overlay" onClick={closeConversionModal}>
          <div className="conversion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Convert Proposal to Project</h3>
              <button className="modal-close" onClick={closeConversionModal}>×</button>
            </div>
            
            <div className="conversion-workflow">
              <div className="workflow-steps">
                <div className={`workflow-step ${conversionStep === 'proposal' ? 'active' : conversionStep === 'lead' || conversionStep === 'project' ? 'completed' : ''}`}>
                  <div className="step-icon">1</div>
                  <span>Proposal</span>
                </div>
                <div className="workflow-arrow">→</div>
                <div className={`workflow-step ${conversionStep === 'lead' ? 'active' : conversionStep === 'project' ? 'completed' : ''}`}>
                  <div className="step-icon">2</div>
                  <span>Lead</span>
                </div>
                <div className="workflow-arrow">→</div>
                <div className={`workflow-step ${conversionStep === 'project' ? 'active completed' : ''}`}>
                  <div className="step-icon">3</div>
                  <span>Project</span>
                </div>
              </div>

              <div className="conversion-content">
                <div className="proposal-details">
                  <h4>{selectedProposal.proposal_title}</h4>
                  <p><strong>Client:</strong> {selectedProposal.client_name}</p>
                  <p><strong>Value:</strong> {formatCurrency(selectedProposal.estimated_value, selectedProposal.currency)}</p>
                  <p><strong>Status:</strong> {selectedProposal.current_status}</p>
                </div>

                <div className="conversion-actions">
                  {conversionStep === 'proposal' && (
                    <div className="step-content">
                      <p>First, convert this awarded proposal to a lead for pipeline tracking.</p>
                      <button 
                        className="btn-primary"
                        onClick={() => convertToLead(selectedProposal.id)}
                        disabled={convertingToLead}
                      >
                        {convertingToLead ? 'Converting to Lead...' : 'Convert to Lead'}
                      </button>
                    </div>
                  )}

                  {conversionStep === 'lead' && leadId && (
                    <div className="step-content">
                      <p>✅ Successfully converted to lead! Now convert to project for execution tracking.</p>
                      <button 
                        className="btn-primary"
                        onClick={() => convertToProject(leadId)}
                        disabled={convertingToProject}
                      >
                        {convertingToProject ? 'Converting to Project...' : 'Convert to Project'}
                      </button>
                    </div>
                  )}

                  {conversionStep === 'project' && (
                    <div className="step-content">
                      <p>🎉 Successfully converted to project! The proposal is now in your project management system.</p>
                      <button className="btn-secondary" onClick={closeConversionModal}>
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
