"use client";

import { useState, useEffect } from "react";
import "./LeadForm.css";

export default function LeadForm({ lead, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // Basic Information
    title: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    
    // Company Details
    company_address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    sector: "",
    
    // Lead Details
    enquiry_type: "",
    project_description: "",
    estimated_value: "",
    expected_closure_date: "",
    probability: 50,
    
    // Status & Assignment
    status: "New",
    stage: "Initial Contact",
    assigned_to: "",
    priority: "Medium",
    source: "",
    
    // Additional Info
    notes: "",
    requirements: ""
  });

  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    sector: "",
    phone: "",
    email: "",
    website: ""
  });

  // Helper function to ensure no null values
  const initializeFormData = () => ({
    title: "",
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    company_address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    sector: "",
    enquiry_type: "",
    project_description: "",
    estimated_value: "",
    expected_closure_date: "",
    probability: 50,
    status: "New",
    stage: "Initial Contact",
    assigned_to: "",
    priority: "Medium",
    source: "",
    notes: "",
    requirements: ""
  });

  useEffect(() => {
    fetchCompanies();
    if (lead) {
      // Clean lead data and convert null values to empty strings
      const baseData = initializeFormData();
      const cleanedLead = {};
      
      Object.keys(lead).forEach(key => {
        if (lead[key] === null || lead[key] === undefined) {
          cleanedLead[key] = baseData[key] !== undefined ? baseData[key] : '';
        } else {
          cleanedLead[key] = lead[key];
        }
      });
      
      setFormData({
        ...baseData,
        ...cleanedLead
      });
    } else {
      setFormData(initializeFormData());
    }
  }, [lead]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        // Extract companies array from API response
        if (data.companies && Array.isArray(data.companies)) {
          setCompanies(data.companies);
        } else {
          console.warn('Companies API returned unexpected format:', data);
          setCompanies([]);
        }
      } else {
        console.error('Failed to fetch companies:', response.status);
        setCompanies([]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleQuickCompanyAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCompany),
      });

      if (response.ok) {
        const company = await response.json();
        setCompanies(prev => [...prev, company]);
        setFormData(prev => ({
          ...prev,
          company_name: company.name,
          company_address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          sector: company.sector || ''
        }));
        setNewCompany({
          name: "",
          address: "",
          city: "",
          state: "",
          sector: "",
          phone: "",
          email: "",
          website: ""
        });
        setShowCompanyForm(false);
        alert('Company added successfully!');
      } else {
        alert('Failed to add company');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Error adding company');
    }
  };

  return (
    <div className="enhanced-modal-wrapper">
      {/* Modal Header */}
      <div className="modal-header-enhanced">
        <div className="modal-title-section">
          <h2 className="modal-title">
            {lead ? "✏️ Edit Lead" : "➕ Add New Lead"}
          </h2>
          <p className="modal-subtitle">
            {lead ? `Editing: ${lead.title || 'Untitled Lead'}` : "Create a new lead entry"}
          </p>
        </div>
        <div className="modal-header-actions">
          <button
            type="button"
            onClick={onCancel}
            className="modal-close-btn"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Modal Body */}
      <div className="modal-body-enhanced">
        <form onSubmit={handleSubmit} className="lead-form-enhanced">
          {/* Progress Indicator */}
          <div className="form-progress">
            <div className="progress-steps">
              <div className="step active">
                <span className="step-number">1</span>
                <span className="step-label">Basic Info</span>
              </div>
              <div className="step active">
                <span className="step-number">2</span>
                <span className="step-label">Company Details</span>
              </div>
              <div className="step active">
                <span className="step-number">3</span>
                <span className="step-label">Lead Details</span>
              </div>
              <div className="step active">
                <span className="step-number">4</span>
                <span className="step-label">Status & Notes</span>
              </div>
            </div>
          </div>
          {/* Basic Information */}
          <div className="form-section-enhanced">
            <div className="section-header">
              <h3 className="section-title">📋 Basic Information</h3>
              <div className="section-description">Essential lead details</div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Lead Title <span className="required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Website Development for ABC Corp"
                  required
                  className="form-input-enhanced"
                />
              </div>

              <div className="form-group">
                <label>Contact Person <span className="required">*</span></label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleInputChange}
                  placeholder="Full name of the contact person"
                  required
                  className="form-input-enhanced"
                />
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@company.com"
                  required
                  className="form-input-enhanced"
                />
              </div>

              <div className="form-group">
                <label>Phone <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  required
                  className="form-input-enhanced"
                />
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="+91 98765 43210"
                  className="form-input-enhanced"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.company.com"
                  className="form-input-enhanced"
                />
              </div>
            </div>
          </div>

            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <div className="company-input-group">
                <select
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select or type company name</option>
                  {Array.isArray(companies) && companies.map(company => (
                    <option key={company.id} value={company.name}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCompanyForm(!showCompanyForm)}
                  className="btn btn-outline btn-small"
                >
                  ➕ Quick Add
                </button>
              </div>
              
              {/* Alternative: Allow typing custom company name */}
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                placeholder="Or type new company name"
                style={{ marginTop: '8px' }}
              />
            </div>

            <div className="form-group">
              <label>Contact Person <span className="required">*</span></label>
              <input
                type="text"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
                placeholder="Primary contact name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@company.com"
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Office phone"
              />
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Mobile number"
              />
            </div>
          </div>
        </div>

        {/* Quick Company Add Form */}
        {showCompanyForm && (
          <div className="quick-company-form">
            <h4>Quick Add Company</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={newCompany.name}
                  onChange={handleCompanyInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={newCompany.city}
                  onChange={handleCompanyInputChange}
                />
              </div>
              <div className="form-group">
                <label>Sector</label>
                <input
                  type="text"
                  name="sector"
                  value={newCompany.sector}
                  onChange={handleCompanyInputChange}
                  placeholder="e.g., IT, Manufacturing"
                />
              </div>
            </div>
            <div className="form-actions-inline">
              <button
                type="button"
                onClick={handleQuickCompanyAdd}
                className="btn btn-primary btn-small"
              >
                ✅ Add Company
              </button>
              <button
                type="button"
                onClick={() => setShowCompanyForm(false)}
                className="btn btn-secondary btn-small"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Company Details */}
        <div className="form-section">
          <h3 className="section-title">Company Details</h3>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="company_address"
                value={formData.company_address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Company address"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Sector</label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                placeholder="Industry sector"
              />
            </div>
          </div>
        </div>

        {/* Lead Details */}
        <div className="form-section">
          <h3 className="section-title">Lead Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Enquiry Type</label>
              <select
                name="enquiry_type"
                value={formData.enquiry_type}
                onChange={handleInputChange}
              >
                <option value="">Select enquiry type</option>
                <option value="Website Development">Website Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Software Development">Software Development</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estimated Value (₹)</label>
              <input
                type="number"
                name="estimated_value"
                value={formData.estimated_value}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Expected Closure Date</label>
              <input
                type="date"
                name="expected_closure_date"
                value={formData.expected_closure_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Probability (%)</label>
              <input
                type="range"
                name="probability"
                value={formData.probability}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="5"
              />
              <span className="range-value">{formData.probability}%</span>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Project Description</label>
              <textarea
                name="project_description"
                value={formData.project_description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe the project requirements..."
              />
            </div>

            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            {lead ? "✅ Update Lead" : "✅ Save Lead"}
          </button>
        </div>
      </form>
      </div>
      