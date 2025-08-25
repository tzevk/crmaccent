'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './create-proposal.css';

export default function CreateProposalPage() {
  const [user, setUser] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({
    basicInfo: false,
    clientDetails: false,
    projectDetails: false,
    statusTimeline: false,
    additionalDetails: false
  });
  const [formData, setFormData] = useState({
    // Basic Proposal Information
    proposalId: '',
    proposalTitle: '',
    proposalDate: new Date().toISOString().split('T')[0],
    preparedBy: '',
    
    // Client Details
    clientName: '',
    contactPerson: '',
    designation: '',
    email: '',
    phoneNumber: '',
    address: '',
    
    // Project Details
    projectName: '',
    projectType: '',
    scopeOfWork: '',
    estimatedValue: '',
    estimatedDuration: '',
    currency: 'INR',
    
    // Proposal Status & Tracking
    currentStatus: 'Draft',
    submissionMode: '',
    followUpDate: '',
    expectedDecisionDate: '',
    
    // Internal Review
    proposalOwner: '',
    department: '',
    internalNotes: ''
  });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Auto-fill some fields
      setFormData(prev => ({
        ...prev,
        proposalId: `PROP-${Date.now()}`,
        preparedBy: parsedUser.full_name || parsedUser.username || ''
      }));
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    }
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSection = (sectionKey) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would typically send data to your backend
      console.log('Proposal Data:', formData);
      
      // For now, just show success and redirect
      alert('Proposal created successfully!');
      router.push('/proposals');
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Error creating proposal. Please try again.');
    }
  };

  if (!user) return null;

  return (
    <div className="create-proposal-page">
      <Navigation user={user} />
      
      <main className="create-proposal-main">
        <div className="create-proposal-container">
          <div className="create-proposal-header">
            <div className="header-content">
              <h1>Create New Proposal</h1>
              <p>Fill in the details for your EPC project proposal</p>
            </div>
            <div className="header-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => router.push('/proposals')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="proposal-form"
                className="btn-primary"
              >
                Create Proposal
              </button>
            </div>
          </div>

          <form id="proposal-form" className="proposal-form" onSubmit={handleSubmit}>
            {/* Left Column - Basic & Client Information */}
            <div className="form-column">
              {/* Basic Information Section */}
              <div 
                className={`form-section-title ${collapsedSections.basicInfo ? 'collapsed' : ''}`}
                onClick={() => toggleSection('basicInfo')}
              >
                Basic Information
                <span className="collapse-icon">▼</span>
              </div>
              <div className={`form-section-content ${collapsedSections.basicInfo ? 'collapsed' : ''}`}>
                <div className="form-group">
                  <label htmlFor="proposalId">Proposal ID / Reference No. *</label>
                  <input
                    type="text"
                    id="proposalId"
                    name="proposalId"
                    value={formData.proposalId}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proposalTitle">Proposal Title / Subject *</label>
                  <input
                    type="text"
                    id="proposalTitle"
                    name="proposalTitle"
                    value={formData.proposalTitle}
                    onChange={handleInputChange}
                    placeholder="Enter descriptive proposal title"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="proposalDate">Proposal Date *</label>
                  <input
                    type="date"
                    id="proposalDate"
                    name="proposalDate"
                    value={formData.proposalDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preparedBy">Prepared By</label>
                  <input
                    type="text"
                    id="preparedBy"
                    name="preparedBy"
                    value={formData.preparedBy}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Client Details Section */}
              <div 
                className={`form-section-title ${collapsedSections.clientDetails ? 'collapsed' : ''}`}
                onClick={() => toggleSection('clientDetails')}
              >
                Client Details
                <span className="collapse-icon">▼</span>
              </div>
              <div className={`form-section-content ${collapsedSections.clientDetails ? 'collapsed' : ''}`}>
                <div className="form-group">
                  <label htmlFor="clientName">Client Name *</label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="Company or organization name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactPerson">Contact Person *</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Primary contact person"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="designation">Designation</label>
                  <input
                    type="text"
                    id="designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    placeholder="Job title or position"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="client@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Client Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Complete client address"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Right Column - Project & Technical Details */}
            <div className="form-column">
              {/* Project Details Section */}
              <div 
                className={`form-section-title ${collapsedSections.projectDetails ? 'collapsed' : ''}`}
                onClick={() => toggleSection('projectDetails')}
              >
                Project Details
                <span className="collapse-icon">▼</span>
              </div>
              <div className={`form-section-content ${collapsedSections.projectDetails ? 'collapsed' : ''}`}>
                <div className="form-group">
                  <label htmlFor="projectName">Project Name *</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectType">Project Type / Sector</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Sector</option>
                    <option value="Solar Power Plant">Solar Power Plant</option>
                    <option value="Wind Power Plant">Wind Power Plant</option>
                    <option value="Hybrid Power Plant">Hybrid Power Plant</option>
                    <option value="Industrial Setup">Industrial Setup</option>
                    <option value="Commercial Building">Commercial Building</option>
                    <option value="Residential Complex">Residential Complex</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="scopeOfWork">Scope of Work *</label>
                  <textarea
                    id="scopeOfWork"
                    name="scopeOfWork"
                    value={formData.scopeOfWork}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Brief description of work scope and deliverables"
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedValue">Estimated Value</label>
                  <input
                    type="number"
                    id="estimatedValue"
                    name="estimatedValue"
                    value={formData.estimatedValue}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedDuration">Estimated Duration</label>
                  <input
                    type="text"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 6 months, 1 year"
                  />
                </div>
              </div>

              {/* Status & Timeline Section */}
              <div 
                className={`form-section-title ${collapsedSections.statusTimeline ? 'collapsed' : ''}`}
                onClick={() => toggleSection('statusTimeline')}
              >
                Status & Timeline
                <span className="collapse-icon">▼</span>
              </div>
              <div className={`form-section-content ${collapsedSections.statusTimeline ? 'collapsed' : ''}`}>
                <div className="form-group">
                  <label htmlFor="currentStatus">Current Status *</label>
                  <select
                    id="currentStatus"
                    name="currentStatus"
                    value={formData.currentStatus}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Discussion">Under Discussion</option>
                    <option value="Awaiting Response">Awaiting Response</option>
                    <option value="Awarded">Awarded</option>
                    <option value="Lost">Lost</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="submissionMode">Submission Mode</label>
                  <select
                    id="submissionMode"
                    name="submissionMode"
                    value={formData.submissionMode}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Mode</option>
                    <option value="Email">Email</option>
                    <option value="Client Portal">Client Portal</option>
                    <option value="Hard Copy">Hard Copy</option>
                    <option value="Online Submission">Online Submission</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="followUpDate">Follow-up Date</label>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expectedDecisionDate">Expected Decision Date</label>
                  <input
                    type="date"
                    id="expectedDecisionDate"
                    name="expectedDecisionDate"
                    value={formData.expectedDecisionDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Additional Details Section */}
              <div 
                className={`form-section-title ${collapsedSections.additionalDetails ? 'collapsed' : ''}`}
                onClick={() => toggleSection('additionalDetails')}
              >
                Additional Details
                <span className="collapse-icon">▼</span>
              </div>
              <div className={`form-section-content ${collapsedSections.additionalDetails ? 'collapsed' : ''}`}>
                <div className="form-group">
                  <label htmlFor="proposalOwner">Proposal Owner</label>
                  <input
                    type="text"
                    id="proposalOwner"
                    name="proposalOwner"
                    value={formData.proposalOwner}
                    onChange={handleInputChange}
                    placeholder="Responsible person"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Department</option>
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Business Development">Business Development</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="internalNotes">Internal Notes</label>
                  <textarea
                    id="internalNotes"
                    name="internalNotes"
                    value={formData.internalNotes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Internal comments and notes"
                  ></textarea>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
