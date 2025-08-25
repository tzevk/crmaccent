'use client';

import { useState, useEffect } from 'react';
import './LeadToProposalConverter.css';

export default function LeadToProposalConverter({ lead, onConversionSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: `Proposal for ${lead?.company_name || lead?.contact_person || ''}`,
    project_name: `${lead?.company_name || lead?.contact_person || ''} Project`,
    project_type: 'General',
    project_description: lead?.requirements || lead?.enquiry_details || '',
    budget_range: lead?.budget || '',
    timeline: '30 days',
    priority: 'medium',
    assigned_to: lead?.assigned_to || '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversionStatus, setConversionStatus] = useState(null);

  // Check if lead is already converted
  useEffect(() => {
    checkConversionStatus();
  }, [lead?.id]);

  const checkConversionStatus = async () => {
    if (!lead?.id) return;

    try {
      const response = await fetch(`/api/proposals/convert-lead?leadId=${lead.id}`);
      const data = await response.json();
      setConversionStatus(data);
    } catch (error) {
      console.error('Error checking conversion status:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proposals/convert-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          proposalData: formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onConversionSuccess?.(data.proposal, lead.id);
      } else {
        setError(data.error || 'Failed to convert lead to proposal');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error converting lead:', error);
    } finally {
      setLoading(false);
    }
  };

  if (conversionStatus?.isConverted) {
    return (
      <div className="conversion-status">
        <div className="status-header">
          <div className="status-icon success">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="status-content">
            <h3>Lead Already Converted</h3>
            <p>This lead has already been converted to proposal(s).</p>
          </div>
        </div>
        <div className="existing-proposals">
          {conversionStatus.proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <h4>{proposal.proposal_title}</h4>
              <div className="proposal-meta">
                <span className={`status ${proposal.current_status.toLowerCase().replace(/\s+/g, '_')}`}>
                  {proposal.current_status}
                </span>
                <span className="date">
                  Created: {new Date(proposal.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="status-actions">
          <button onClick={onCancel} className="btn btn-secondary">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-to-proposal-converter">
      <div className="converter-header">
        <h2>Convert Lead to Proposal</h2>
        <p>Transform this lead into a structured proposal for better project management</p>
      </div>

      {/* Lead Information Summary */}
      <div className="lead-summary">
        <h3>Lead Information</h3>
        <div className="lead-details">
          <div className="detail-row">
            <strong>Contact:</strong> {lead?.contact_person || 'N/A'}
          </div>
          <div className="detail-row">
            <strong>Company:</strong> {lead?.company_name || 'N/A'}
          </div>
          <div className="detail-row">
            <strong>Email:</strong> {lead?.email || 'N/A'}
          </div>
          <div className="detail-row">
            <strong>Phone:</strong> {lead?.phone || 'N/A'}
          </div>
          <div className="detail-row">
            <strong>Requirements:</strong> {lead?.requirements || lead?.enquiry_details || 'N/A'}
          </div>
        </div>
      </div>

      <form onSubmit={handleConvert} className="conversion-form">
        <div className="form-section">
          <h3>Proposal Details</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Proposal Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project_name">Project Name *</label>
              <input
                type="text"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="project_type">Project Type</label>
              <select
                id="project_type"
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="General">General</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Software Development">Software Development</option>
                <option value="Consulting">Consulting</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project_description">Project Description *</label>
              <textarea
                id="project_description"
                name="project_description"
                value={formData.project_description}
                onChange={handleInputChange}
                required
                rows="4"
                className="form-textarea"
                placeholder="Describe the project requirements and objectives..."
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget_range">Budget Range</label>
              <input
                type="text"
                id="budget_range"
                name="budget_range"
                value={formData.budget_range}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., $10,000 - $25,000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="timeline">Timeline</label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., 30 days"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="assigned_to">Assigned To</label>
              <input
                type="text"
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Team member name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="notes">Additional Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="form-textarea"
                placeholder="Any additional notes or requirements..."
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Converting...
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Convert to Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
