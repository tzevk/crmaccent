'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '../../../../components/navigation/Navigation';
import './proposal-edit.css';

export default function ProposalEditPage() {
  const [user, setUser] = useState(null);
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
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
      setFormData(data);
      
    } catch (error) {
      console.error('Error fetching proposal:', error);
      setError('Failed to load proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    const requiredFields = [
      'proposal_title',
      'client_name',
      'contact_person',
      'email',
      'project_name',
      'estimated_value',
      'current_status'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone_number && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number';
    }
    
    // Estimated value validation
    if (formData.estimated_value && isNaN(parseFloat(formData.estimated_value))) {
      errors.estimated_value = 'Please enter a valid amount';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await fetch(`/api/proposals/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert('Proposal updated successfully!');
        router.push(`/proposals/${params.id}`);
      } else {
        const errorData = await response.json();
        alert(`Failed to update proposal: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error saving proposal:', error);
      alert('Failed to save proposal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="proposal-edit-page">
        <Navigation user={user} />
        <main className="proposal-edit-main">
          <div className="loading-state">
            <p>Loading proposal...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="proposal-edit-page">
        <Navigation user={user} />
        <main className="proposal-edit-main">
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
    <div className="proposal-edit-page">
      <Navigation user={user} />
      
      <main className="proposal-edit-main">
        <div className="proposal-edit-container">
          {/* Header Section */}
          <div className="proposal-edit-header">
            <div className="header-content">
              <Link href={`/proposals/${params.id}`} className="back-link">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Proposal
              </Link>
              <h1>Edit Proposal</h1>
              <p>Proposal ID: {proposal.proposal_id}</p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary"
                onClick={() => router.push(`/proposals/${params.id}`)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Form Sections */}
          <div className="proposal-edit-form">
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Proposal Title *</label>
                  <input
                    type="text"
                    value={formData.proposal_title || ''}
                    onChange={(e) => handleInputChange('proposal_title', e.target.value)}
                    className={validationErrors.proposal_title ? 'error' : ''}
                  />
                  {validationErrors.proposal_title && (
                    <span className="error-text">{validationErrors.proposal_title}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Proposal Date</label>
                  <input
                    type="date"
                    value={formatDate(formData.proposal_date)}
                    onChange={(e) => handleInputChange('proposal_date', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Prepared By</label>
                  <input
                    type="text"
                    value={formData.prepared_by || ''}
                    onChange={(e) => handleInputChange('prepared_by', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Proposal Owner</label>
                  <input
                    type="text"
                    value={formData.proposal_owner || ''}
                    onChange={(e) => handleInputChange('proposal_owner', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Current Status *</label>
                  <select
                    value={formData.current_status || ''}
                    onChange={(e) => handleInputChange('current_status', e.target.value)}
                    className={validationErrors.current_status ? 'error' : ''}
                  >
                    <option value="">Select Status</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Discussion">Under Discussion</option>
                    <option value="Awaiting Response">Awaiting Response</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Lost">Lost</option>
                    <option value="Closed">Closed</option>
                  </select>
                  {validationErrors.current_status && (
                    <span className="error-text">{validationErrors.current_status}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="form-section">
              <h2>Client Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Client Name *</label>
                  <input
                    type="text"
                    value={formData.client_name || ''}
                    onChange={(e) => handleInputChange('client_name', e.target.value)}
                    className={validationErrors.client_name ? 'error' : ''}
                  />
                  {validationErrors.client_name && (
                    <span className="error-text">{validationErrors.client_name}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Contact Person *</label>
                  <input
                    type="text"
                    value={formData.contact_person || ''}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                    className={validationErrors.contact_person ? 'error' : ''}
                  />
                  {validationErrors.contact_person && (
                    <span className="error-text">{validationErrors.contact_person}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    value={formData.designation || ''}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={validationErrors.email ? 'error' : ''}
                  />
                  {validationErrors.email && (
                    <span className="error-text">{validationErrors.email}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    className={validationErrors.phone_number ? 'error' : ''}
                  />
                  {validationErrors.phone_number && (
                    <span className="error-text">{validationErrors.phone_number}</span>
                  )}
                </div>
                
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows="3"
                  />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="form-section">
              <h2>Project Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Project Name *</label>
                  <input
                    type="text"
                    value={formData.project_name || ''}
                    onChange={(e) => handleInputChange('project_name', e.target.value)}
                    className={validationErrors.project_name ? 'error' : ''}
                  />
                  {validationErrors.project_name && (
                    <span className="error-text">{validationErrors.project_name}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Project Type</label>
                  <input
                    type="text"
                    value={formData.project_type || ''}
                    onChange={(e) => handleInputChange('project_type', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Estimated Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimated_value || ''}
                    onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                    className={validationErrors.estimated_value ? 'error' : ''}
                  />
                  {validationErrors.estimated_value && (
                    <span className="error-text">{validationErrors.estimated_value}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={formData.currency || 'INR'}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Estimated Duration</label>
                  <input
                    type="text"
                    value={formData.estimated_duration || ''}
                    onChange={(e) => handleInputChange('estimated_duration', e.target.value)}
                    placeholder="e.g., 6 months"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Scope of Work</label>
                  <textarea
                    value={formData.scope_of_work || ''}
                    onChange={(e) => handleInputChange('scope_of_work', e.target.value)}
                    rows="5"
                    placeholder="Describe the project scope and deliverables..."
                  />
                </div>
              </div>
            </div>

            {/* Timeline & Follow-up */}
            <div className="form-section">
              <h2>Timeline & Follow-up</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Submission Mode</label>
                  <select
                    value={formData.submission_mode || ''}
                    onChange={(e) => handleInputChange('submission_mode', e.target.value)}
                  >
                    <option value="">Select Mode</option>
                    <option value="Email">Email</option>
                    <option value="Online Portal">Online Portal</option>
                    <option value="Physical Submission">Physical Submission</option>
                    <option value="Presentation">Presentation</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    value={formatDate(formData.follow_up_date)}
                    onChange={(e) => handleInputChange('follow_up_date', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label>Expected Decision Date</label>
                  <input
                    type="date"
                    value={formatDate(formData.expected_decision_date)}
                    onChange={(e) => handleInputChange('expected_decision_date', e.target.value)}
                  />
                </div>
                
                <div className="form-group full-width">
                  <label>Internal Notes</label>
                  <textarea
                    value={formData.internal_notes || ''}
                    onChange={(e) => handleInputChange('internal_notes', e.target.value)}
                    rows="4"
                    placeholder="Add internal notes, comments, or reminders..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
