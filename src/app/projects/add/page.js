'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './add-project.css';

export default function AddProjectPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState('');
  
  const router = useRouter();

  // Form data with all project fields
  const [formData, setFormData] = useState({
    // Basic Information
    projectName: '',
    projectId: '',
    projectType: '',
    description: '',
    
    // Client Information
    clientName: '',
    contactPerson: '',
    email: '',
    phoneNumber: '',
    address: '',
    
    // Project Details
    startDate: '',
    endDate: '',
    estimatedDuration: '',
    actualDuration: '',
    status: 'planning',
    priority: 'medium',
    
    // Financial Information
    budget: '',
    actualCost: '',
    currency: 'INR',
    profitMargin: '',
    
    // Team & Resources
    projectManager: '',
    teamLead: '',
    teamMembers: '',
    department: '',
    
    // Proposal Information
    proposalId: '',
    proposalValue: '',
    approvalDate: '',
    
    // Additional Details
    deliverables: '',
    milestones: '',
    risks: '',
    notes: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadProposals();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadProposals = async () => {
    try {
      const response = await fetch('/api/proposals');
      if (response.ok) {
        const data = await response.json();
        setProposals(data);
      }
    } catch (error) {
      console.error('Error loading proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProposalSelect = async (proposalId) => {
    setSelectedProposal(proposalId);
    
    if (proposalId) {
      try {
        const response = await fetch(`/api/proposals/${proposalId}`);
        if (response.ok) {
          const proposal = await response.json();
          
          // Pre-fill form with proposal data
          setFormData(prev => ({
            ...prev,
            projectName: proposal.projectName || proposal.proposalTitle || '',
            clientName: proposal.clientName || '',
            contactPerson: proposal.contactPerson || '',
            email: proposal.email || '',
            phoneNumber: proposal.phoneNumber || '',
            address: proposal.address || '',
            description: proposal.scopeOfWork || '',
            budget: proposal.estimatedValue || '',
            currency: proposal.currency || 'INR',
            proposalId: proposal.proposalId || '',
            proposalValue: proposal.estimatedValue || '',
            projectType: proposal.projectType || 'web-development',
            estimatedDuration: proposal.estimatedDuration || ''
          }));
        }
      } catch (error) {
        console.error('Error loading proposal details:', error);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_by: user.email
        }),
      });

      if (response.ok) {
        router.push('/projects');
      } else {
        const error = await response.json();
        alert('Error creating project: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Error creating project: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { 
      key: 'basic', 
      label: 'Basic Info', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      key: 'client', 
      label: 'Client Details', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      key: 'timeline', 
      label: 'Timeline', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      key: 'financial', 
      label: 'Financial', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    { 
      key: 'team', 
      label: 'Team & Resources', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      key: 'additional', 
      label: 'Additional', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  const renderBasicInfo = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Project Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Convert from Proposal</label>
            <select
              value={selectedProposal}
              onChange={(e) => handleProposalSelect(e.target.value)}
              className="form-control"
            >
              <option value="">Select Proposal (Optional)</option>
              {proposals.map(proposal => (
                <option key={proposal.id} value={proposal.id}>
                  {proposal.proposalId} - {proposal.proposalTitle || proposal.clientName}
                </option>
              ))}
            </select>
            <small>Convert an existing proposal to project with pre-filled details</small>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className="form-control"
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="form-group">
            <label>Project ID</label>
            <input
              type="text"
              value={formData.projectId}
              onChange={(e) => handleInputChange('projectId', e.target.value)}
              className="form-control"
              placeholder="Auto-generated if empty"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project Type *</label>
            <select
              value={formData.projectType}
              onChange={(e) => handleInputChange('projectType', e.target.value)}
              className="form-control"
              required
            >
              <option value="web-development">Web Development</option>
              <option value="mobile-app">Mobile App</option>
              <option value="software-development">Software Development</option>
              <option value="consulting">Consulting</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="form-control"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Project Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-control"
            placeholder="Describe the project scope and objectives"
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderClientDetails = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Client Information</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Client Name *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              className="form-control"
              placeholder="Enter client name"
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              className="form-control"
              placeholder="Primary contact person"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-control"
              placeholder="client@example.com"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className="form-control"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="form-control"
            placeholder="Client address"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Project Timeline</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="form-control"
              required
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estimated Duration (Days)</label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', e.target.value)}
              className="form-control"
              placeholder="Number of days"
            />
          </div>
          <div className="form-group">
            <label>Project Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="form-control"
            >
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label>Key Milestones</label>
          <textarea
            value={formData.milestones}
            onChange={(e) => handleInputChange('milestones', e.target.value)}
            className="form-control"
            placeholder="List key project milestones (one per line)"
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderFinancial = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Financial Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Project Budget *</label>
            <div className="currency-input">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                className="form-control with-currency"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Actual Cost</label>
            <div className="currency-input">
              <span className="currency-symbol">₹</span>
              <input
                type="number"
                value={formData.actualCost}
                onChange={(e) => handleInputChange('actualCost', e.target.value)}
                className="form-control with-currency"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Profit Margin (%)</label>
            <input
              type="number"
              value={formData.profitMargin}
              onChange={(e) => handleInputChange('profitMargin', e.target.value)}
              className="form-control"
              placeholder="15"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="form-control"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {selectedProposal && (
          <div className="proposal-info">
            <h4>Proposal Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label>Proposal ID</label>
                <input
                  type="text"
                  value={formData.proposalId}
                  onChange={(e) => handleInputChange('proposalId', e.target.value)}
                  className="form-control"
                  placeholder="Proposal reference"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label>Proposal Value</label>
                <div className="currency-input">
                  <span className="currency-symbol">₹</span>
                  <input
                    type="number"
                    value={formData.proposalValue}
                    onChange={(e) => handleInputChange('proposalValue', e.target.value)}
                    className="form-control with-currency"
                    placeholder="0.00"
                    step="0.01"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeamResources = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Team & Resources</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Project Manager</label>
            <input
              type="text"
              value={formData.projectManager}
              onChange={(e) => handleInputChange('projectManager', e.target.value)}
              className="form-control"
              placeholder="Project manager name"
            />
          </div>
          <div className="form-group">
            <label>Team Lead</label>
            <input
              type="text"
              value={formData.teamLead}
              onChange={(e) => handleInputChange('teamLead', e.target.value)}
              className="form-control"
              placeholder="Technical lead name"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className="form-control"
            >
              <option value="">Select Department</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="consulting">Consulting</option>
              <option value="sales">Sales</option>
            </select>
          </div>
          <div className="form-group">
            <label>Actual Duration (Days)</label>
            <input
              type="number"
              value={formData.actualDuration}
              onChange={(e) => handleInputChange('actualDuration', e.target.value)}
              className="form-control"
              placeholder="Actual time spent"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Team Members</label>
          <textarea
            value={formData.teamMembers}
            onChange={(e) => handleInputChange('teamMembers', e.target.value)}
            className="form-control"
            placeholder="List team members (one per line)"
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderAdditional = () => (
    <div className="tab-content">
      <div className="form-section">
        <h3>Additional Information</h3>
        <div className="form-group full-width">
          <label>Deliverables</label>
          <textarea
            value={formData.deliverables}
            onChange={(e) => handleInputChange('deliverables', e.target.value)}
            className="form-control"
            placeholder="List project deliverables"
            rows="4"
          />
        </div>

        <div className="form-group full-width">
          <label>Risks & Considerations</label>
          <textarea
            value={formData.risks}
            onChange={(e) => handleInputChange('risks', e.target.value)}
            className="form-control"
            placeholder="Identify potential risks and mitigation strategies"
            rows="4"
          />
        </div>

        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-control"
            placeholder="Additional notes and comments"
            rows="4"
          />
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic': return renderBasicInfo();
      case 'client': return renderClientDetails();
      case 'timeline': return renderTimeline();
      case 'financial': return renderFinancial();
      case 'team': return renderTeamResources();
      case 'additional': return renderAdditional();
      default: return renderBasicInfo();
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="add-project-page">
        <Navigation user={user} />
        <main className="add-project-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="add-project-page">
      <Navigation user={user} />
      
      <main className="add-project-main">
        <div className="add-project-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>{selectedProposal ? 'Convert Proposal to Project' : 'Add New Project'}</h1>
                <p>{selectedProposal ? 'Create a project from the selected proposal' : 'Create a new project or convert from an existing proposal'}</p>
              </div>
              <div className="header-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => router.push('/projects')}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="add-project-form"
                  className="btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="content-section">
            <form id="add-project-form" onSubmit={handleSubmit}>
              {renderTabContent()}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
