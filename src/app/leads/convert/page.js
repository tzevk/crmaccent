'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationMinimal from '@/components/navigation/Navigation';
import './convert.css';

export default function ConvertPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('lead-to-proposal');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [conversionForm, setConversionForm] = useState({
    proposal_title: '',
    description: '',
    estimated_value: '',
    currency: 'INR',
    project_name: '',
    project_description: '',
    project_cost: '',
    start_date: '',
    end_date: '',
    notes: ''
  });
  const [converting, setConverting] = useState(false);
  const [stats, setStats] = useState({
    totalConversions: 0,
    leadToProposal: 0,
    proposalToProject: 0,
    conversionRate: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, proposalsRes, projectsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/proposals'),
        fetch('/api/projects')
      ]);

      if (!leadsRes.ok || !proposalsRes.ok || !projectsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [leadsData, proposalsData, projectsData] = await Promise.all([
        leadsRes.json(),
        proposalsRes.json(),
        projectsRes.json()
      ]);

      setLeads(leadsData);
      setProposals(proposalsData);
      setProjects(projectsData);
      calculateStats(leadsData, proposalsData, projectsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  const calculateStats = (leadsData, proposalsData, projectsData) => {
    const convertedLeads = leadsData.filter(l => l.enquiry_status === 'converted').length;
    const convertedProposals = proposalsData.filter(p => p.is_converted_to_project).length;
    const totalConversions = convertedLeads + convertedProposals;
    const conversionRate = leadsData.length > 0 ? (convertedLeads / leadsData.length) * 100 : 0;

    setStats({
      totalConversions,
      leadToProposal: convertedLeads,
      proposalToProject: convertedProposals,
      conversionRate
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleConvertLeadToProposal = async () => {
    if (!selectedLead) return;

    try {
      setConverting(true);
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLead.id,
          proposal_title: conversionForm.proposal_title || `Proposal for ${selectedLead.company_name}`,
          proposal_description: conversionForm.description || `Proposal generated from lead ${selectedLead.id}`,
          estimated_value: conversionForm.estimated_value || selectedLead.estimated_value,
          currency: conversionForm.currency,
          current_status: 'Draft',
          contact_name: selectedLead.contact_name,
          contact_email: selectedLead.contact_email,
          contact_phone: selectedLead.contact_phone,
          company_name: selectedLead.company_name,
          notes: conversionForm.notes
        })
      });

      if (response.ok) {
        // Update lead status
        await fetch(`/api/leads/${selectedLead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enquiry_status: 'converted',
            notes: `Converted to proposal on ${new Date().toLocaleDateString()}`
          })
        });

        alert('Lead successfully converted to proposal!');
        setSelectedLead(null);
        setConversionForm({});
        fetchData();
      } else {
        throw new Error('Failed to convert lead');
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('Failed to convert lead to proposal');
    } finally {
      setConverting(false);
    }
  };

  const handleConvertProposalToProject = async () => {
    if (!selectedProposal) return;

    try {
      setConverting(true);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal_id: selectedProposal.id,
          project_name: conversionForm.project_name || `Project: ${selectedProposal.proposal_title}`,
          project_description: conversionForm.project_description || selectedProposal.proposal_description,
          project_cost: conversionForm.project_cost || selectedProposal.estimated_value,
          currency: conversionForm.currency,
          project_status: 'Planning',
          start_date: conversionForm.start_date,
          end_date: conversionForm.end_date,
          client_name: selectedProposal.company_name,
          notes: conversionForm.notes
        })
      });

      if (response.ok) {
        // Update proposal status
        await fetch(`/api/proposals/${selectedProposal.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_status: 'Converted to Project',
            is_converted_to_project: true,
            notes: `Converted to project on ${new Date().toLocaleDateString()}`
          })
        });

        alert('Proposal successfully converted to project!');
        setSelectedProposal(null);
        setConversionForm({});
        fetchData();
      } else {
        throw new Error('Failed to convert proposal');
      }
    } catch (error) {
      console.error('Error converting proposal:', error);
      alert('Failed to convert proposal to project');
    } finally {
      setConverting(false);
    }
  };

  const getConvertableLeads = () => {
    return leads.filter(lead => 
      lead.enquiry_status !== 'converted' && 
      lead.enquiry_status !== 'lost' &&
      lead.lead_stage === 'Qualified'
    );
  };

  const getConvertableProposals = () => {
    return proposals.filter(proposal => 
      !proposal.is_converted_to_project && 
      (proposal.current_status === 'Awarded' || proposal.current_status === 'Accepted')
    );
  };

  if (loading) {
    return (
      <div className="convert-page">
        <NavigationMinimal />
        <div className="convert-loading">
          <div className="spinner"></div>
          <p>Loading conversion data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="convert-page">
        <NavigationMinimal />
        <div className="convert-error">
          <p>{error}</p>
          <button onClick={fetchData} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="convert-page">
      <NavigationMinimal />
      
      <main className="convert-main">
        <div className="convert-container">
          {/* Header */}
          <div className="convert-header">
            <div className="header-content">
              <h1>Lead & Proposal Converter</h1>
              <p>Convert leads to proposals and proposals to projects seamlessly</p>
            </div>
            <div className="header-actions">
              <Link href="/leads" className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Back to Leads
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="convert-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <polyline points="16,11 18,13 22,9"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalConversions}</div>
                <div className="stat-label">Total Conversions</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.leadToProposal}</div>
                <div className="stat-label">Leads → Proposals</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.proposalToProject}</div>
                <div className="stat-label">Proposals → Projects</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.conversionRate.toFixed(1)}%</div>
                <div className="stat-label">Conversion Rate</div>
              </div>
            </div>
          </div>

          {/* Conversion Tabs */}
          <div className="convert-tabs">
            <div className="tab-nav">
              <button
                className={`tab-btn ${activeTab === 'lead-to-proposal' ? 'active' : ''}`}
                onClick={() => setActiveTab('lead-to-proposal')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                </svg>
                Lead to Proposal ({getConvertableLeads().length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'proposal-to-project' ? 'active' : ''}`}
                onClick={() => setActiveTab('proposal-to-project')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
                Proposal to Project ({getConvertableProposals().length})
              </button>
            </div>

            {/* Lead to Proposal Tab */}
            {activeTab === 'lead-to-proposal' && (
              <div className="tab-content">
                <div className="conversion-grid">
                  {/* Available Leads */}
                  <div className="conversion-section">
                    <div className="section-header">
                      <h3>Qualified Leads</h3>
                      <p>Select a lead to convert to proposal</p>
                    </div>
                    <div className="items-list">
                      {getConvertableLeads().map(lead => (
                        <div 
                          key={lead.id} 
                          className={`item-card ${selectedLead?.id === lead.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedLead(lead);
                            setConversionForm({
                              ...conversionForm,
                              proposal_title: `Proposal for ${lead.company_name}`,
                              estimated_value: lead.estimated_value,
                              currency: 'INR'
                            });
                          }}
                        >
                          <div className="item-header">
                            <h4>{lead.company_name}</h4>
                            <div className="item-value">{formatCurrency(lead.estimated_value)}</div>
                          </div>
                          <div className="item-details">
                            <p className="item-contact">{lead.contact_name}</p>
                            <p className="item-meta">{lead.city}, {lead.state}</p>
                            <span className="item-stage">{lead.lead_stage}</span>
                          </div>
                        </div>
                      ))}
                      {getConvertableLeads().length === 0 && (
                        <div className="empty-state">
                          <p>No qualified leads available for conversion</p>
                          <Link href="/leads" className="btn-secondary">Browse Leads</Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conversion Form */}
                  <div className="conversion-section">
                    <div className="section-header">
                      <h3>Create Proposal</h3>
                      <p>Configure proposal details</p>
                    </div>
                    {selectedLead ? (
                      <div className="conversion-form">
                        <div className="form-group">
                          <label>Proposal Title</label>
                          <input
                            type="text"
                            value={conversionForm.proposal_title || ''}
                            onChange={(e) => setConversionForm({...conversionForm, proposal_title: e.target.value})}
                            placeholder="Enter proposal title"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Description</label>
                          <textarea
                            value={conversionForm.description || ''}
                            onChange={(e) => setConversionForm({...conversionForm, description: e.target.value})}
                            placeholder="Proposal description and scope"
                            rows="3"
                          />
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Estimated Value</label>
                            <input
                              type="number"
                              value={conversionForm.estimated_value || ''}
                              onChange={(e) => setConversionForm({...conversionForm, estimated_value: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Currency</label>
                            <select
                              value={conversionForm.currency || 'INR'}
                              onChange={(e) => setConversionForm({...conversionForm, currency: e.target.value})}
                            >
                              <option value="INR">INR - Indian Rupee</option>
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Notes</label>
                          <textarea
                            value={conversionForm.notes || ''}
                            onChange={(e) => setConversionForm({...conversionForm, notes: e.target.value})}
                            placeholder="Additional notes and requirements"
                            rows="2"
                          />
                        </div>
                        
                        <div className="form-actions">
                          <button
                            onClick={handleConvertLeadToProposal}
                            disabled={converting}
                            className="btn-primary"
                          >
                            {converting ? 'Converting...' : 'Convert to Proposal'}
                          </button>
                          <button
                            onClick={() => setSelectedLead(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="form-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <p>Select a lead to create proposal</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Proposal to Project Tab */}
            {activeTab === 'proposal-to-project' && (
              <div className="tab-content">
                <div className="conversion-grid">
                  {/* Available Proposals */}
                  <div className="conversion-section">
                    <div className="section-header">
                      <h3>Awarded Proposals</h3>
                      <p>Select a proposal to convert to project</p>
                    </div>
                    <div className="items-list">
                      {getConvertableProposals().map(proposal => (
                        <div 
                          key={proposal.id} 
                          className={`item-card ${selectedProposal?.id === proposal.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedProposal(proposal);
                            setConversionForm({
                              ...conversionForm,
                              project_name: `Project: ${proposal.proposal_title}`,
                              project_cost: proposal.estimated_value,
                              currency: proposal.currency || 'INR'
                            });
                          }}
                        >
                          <div className="item-header">
                            <h4>{proposal.proposal_title}</h4>
                            <div className="item-value">{formatCurrency(proposal.estimated_value)}</div>
                          </div>
                          <div className="item-details">
                            <p className="item-contact">{proposal.company_name}</p>
                            <p className="item-meta">{proposal.contact_name}</p>
                            <span className="item-stage">{proposal.current_status}</span>
                          </div>
                        </div>
                      ))}
                      {getConvertableProposals().length === 0 && (
                        <div className="empty-state">
                          <p>No awarded proposals available for conversion</p>
                          <Link href="/proposals" className="btn-secondary">Browse Proposals</Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Conversion Form */}
                  <div className="conversion-section">
                    <div className="section-header">
                      <h3>Create Project</h3>
                      <p>Configure project details</p>
                    </div>
                    {selectedProposal ? (
                      <div className="conversion-form">
                        <div className="form-group">
                          <label>Project Name</label>
                          <input
                            type="text"
                            value={conversionForm.project_name || ''}
                            onChange={(e) => setConversionForm({...conversionForm, project_name: e.target.value})}
                            placeholder="Enter project name"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Project Description</label>
                          <textarea
                            value={conversionForm.project_description || ''}
                            onChange={(e) => setConversionForm({...conversionForm, project_description: e.target.value})}
                            placeholder="Project description and scope"
                            rows="3"
                          />
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Project Cost</label>
                            <input
                              type="number"
                              value={conversionForm.project_cost || ''}
                              onChange={(e) => setConversionForm({...conversionForm, project_cost: e.target.value})}
                              placeholder="0"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Currency</label>
                            <select
                              value={conversionForm.currency || 'INR'}
                              onChange={(e) => setConversionForm({...conversionForm, currency: e.target.value})}
                            >
                              <option value="INR">INR - Indian Rupee</option>
                              <option value="USD">USD - US Dollar</option>
                              <option value="EUR">EUR - Euro</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="form-row">
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="date"
                              value={conversionForm.start_date || ''}
                              onChange={(e) => setConversionForm({...conversionForm, start_date: e.target.value})}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="date"
                              value={conversionForm.end_date || ''}
                              onChange={(e) => setConversionForm({...conversionForm, end_date: e.target.value})}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Notes</label>
                          <textarea
                            value={conversionForm.notes || ''}
                            onChange={(e) => setConversionForm({...conversionForm, notes: e.target.value})}
                            placeholder="Project requirements and notes"
                            rows="2"
                          />
                        </div>
                        
                        <div className="form-actions">
                          <button
                            onClick={handleConvertProposalToProject}
                            disabled={converting}
                            className="btn-primary"
                          >
                            {converting ? 'Converting...' : 'Convert to Project'}
                          </button>
                          <button
                            onClick={() => setSelectedProposal(null)}
                            className="btn-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="form-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        <p>Select a proposal to create project</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
