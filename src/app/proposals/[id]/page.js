'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../components/navigation/Navigation';
import '../view/proposals-view.css';

export default function ProposalViewPage() {
  const [user, setUser] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    
    if (params.id) {
      fetchProposal();
    }
  }, [router, params.id]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/proposals/${params.id}`);
      
      if (!response.ok) {
        throw new Error('Proposal not found');
      }
      
      const data = await response.json();
      setProposal(data);
      
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setError('Failed to load proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToProject = async () => {
    try {
      const response = await fetch('/api/proposals/convert-to-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          proposalId: params.id,
          projectData: {
            start_date: new Date().toISOString().split('T')[0],
            expected_completion_date: null
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`🎉 Proposal successfully converted to project!\n\nProject ID: ${result.project_id}\n\nThe project has been created with:\n• Basic project setup\n• Initial milestones\n• Task templates\n\nYou can now manage this project from the Projects section.`);
        fetchProposal(); // Refresh proposal data
        setShowConvertModal(false);
      } else {
        alert(`❌ Failed to convert proposal: ${result.error}`);
      }
    } catch (error) {
      console.error('Error converting proposal:', error);
      alert('⚠️ Failed to convert proposal. Please try again.');
    }
  };

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

  const formatCurrency = (value, currency = 'INR') => {
    if (!value) return '-';
    const num = parseFloat(value);
    if (currency === 'INR') {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="proposal-view-page">
        <Navigation user={user} />
        <main className="proposal-view-main">
          <div className="loading-state">
            <p>Loading proposal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="proposal-view-page">
        <Navigation user={user} />
        <main className="proposal-view-main">
          <div className="error-state">
            <p>{error || 'Proposal not found'}</p>
            <Link href="/proposals" className="btn-primary">
              Back to Proposals
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="proposal-view-page">
      <Navigation user={user} />
      
      <main className="proposal-view-main">
        <div className="proposal-view-container">
          {/* Header Section */}
          <div className="proposal-view-header">
            <div className="header-content">
              <div className="header-top">
                <Link href="/proposals" className="back-link">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Proposals
                </Link>
                <div className="proposal-status">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: `${getStatusColor(proposal.current_status)}15`,
                      color: getStatusColor(proposal.current_status),
                      border: `1px solid ${getStatusColor(proposal.current_status)}30`
                    }}
                  >
                    {proposal.current_status}
                  </span>
                </div>
              </div>
              <h1>{proposal.proposal_title}</h1>
              <p>Proposal ID: {proposal.proposal_id}</p>
            </div>
            <div className="header-actions">
              <Link href={`/proposals/edit/${proposal.id}`} className="btn-secondary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Proposal
              </Link>
              {proposal.current_status === 'Awarded' && !proposal.is_converted_to_project && (
                <button 
                  className="btn-primary"
                  onClick={() => setShowConvertModal(true)}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Convert to Project
                </button>
              )}
              {proposal.is_converted_to_project && (
                <span className="converted-indicator">
                  ✓ Converted to Project: {proposal.project_id}
                </span>
              )}
            </div>
          </div>

          <div className="proposal-content">
            {/* Basic Information */}
            <div className="info-section">
              <h2>Basic Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Proposal Date</label>
                  <span>{formatDate(proposal.proposal_date)}</span>
                </div>
                <div className="info-item">
                  <label>Prepared By</label>
                  <span>{proposal.prepared_by || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <span>{proposal.department || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Proposal Owner</label>
                  <span>{proposal.proposal_owner || '-'}</span>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="info-section">
              <h2>Client Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Client Name</label>
                  <span>{proposal.client_name}</span>
                </div>
                <div className="info-item">
                  <label>Contact Person</label>
                  <span>{proposal.contact_person}</span>
                </div>
                <div className="info-item">
                  <label>Designation</label>
                  <span>{proposal.designation || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{proposal.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone</label>
                  <span>{proposal.phone_number || '-'}</span>
                </div>
                <div className="info-item full-width">
                  <label>Address</label>
                  <span>{proposal.address || '-'}</span>
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="info-section">
              <h2>Project Details</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Project Name</label>
                  <span>{proposal.project_name}</span>
                </div>
                <div className="info-item">
                  <label>Project Type</label>
                  <span>{proposal.project_type || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Estimated Value</label>
                  <span>{formatCurrency(proposal.estimated_value, proposal.currency)}</span>
                </div>
                <div className="info-item">
                  <label>Estimated Duration</label>
                  <span>{proposal.estimated_duration || '-'}</span>
                </div>
                <div className="info-item full-width">
                  <label>Scope of Work</label>
                  <span className="scope-text">{proposal.scope_of_work}</span>
                </div>
              </div>
            </div>

            {/* Timeline & Status */}
            <div className="info-section">
              <h2>Timeline & Status</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Submission Mode</label>
                  <span>{proposal.submission_mode || '-'}</span>
                </div>
                <div className="info-item">
                  <label>Follow-up Date</label>
                  <span>{formatDate(proposal.follow_up_date)}</span>
                </div>
                <div className="info-item">
                  <label>Expected Decision</label>
                  <span>{formatDate(proposal.expected_decision_date)}</span>
                </div>
                <div className="info-item">
                  <label>Created</label>
                  <span>{formatDate(proposal.created_at)}</span>
                </div>
                {proposal.internal_notes && (
                  <div className="info-item full-width">
                    <label>Internal Notes</label>
                    <span className="notes-text">{proposal.internal_notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Convert to Project Modal */}
      {showConvertModal && (
        <div className="modal-overlay" onClick={() => setShowConvertModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🚀 Convert Proposal to Project</h3>
              <div className="conversion-info">
                <p><strong>Proposal:</strong> {proposal.proposal_title}</p>
                <p><strong>Client:</strong> {proposal.client_name}</p>
                <p><strong>Value:</strong> {formatCurrency(proposal.estimated_value, proposal.currency)}</p>
              </div>
            </div>
            
            <div className="modal-body">
              <div className="conversion-benefits">
                <h4>✨ What happens when you convert:</h4>
                <ul>
                  <li>📋 <strong>Project Setup:</strong> Automatic project creation with all proposal details</li>
                  <li>🎯 <strong>Milestones:</strong> Initial project milestones will be generated</li>
                  <li>📝 <strong>Tasks:</strong> Essential project tasks will be created</li>
                  <li>👥 <strong>Team Management:</strong> Ready for team allocation and resource planning</li>
                  <li>📊 <strong>Tracking:</strong> Progress tracking and reporting capabilities</li>
                </ul>
              </div>
              
              <div className="conversion-warning">
                <p>⚠️ <strong>Note:</strong> This action cannot be undone. The proposal will be marked as converted and linked to the new project.</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowConvertModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary conversion-btn"
                onClick={handleConvertToProject}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Convert to Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
