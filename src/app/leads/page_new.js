'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import LeadForm from '@/components/leads/LeadForm';
import './leads.css';

export default function LeadsPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [filters, setFilters] = useState({
    status: 'All',
    stage: 'All',
    assignedTo: 'All',
    city: 'All',
    dateRange: 'All'
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    won: 0,
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
    fetchLeads();
  }, [router]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leads');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch leads`);
      }
      
      const leadsData = await response.json();
      setLeads(leadsData);
      
      // Calculate stats
      const totalLeads = leadsData.length;
      const newCount = leadsData.filter(l => l.lead_stage === 'New').length;
      const qualifiedCount = leadsData.filter(l => l.lead_stage === 'Qualified').length;
      const wonCount = leadsData.filter(l => l.lead_stage === 'Closed-Won').length;
      const lostCount = leadsData.filter(l => l.lead_stage === 'Closed-Lost').length;
      const totalValue = leadsData
        .filter(l => l.estimated_value)
        .reduce((sum, l) => sum + parseFloat(l.estimated_value || 0), 0);
      
      setStats({
        total: totalLeads,
        new: newCount,
        qualified: qualifiedCount,
        won: wonCount,
        lost: lostCount,
        totalValue: totalValue
      });
      
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (leadData) => {
    try {
      const url = editingLead ? '/api/leads' : '/api/leads';
      const method = editingLead ? 'PUT' : 'POST';
      
      if (editingLead) {
        leadData.id = editingLead.id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });

      if (response.ok) {
        alert(editingLead ? 'Lead updated successfully!' : 'Lead created successfully!');
        setShowForm(false);
        setEditingLead(null);
        fetchLeads();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to save lead'));
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Error saving lead. Please try again.');
    }
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await fetch(`/api/leads?id=${leadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Lead deleted successfully!');
        fetchLeads();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete lead'));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      alert('Error deleting lead. Please try again.');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', 'preview');

    try {
      setImportLoading(true);
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setImportPreview(result);
        setShowImportModal(true);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!fileInputRef.current.files[0]) return;

    const formData = new FormData();
    formData.append('file', fileInputRef.current.files[0]);
    formData.append('action', 'import');

    try {
      setImportLoading(true);
      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(`Import completed! ${result.imported} leads imported, ${result.failed} failed.`);
        setShowImportModal(false);
        setImportPreview(null);
        fetchLeads();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error importing leads:', error);
      alert('Error importing leads. Please try again.');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const filteredLeads = leads.filter(lead => {
    if (filters.status !== 'All' && lead.enquiry_status !== filters.status) return false;
    if (filters.stage !== 'All' && lead.lead_stage !== filters.stage) return false;
    return true;
  });

  if (!user) return null;

  return (
    <div className="leads-page">
      <Navigation user={user} />
      
      <main className="leads-main">
        <div className="leads-container">
          {/* Header Section */}
          <div className="leads-header">
            <div className="header-content">
              <h1>Lead Management</h1>
              <p>Track and manage your sales pipeline</p>
            </div>
            <div className="header-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                disabled={importLoading}
              >
                {importLoading ? '⏳ Processing...' : '📁 Import Excel'}
              </button>
              <button 
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <span>+</span>
                New Lead
              </button>
              <button className="btn-secondary">
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="leads-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0f9ff'}}>
                <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Leads</h3>
                <p className="stat-number">{stats.total}</p>
                <span className="stat-change neutral">Active pipeline</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fff7ed'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>New Leads</h3>
                <p className="stat-number">{stats.new}</p>
                <span className="stat-change neutral">Needs attention</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#d1fae5'}}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 701.946 1.946l1.999 3.46a11.952 11.952 0 90-8.91l-3.44-1.999a3.42 3.42 0 70-1.946z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Won Deals</h3>
                <p className="stat-number">{stats.won}</p>
                <span className="stat-change positive">{formatCurrency(stats.totalValue)} Value</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 1118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Qualified</h3>
                <p className="stat-number">{stats.qualified}</p>
                <span className="stat-change neutral">Ready for proposal</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="leads-filters">
            <select 
              className="filter-select" 
              value={filters.stage} 
              onChange={(e) => setFilters({...filters, stage: e.target.value})}
            >
              <option value="All">All Stages</option>
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed-Won">Closed-Won</option>
              <option value="Closed-Lost">Closed-Lost</option>
            </select>

            <select 
              className="filter-select" 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Status</option>
              <option value="Awarded">Awarded</option>
              <option value="Awaiting">Awaiting</option>
              <option value="Lost">Lost</option>
            </select>

            <input 
              type="text" 
              placeholder="Search by company, enquiry no..." 
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading leads...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchLeads} className="btn-secondary">Retry</button>
            </div>
          ) : (
            <div className="leads-table-container">
              <div className="table-header">
                <h2>Lead Pipeline</h2>
                <div className="table-actions">
                  <button className="btn-secondary">Filter</button>
                  <button className="btn-secondary">Export</button>
                </div>
              </div>

              <div className="leads-table">
                <table>
                  <thead>
                    <tr>
                      <th>Enquiry No.</th>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Project</th>
                      <th>Value</th>
                      <th>Stage</th>
                      <th>Assigned To</th>
                      <th>Last Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead.id}>
                        <td>
                          <span className="enquiry-no">{lead.enquiry_no}</span>
                          <span className="enquiry-date">{formatDate(lead.enquiry_date)}</span>
                        </td>
                        <td>
                          <div className="company-info">
                            <p>{lead.company_name}</p>
                            <span className="city">{lead.city || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <p>{lead.contact_name}</p>
                            <span className="contact-details">{lead.mobile || lead.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="project-info">
                            <p>{lead.project_name || 'TBD'}</p>
                            <span className="project-desc">{lead.project_description || 'General'}</span>
                          </div>
                        </td>
                        <td className="value-cell">{formatCurrency(lead.estimated_value, lead.currency)}</td>
                        <td>
                          <span 
                            className="stage-badge" 
                            style={{backgroundColor: getStageColor(lead.lead_stage)}}
                          >
                            {lead.lead_stage}
                          </span>
                        </td>
                        <td>{lead.assigned_to || 'Unassigned'}</td>
                        <td>{formatDate(lead.updated_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              title="Edit Lead"
                              onClick={() => handleEditLead(lead)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon"
                              title="View Details"
                              onClick={() => router.push(`/leads/${lead.id}`)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon btn-delete"
                              title="Delete Lead"
                              onClick={() => handleDeleteLead(lead.id)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            {lead.lead_stage === 'Qualified' && (
                              <button 
                                className="btn-convert"
                                title="Create Proposal"
                                onClick={() => router.push(`/proposals/new?leadId=${lead.id}`)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Proposal
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredLeads.length === 0 && (
                  <div className="empty-state">
                    <p>No leads found. Create your first lead to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lead Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <LeadForm
              lead={editingLead}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingLead(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && importPreview && (
        <div className="modal-overlay">
          <div className="modal-content import-modal">
            <div className="modal-header">
              <h3>📊 Excel Import Preview</h3>
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="import-summary">
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Rows:</span>
                  <span className="stat-value">{importPreview.totalRows}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Valid Rows:</span>
                  <span className="stat-value valid">{importPreview.validRows}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Error Rows:</span>
                  <span className="stat-value error">{importPreview.errorRows}</span>
                </div>
              </div>
              
              {importPreview.errorRows > 0 && (
                <div className="error-details">
                  <h4>⚠️ Rows with Errors:</h4>
                  {importPreview.summary.errorRows.slice(0, 5).map((row, index) => (
                    <div key={index} className="error-row">
                      <strong>Row {row.rowNumber}:</strong> {row.errors?.join(', ')}
                    </div>
                  ))}
                  {importPreview.summary.errorRows.length > 5 && (
                    <p>...and {importPreview.summary.errorRows.length - 5} more errors</p>
                  )}
                </div>
              )}
              
              <div className="preview-data">
                <h4>📋 Preview (First 5 rows):</h4>
                <div className="preview-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Company Name</th>
                        <th>Contact Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Project</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.data.slice(0, 5).map((row, index) => (
                        <tr key={index} className={row.errors ? 'error-row' : 'valid-row'}>
                          <td>{row.company_name || '-'}</td>
                          <td>{row.contact_name || '-'}</td>
                          <td>{row.email || '-'}</td>
                          <td>{row.mobile || '-'}</td>
                          <td>{row.project_name || '-'}</td>
                          <td>{row.estimated_value ? `₹${row.estimated_value}` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                }}
                className="btn-secondary"
              >
                ❌ Cancel
              </button>
              <button 
                onClick={handleImportConfirm}
                className="btn-primary"
                disabled={importLoading || importPreview.validRows === 0}
              >
                {importLoading ? '⏳ Importing...' : `✅ Import ${importPreview.validRows} Leads`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
