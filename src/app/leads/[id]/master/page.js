
"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationMinimal from '@/components/navigation/Navigation';
import '../../leads.css';
import './master-compact.css';

export default function LeadMasterDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [followups, setFollowups] = useState([]);
  const [showFollowupForm, setShowFollowupForm] = useState(false);
  const [newFollowup, setNewFollowup] = useState({
    type: '',
    description: '',
    scheduled_date: '',
    priority: 'Medium'
  });

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'contact', label: 'Contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'qualification', label: 'Qualification', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'engagement', label: 'Engagement', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m5-3V3a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' },
    { id: 'scoring', label: 'Scoring', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { id: 'conversion', label: 'Conversion', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'additional', label: 'Additional', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4' },
    { id: 'followups', label: 'Follow-ups', icon: 'M8 7V3a4 4 0 118 0v4m-4 6V9a4 4 0 00-8 0v2m0 0V9a4 4 0 018 0v2m-4 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  useEffect(() => {
    async function fetchLead() {
      setLoading(true);
      try {
        const res = await fetch(`/api/leads/${id}`);
        if (!res.ok) throw new Error('Failed to fetch lead');
        const data = await res.json();
        setLead(data);
        setFollowups(data.followups || []);
      } catch (e) {
        setError('Lead not found.');
        setLead(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchLead();
  }, [id]);

  // Editing functions
  const handleEdit = () => {
    setEditForm({...lead});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Prepare the data with proper field mapping
      const updateData = {
        ...editForm,
        // Map any alternative field names
        enquiry_date: editForm.enquiry_date || lead.enquiry_date,
        enquiry_type: editForm.enquiry_type || lead.enquiry_type,
        project_name: editForm.project_name || lead.project_name,
        project_description: editForm.project_description || lead.project_description,
        estimated_duration: editForm.estimated_duration || lead.estimated_duration,
        currency: editForm.currency || lead.currency,
        enquiry_status: editForm.enquiry_status || lead.enquiry_status,
        project_status: editForm.project_status || lead.project_status
      };

      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lead');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update the lead state with the edited form data
        setLead({...lead, ...editForm});
        setIsEditing(false);
        setEditForm({});
        
        // Success feedback without emoji
        alert('Lead updated successfully!');
        
        // Optionally refresh the lead data from server
        const refreshResponse = await fetch(`/api/leads/${id}`);
        if (refreshResponse.ok) {
          const refreshedLead = await refreshResponse.json();
          setLead(refreshedLead);
        }
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert(`Failed to update lead: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Follow-up management functions
  const handleAddFollowup = async () => {
    if (!newFollowup.description.trim()) {
      alert('Please enter a follow-up description');
      return;
    }

    try {
      const response = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newFollowup,
          lead_id: id,
          created_by: 1 // You might want to get this from user session
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add follow-up');
      }

      const result = await response.json();
      
      // Refresh follow-ups
      const refreshResponse = await fetch(`/api/leads/${id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        setFollowups(refreshedData.followups || []);
      }

      // Reset form
      setNewFollowup({
        type: '',
        description: '',
        scheduled_date: '',
        priority: 'Medium'
      });
      setShowFollowupForm(false);
      alert('Follow-up added successfully!');
    } catch (error) {
      console.error('Error adding follow-up:', error);
      alert('Failed to add follow-up. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="leads-page">
        <NavigationMinimal />
        <main className="leads-main">
          <div className="loading-state">
            <p>Loading lead details...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="leads-page">
        <NavigationMinimal />
        <main className="leads-main">
          <div className="error-state">
            <p>{error || 'Lead not found.'}</p>
          </div>
        </main>
      </div>
    );
  }


  return (
    <div className="leads-page">
      <NavigationMinimal />
      <main className="leads-main">
        <div className={`leads-container ${isEditing ? 'editing-mode' : ''}`}>
          {/* Header Section matching leads page */}
          <div className="leads-header">
            <div className="header-content">
              <h1>{isEditing ? 'Edit Lead Details' : 'Lead Master Details'}</h1>
              <p>{lead.company_name} - {isEditing ? 'Editing Mode' : 'Complete Lead Profile'}</p>
            </div>
            <div className="header-actions">
              {isEditing ? (
                <>
                  <button 
                    className="btn-secondary" 
                    onClick={handleCancel}
                    disabled={saving}
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
                </>
              ) : (
                <>
                  <button className="btn-secondary" onClick={handleEdit}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Lead
                  </button>
                  <button className="btn-primary">Convert to Proposal</button>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards matching leads page */}
          <div className="leads-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0f9ff'}}>
                <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6-4h6m-6 8h6m-7 4a4 4 0 01-4-4V8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Lead ID</h3>
                <p className="stat-number">{lead.id}</p>
                <span className="stat-change neutral">{lead.enquiry_no}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fff7ed'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Stage</h3>
                <p className="stat-number">{lead.lead_stage}</p>
                <span className="stat-change neutral">Current Status</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#d1fae5'}}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Estimated Value</h3>
                <p className="stat-number">{lead.estimated_value ? `₹${lead.estimated_value}` : 'TBD'}</p>
                <span className="stat-change positive">Deal Size</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Days Active</h3>
                <p className="stat-number">
                  {lead.created_at ? Math.floor((new Date() - new Date(lead.created_at)) / (1000 * 60 * 60 * 24)) : 0}
                </p>
                <span className="stat-change neutral">Since created</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="tabs-container">
            <div className="tabs-nav">
              {tabs.map(tab => (
                <button 
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="info-card">
                  <h3>Basic Lead Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Lead ID</label>
                      <span>{lead.id || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Contact Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.contact_name || ''} 
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.contact_name || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Company Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.company_name || ''} 
                          onChange={(e) => handleInputChange('company_name', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.company_name || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Designation</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.designation || ''} 
                          onChange={(e) => handleInputChange('designation', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.designation || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Source</label>
                      {isEditing ? (
                        <select 
                          value={editForm.source || ''} 
                          onChange={(e) => handleInputChange('source', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Source</option>
                          <option value="Website">Website</option>
                          <option value="Phone Call">Phone Call</option>
                          <option value="Email">Email</option>
                          <option value="Social Media">Social Media</option>
                          <option value="Referral">Referral</option>
                          <option value="Trade Show">Trade Show</option>
                          <option value="Cold Call">Cold Call</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <span>{lead.source || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Industry</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.industry || ''} 
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.industry || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Lead Type</label>
                      {isEditing ? (
                        <select 
                          value={editForm.lead_type || ''} 
                          onChange={(e) => handleInputChange('lead_type', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Type</option>
                          <option value="Hot">Hot</option>
                          <option value="Warm">Warm</option>
                          <option value="Cold">Cold</option>
                        </select>
                      ) : (
                        <span>{lead.lead_type || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Details Tab */}
              {activeTab === 'contact' && (
                <div className="info-card">
                  <h3>Contact Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Email</label>
                      {isEditing ? (
                        <input 
                          type="email" 
                          value={editForm.email || ''} 
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.email || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Phone</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={editForm.mobile || ''} 
                          onChange={(e) => handleInputChange('mobile', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.mobile || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Alternate Phone</label>
                      {isEditing ? (
                        <input 
                          type="tel" 
                          value={editForm.alt_phone || ''} 
                          onChange={(e) => handleInputChange('alt_phone', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.alt_phone || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Address</label>
                      {isEditing ? (
                        <textarea 
                          value={editForm.address || ''} 
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="form-textarea"
                          rows="2"
                        />
                      ) : (
                        <span>{lead.address || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>City</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.city || ''} 
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.city || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>State</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.state || ''} 
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.state || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Country</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.country || ''} 
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.country || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Pincode</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.pincode || ''} 
                          onChange={(e) => handleInputChange('pincode', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.pincode || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Website</label>
                      {isEditing ? (
                        <input 
                          type="url" 
                          value={editForm.website || ''} 
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.website || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>LinkedIn</label>
                      {isEditing ? (
                        <input 
                          type="url" 
                          value={editForm.linkedin || ''} 
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.linkedin || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Qualification Tab */}
              {activeTab === 'qualification' && (
                <div className="info-card">
                  <h3>Lead Qualification & Status</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Stage</label>
                      {isEditing ? (
                        <select 
                          value={editForm.lead_stage || ''} 
                          onChange={(e) => handleInputChange('lead_stage', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Stage</option>
                          <option value="Initial Contact">Initial Contact</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Closed Won">Closed Won</option>
                          <option value="Closed Lost">Closed Lost</option>
                        </select>
                      ) : (
                        <span>{lead.lead_stage || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      {isEditing ? (
                        <select 
                          value={editForm.status || ''} 
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Status</option>
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Closed">Closed</option>
                        </select>
                      ) : (
                        <span>{lead.status || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Probability</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          min="0" 
                          max="100"
                          value={editForm.probability || ''} 
                          onChange={(e) => handleInputChange('probability', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.probability ? `${lead.probability}%` : 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Expected Deal Size</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editForm.estimated_value || ''} 
                          onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                          className="form-input"
                          placeholder="Enter amount"
                        />
                      ) : (
                        <span>{lead.estimated_value ? `₹${lead.estimated_value}` : 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Next Follow-up</label>
                      {isEditing ? (
                        <input 
                          type="datetime-local" 
                          value={editForm.next_followup ? new Date(editForm.next_followup).toISOString().slice(0, 16) : ''} 
                          onChange={(e) => handleInputChange('next_followup', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.next_followup || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Notes</label>
                      {isEditing ? (
                        <textarea 
                          value={editForm.notes || ''} 
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          className="form-textarea"
                          rows="3"
                        />
                      ) : (
                        <span>{lead.notes || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Engagement Tab */}
              {activeTab === 'engagement' && (
                <div className="info-card">
                  <h3>Engagement Details</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Lead Owner</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.owner || ''} 
                          onChange={(e) => handleInputChange('owner', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.owner || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Created At</label>
                      <span>{lead.created_at || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                      <label>Last Contacted</label>
                      {isEditing ? (
                        <input 
                          type="datetime-local" 
                          value={editForm.last_contacted ? new Date(editForm.last_contacted).toISOString().slice(0, 16) : ''} 
                          onChange={(e) => handleInputChange('last_contacted', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.last_contacted || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Communication History</label>
                      {isEditing ? (
                        <textarea 
                          value={editForm.communication_history || ''} 
                          onChange={(e) => handleInputChange('communication_history', e.target.value)}
                          className="form-textarea"
                          rows="3"
                        />
                      ) : (
                        <span>{lead.communication_history || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Attachments</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.attachments || ''} 
                          onChange={(e) => handleInputChange('attachments', e.target.value)}
                          className="form-input"
                          placeholder="File names or URLs"
                        />
                      ) : (
                        <span>{lead.attachments || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Scoring Tab */}
              {activeTab === 'scoring' && (
                <div className="info-card">
                  <h3>Lead Scoring / Priority</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Budget Fit</label>
                      {isEditing ? (
                        <select 
                          value={editForm.budget_fit || ''} 
                          onChange={(e) => handleInputChange('budget_fit', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Budget Fit</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      ) : (
                        <span>{lead.budget_fit || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Decision Power</label>
                      {isEditing ? (
                        <select 
                          value={editForm.decision_power || ''} 
                          onChange={(e) => handleInputChange('decision_power', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Decision Power</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      ) : (
                        <span>{lead.decision_power || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Urgency</label>
                      {isEditing ? (
                        <select 
                          value={editForm.urgency || ''} 
                          onChange={(e) => handleInputChange('urgency', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Urgency</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      ) : (
                        <span>{lead.urgency || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Priority</label>
                      {isEditing ? (
                        <select 
                          value={editForm.priority || ''} 
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="form-select"
                        >
                          <option value="">Select Priority</option>
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      ) : (
                        <span>{lead.priority || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Tab */}
              {activeTab === 'conversion' && (
                <div className="info-card">
                  <h3>Conversion Fields</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Opportunity Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.opportunity_name || ''} 
                          onChange={(e) => handleInputChange('opportunity_name', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.opportunity_name || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Expected Closing</label>
                      {isEditing ? (
                        <input 
                          type="date" 
                          value={editForm.expected_closing ? new Date(editForm.expected_closing).toISOString().slice(0, 10) : ''} 
                          onChange={(e) => handleInputChange('expected_closing', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.expected_closing || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Linked Client</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.linked_client || ''} 
                          onChange={(e) => handleInputChange('linked_client', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.linked_client || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Tab */}
              {activeTab === 'additional' && (
                <div className="info-card">
                  <h3>Additional / Custom Fields</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Source Campaign</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.source_campaign || ''} 
                          onChange={(e) => handleInputChange('source_campaign', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.source_campaign || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Product/Service</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.product_service || ''} 
                          onChange={(e) => handleInputChange('product_service', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.product_service || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Competitor</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editForm.competitor || ''} 
                          onChange={(e) => handleInputChange('competitor', e.target.value)}
                          className="form-input"
                        />
                      ) : (
                        <span>{lead.competitor || 'N/A'}</span>
                      )}
                    </div>
                    <div className="info-item">
                      <label>Remarks</label>
                      {isEditing ? (
                        <textarea 
                          value={editForm.remarks || ''} 
                          onChange={(e) => handleInputChange('remarks', e.target.value)}
                          className="form-textarea"
                          rows="3"
                        />
                      ) : (
                        <span>{lead.remarks || 'N/A'}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-ups Tab */}
              {activeTab === 'followups' && (
                <div className="info-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Follow-up History</h3>
                    <button 
                      className="btn-primary"
                      onClick={() => setShowFollowupForm(!showFollowupForm)}
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Follow-up
                    </button>
                  </div>

                  {/* Add Follow-up Form */}
                  {showFollowupForm && (
                    <div className="followup-form" style={{ marginBottom: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                      <h4 style={{ marginBottom: '16px', color: '#1e40af' }}>Add New Follow-up</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Type</label>
                          <select 
                            value={newFollowup.type} 
                            onChange={(e) => setNewFollowup({...newFollowup, type: e.target.value})}
                            className="form-select"
                          >
                            <option value="">Select Type</option>
                            <option value="Call">Phone Call</option>
                            <option value="Email">Email</option>
                            <option value="Meeting">Meeting</option>
                            <option value="Demo">Demo</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Priority</label>
                          <select 
                            value={newFollowup.priority} 
                            onChange={(e) => setNewFollowup({...newFollowup, priority: e.target.value})}
                            className="form-select"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Scheduled Date</label>
                          <input 
                            type="datetime-local"
                            value={newFollowup.scheduled_date} 
                            onChange={(e) => setNewFollowup({...newFollowup, scheduled_date: e.target.value})}
                            className="form-input"
                          />
                        </div>
                      </div>
                      <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#374151' }}>Description</label>
                        <textarea 
                          value={newFollowup.description} 
                          onChange={(e) => setNewFollowup({...newFollowup, description: e.target.value})}
                          className="form-textarea"
                          rows="3"
                          placeholder="Enter follow-up details..."
                        />
                      </div>
                      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn-primary"
                          onClick={handleAddFollowup}
                        >
                          Save Follow-up
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => setShowFollowupForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Follow-ups List */}
                  <div className="followups-list">
                    {followups.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a4 4 0 118 0v4m-4 6V9a4 4 0 00-8 0v2m0 0V9a4 4 0 018 0v2m-4 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>No follow-ups recorded yet</p>
                        <p style={{ fontSize: '13px', marginTop: '8px' }}>Click "Add Follow-up" to create your first follow-up</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {followups.map((followup, index) => (
                          <div key={followup.id || index} className="followup-item" style={{
                            background: 'white',
                            border: '2px solid #f1f5f9',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`priority-badge ${followup.priority?.toLowerCase() || 'medium'}`} style={{
                                  padding: '4px 8px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  {followup.priority || 'Medium'}
                                </span>
                                <span style={{ 
                                  padding: '4px 8px',
                                  background: '#f0f9ff',
                                  color: '#1e40af',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {followup.type || 'General'}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {formatDate(followup.followup_date || followup.created_at)}
                              </span>
                            </div>
                            <p style={{ 
                              margin: '0',
                              lineHeight: '1.5',
                              color: '#374151',
                              fontSize: '14px'
                            }}>
                              {followup.description}
                            </p>
                            {followup.created_by_name && (
                              <p style={{ 
                                margin: '8px 0 0 0',
                                fontSize: '12px',
                                color: '#6b7280',
                                fontStyle: 'italic'
                              }}>
                                by {followup.created_by_name}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
