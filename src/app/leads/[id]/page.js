'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import '../leads.css';
import './lead-detail.css';

export default function LeadDetailPage({ params }) {
  const [user, setUser] = useState(null);
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupData, setFollowupData] = useState({
    followup_date: '',
    description: '',
    next_action: ''
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchLead();
  }, []);

  const fetchLead = async () => {
    try {
      setLoading(true);
      const { id } = await params;
      const response = await fetch(`/api/leads/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch lead`);
      }
      
      const leadData = await response.json();
      setLead(leadData);
      
    } catch (error) {
      console.error('Error fetching lead:', error);
      setError('Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency = 'INR') => {
    if (!value) return 'Not specified';
    const num = parseFloat(value);
    if (currency === 'INR') {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      'New': '#3b82f6',
      'Qualified': '#f59e0b',
      'Proposal Sent': '#8b5cf6',
      'Negotiation': '#06b6d4',
      'Closed-Won': '#10b981',
      'Closed-Lost': '#ef4444'
    };
    return colors[stage] || '#6b7280';
  };

  const addFollowup = async (e) => {
    e.preventDefault();
    try {
      const { id } = await params;
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...followupData,
          lead_id: id,
          created_by: user?.id || 1
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Follow-up added successfully!');
        setShowFollowupModal(false);
        setFollowupData({
          followup_date: '',
          description: '',
          next_action: ''
        });
        fetchLead(); // Refresh lead data
      } else {
        throw new Error(result.error || 'Failed to add follow-up');
      }
    } catch (error) {
      console.error('Error adding follow-up:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="leads-page">
        <Navigation user={user} />
        <main className="leads-main">
          <div className="loading-state">
            <p>Loading lead details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leads-page">
        <Navigation user={user} />
        <main className="leads-main">
          <div className="error-state">
            <p>{error}</p>
            <Link href="/leads" className="btn-secondary">Back to Leads</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="leads-page">
      <Navigation user={user} />
      
      <main className="leads-main">
        <div className="leads-container">
          {/* Header */}
          <div className="lead-detail-header">
            <div className="header-content">
              <Link href="/leads" className="back-link">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Leads
              </Link>
              <div className="lead-title">
                <h1>{lead.company_name}</h1>
                <span className="enquiry-number">{lead.enquiry_no}</span>
              </div>
              <div className="lead-status">
                <span 
                  className="stage-badge" 
                  style={{backgroundColor: getStageColor(lead.lead_stage)}}
                >
                  {lead.lead_stage}
                </span>
              </div>
            </div>
            <div className="header-actions">
              <Link href={`/leads/edit/${lead.id}`} className="btn-primary">
                Edit Lead
              </Link>
              <button 
                className="btn-secondary"
                onClick={() => setShowFollowupModal(true)}
              >
                Add Follow-up
              </button>
              {lead.lead_stage === 'Qualified' && (
                <Link href={`/proposals/new?leadId=${lead.id}`} className="btn-convert">
                  Create Proposal
                </Link>
              )}
            </div>
          </div>

          <div className="lead-detail-content">
            {/* Lead Information Cards */}
            <div className="info-cards">
              {/* Company Information */}
              <div className="info-card">
                <h3>Company Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Company Name</label>
                    <span>{lead.company_name}</span>
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <span>{lead.city || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Industry</label>
                    <span>{lead.industry || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Address</label>
                    <span>{lead.address || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="info-card">
                <h3>Contact Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Contact Person</label>
                    <span>{lead.contact_name}</span>
                  </div>
                  <div className="info-item">
                    <label>Designation</label>
                    <span>{lead.designation || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Mobile</label>
                    <span>{lead.mobile || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span>{lead.email || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="info-card">
                <h3>Project Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Project Name</label>
                    <span>{lead.project_name || 'TBD'}</span>
                  </div>
                  <div className="info-item">
                    <label>Project Description</label>
                    <span>{lead.project_description || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <label>Estimated Value</label>
                    <span>{formatCurrency(lead.estimated_value, lead.currency)}</span>
                  </div>
                  <div className="info-item">
                    <label>Duration</label>
                    <span>{lead.estimated_duration ? `${lead.estimated_duration} months` : 'Not specified'}</span>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="info-card">
                <h3>Lead Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Enquiry Date</label>
                    <span>{formatDate(lead.enquiry_date)}</span>
                  </div>
                  <div className="info-item">
                    <label>Enquiry Type</label>
                    <span>{lead.enquiry_type}</span>
                  </div>
                  <div className="info-item">
                    <label>Source</label>
                    <span>{lead.source || 'Direct'}</span>
                  </div>
                  <div className="info-item">
                    <label>Assigned To</label>
                    <span>{lead.assigned_to_name || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Follow-ups Timeline */}
            <div className="followups-section">
              <h3>Follow-up History</h3>
              {lead.followups && lead.followups.length > 0 ? (
                <div className="followups-timeline">
                  {lead.followups.map((followup) => (
                    <div key={followup.id} className="followup-item">
                      <div className="followup-date">
                        {formatDate(followup.followup_date)}
                      </div>
                      <div className="followup-content">
                        <p>{followup.description}</p>
                        {followup.next_action && (
                          <div className="next-action">
                            <strong>Next Action:</strong> {followup.next_action}
                          </div>
                        )}
                        <div className="followup-meta">
                          Added by {followup.created_by_name || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-followups">
                  <p>No follow-ups recorded yet.</p>
                  <button 
                    className="btn-primary"
                    onClick={() => setShowFollowupModal(true)}
                  >
                    Add First Follow-up
                  </button>
                </div>
              )}
            </div>

            {/* Remarks */}
            {lead.remarks && (
              <div className="remarks-section">
                <h3>Remarks</h3>
                <div className="remarks-content">
                  <p>{lead.remarks}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Follow-up Modal */}
      {showFollowupModal && (
        <div className="modal-overlay" onClick={() => setShowFollowupModal(false)}>
          <div className="followup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Follow-up</h3>
              <button className="modal-close" onClick={() => setShowFollowupModal(false)}>×</button>
            </div>
            <form onSubmit={addFollowup} className="followup-form">
              <div className="form-group">
                <label htmlFor="followup_date">Follow-up Date *</label>
                <input
                  type="date"
                  id="followup_date"
                  name="followup_date"
                  value={followupData.followup_date}
                  onChange={(e) => setFollowupData({...followupData, followup_date: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={followupData.description}
                  onChange={(e) => setFollowupData({...followupData, description: e.target.value})}
                  rows="4"
                  placeholder="What was discussed or done..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="next_action">Next Action</label>
                <input
                  type="text"
                  id="next_action"
                  name="next_action"
                  value={followupData.next_action}
                  onChange={(e) => setFollowupData({...followupData, next_action: e.target.value})}
                  placeholder="Next steps or action items..."
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowFollowupModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
