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

  const filteredProposals = statusFilter === 'All' 
    ? proposals 
    : proposals.filter(p => p.current_status === statusFilter);

  if (!user) return null;

  return (
    <div className="proposals-page">
      <Navigation user={user} />
      
      <main className="proposals-main">
        <div className="proposals-container">
          {/* Header Section */}
          <div className="proposals-header">
            <div className="header-content">
              <h1>Proposals Dashboard</h1>
            </div>
            <div className="header-actions">
              <Link href="/proposals/new" className="btn-primary">
                <span>+</span>
                New Proposal
              </Link>
              <button className="btn-secondary">
                Export
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="proposals-filters">
            <select 
              className="filter-select" 
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

        {loading ? (
          <div className="loading-state">
            <p>Loading proposals...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={fetchProposals} className="btn-secondary">Retry</button>
          </div>
        ) : (
          <>
            <div className="proposals-stats">
              <div className="stat-card">
                <div className="stat-icon" style={{backgroundColor: '#f0f9ff'}}>
                  <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 71.707.293l5.414 5.414a1 1 0 71.293.707V19a2 2 0 71-2 2z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Total Proposals</h3>
                  <p className="stat-number">{stats.total}</p>
                  <span className="stat-change neutral">Active proposals</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{backgroundColor: '#fef3c7'}}>
                  <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 1118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Pending</h3>
                  <p className="stat-number">{stats.pending}</p>
                  <span className="stat-change neutral">Under Review</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{backgroundColor: '#d1fae5'}}>
                  <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 701.946 1.946l1.999 3.46a11.952 11.952 0 90-8.91l-3.44-1.999a3.42 3.42 0 70-1.946z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Awarded</h3>
                  <p className="stat-number">{stats.awarded}</p>
                  <span className="stat-change positive">{formatCurrency(stats.totalValue)} Value</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{backgroundColor: '#fee2e2'}}>
                  <svg width="24" height="24" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3>Lost/Closed</h3>
                  <p className="stat-number">{stats.lost}</p>
                  <span className="stat-change negative">Analysis needed</span>
                </div>
              </div>
            </div>

            <div className="proposals-table-container">
              <div className="table-header">
                <h2>Recent Proposals</h2>
                <div className="table-actions">
                  <input 
                    type="text" 
                    placeholder="Search proposals..." 
                    className="search-input"
                  />
                  <button className="btn-secondary">Export</button>
                </div>
              </div>

              <div className="proposals-table">
                <table>
                  <thead>
                    <tr>
                      <th>Proposal ID</th>
                      <th>Title</th>
                      <th>Client</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Submission Date</th>
                      <th>Expected Decision</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.map((proposal) => (
                      <tr key={proposal.id}>
                        <td>
                          <span className="proposal-id">{proposal.proposal_id}</span>
                        </td>
                        <td>
                          <div className="proposal-title">
                            <p>{proposal.proposal_title}</p>
                            <span className="sector-tag">{proposal.project_type || 'General'}</span>
                          </div>
                        </td>
                        <td>{proposal.client_name}</td>
                        <td className="value-cell">{formatCurrency(proposal.estimated_value, proposal.currency)}</td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{backgroundColor: getStatusColor(proposal.current_status)}}
                          >
                            {proposal.current_status}
                          </span>
                        </td>
                        <td>{formatDate(proposal.proposal_date)}</td>
                        <td>{formatDate(proposal.expected_decision_date)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              title="View Details"
                              onClick={() => router.push(`/proposals/${proposal.id}`)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 716 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon"
                              title="Edit"
                              onClick={() => router.push(`/proposals/edit/${proposal.id}`)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {proposal.current_status !== 'Draft' && (
                              <button 
                                className="btn-convert"
                                title="Convert to Project"
                                onClick={() => convertProposalToProject(proposal.id)}
                                disabled={convertingToLead}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                {convertingToLead ? 'Converting...' : 'To Project'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {proposals.length === 0 && (
                  <div className="empty-state">
                    <>No proposals found. Create your first proposal to get started.</>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        </div> {/* Close proposals-container */}
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
