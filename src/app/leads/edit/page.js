"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/navigation/Navigation";
import "../add/lead-form-page.css";

function EditLeadContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('id');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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
    country: "India",
    pincode: "",
    sector: "",
    phone: "",
    email: "",
    website: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchCompanies();
    
    if (leadId) {
      fetchLead(leadId);
    } else {
      router.push('/leads');
    }
  }, [router, leadId]);

  useEffect(() => {
    if (formData.company_name && companies.length > 0) {
      const company = companies.find(c => c.name === formData.company_name);
      if (company) {
        setFormData(prev => ({
          ...prev,
          company_address: company.address || prev.company_address,
          city: company.city || prev.city,
          state: company.state || prev.state,
          sector: company.sector || prev.sector,
          website: company.website || prev.website
        }));
      }
    }
  }, [formData.company_name, companies]);

  const fetchLead = async (id) => {
    try {
      const response = await fetch(`/api/leads?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.leads && data.leads.length > 0) {
          const lead = data.leads[0];
          setFormData({
            ...lead,
            expected_closure_date: lead.expected_closure_date ? 
              new Date(lead.expected_closure_date).toISOString().split('T')[0] : ""
          });
        }
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: leadId }),
      });

      if (response.ok) {
        router.push('/leads');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to update lead'));
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      alert('Error updating lead. Please try again.');
    } finally {
      setSaving(false);
    }
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
          sector: company.sector || '',
          website: company.website || ''
        }));
        setNewCompany({
          name: "",
          address: "",
          city: "",
          state: "",
          country: "India",
          pincode: "",
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

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container">
        <Navigation />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading lead...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Navigation />
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">✏️ Edit Lead</h1>
              <p className="page-description">
                Update lead information: {formData.title || 'Untitled Lead'}
              </p>
            </div>
            <div className="header-actions">
              <button
                type="button"
                onClick={() => router.push('/leads')}
                className="btn btn-secondary"
              >
                ← Back to Leads
              </button>
              <button
                type="submit"
                form="lead-form"
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? "Updating..." : "💾 Update Lead"}
              </button>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container">
          <form id="lead-form" onSubmit={handleSubmit} className="lead-form-page">
            
            {/* Basic Information */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">📋 Basic Information</h3>
                <p className="section-description">Essential lead contact details</p>
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
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
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
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">🏢 Company Information</h3>
                <p className="section-description">Company details and location</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Company Name <span className="required">*</span></label>
                  <div className="company-input-group">
                    <select
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      required
                      className="form-select"
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
                  
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Or type custom company name"
                    className="form-input"
                    style={{marginTop: '8px'}}
                  />
                </div>

                <div className="form-group">
                  <label>Sector</label>
                  <select
                    name="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Sector</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Education">Education</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Company Address</label>
                  <textarea
                    name="company_address"
                    value={formData.company_address}
                    onChange={handleInputChange}
                    placeholder="Complete company address"
                    rows="3"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State name"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>PIN Code</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="110001"
                    className="form-input"
                  />
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
                        placeholder="Company name"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newCompany.phone}
                        onChange={handleCompanyInputChange}
                        placeholder="+91 98765 43210"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newCompany.email}
                        onChange={handleCompanyInputChange}
                        placeholder="info@company.com"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={newCompany.city}
                        onChange={handleCompanyInputChange}
                        placeholder="City"
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="quick-company-actions">
                    <button
                      type="button"
                      onClick={handleQuickCompanyAdd}
                      className="btn btn-primary btn-small"
                    >
                      Add Company
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
            </div>

            {/* Lead Details */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">💼 Lead Details</h3>
                <p className="section-description">Project information and requirements</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Enquiry Type</label>
                  <select
                    name="enquiry_type"
                    value={formData.enquiry_type}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Enquiry Type</option>
                    <option value="New Project">New Project</option>
                    <option value="Website Development">Website Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Estimated Value</label>
                  <input
                    type="number"
                    name="estimated_value"
                    value={formData.estimated_value}
                    onChange={handleInputChange}
                    placeholder="100000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Expected Closure Date</label>
                  <input
                    type="date"
                    name="expected_closure_date"
                    value={formData.expected_closure_date}
                    onChange={handleInputChange}
                    className="form-input"
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
                    className="form-range"
                  />
                  <div className="range-value">{formData.probability}%</div>
                </div>

                <div className="form-group full-width">
                  <label>Project Description</label>
                  <textarea
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleInputChange}
                    placeholder="Detailed description of the project or requirements"
                    rows="4"
                    className="form-textarea"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Requirements</label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleInputChange}
                    placeholder="Specific requirements and technical details"
                    rows="3"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

            {/* Status & Assignment */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">⚡ Status & Assignment</h3>
                <p className="section-description">Lead status and assignment details</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Stage</label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Initial Contact">Initial Contact</option>
                    <option value="Qualification">Qualification</option>
                    <option value="Needs Analysis">Needs Analysis</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closing">Closing</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Source</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="">Select Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Advertisement">Advertisement</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Assigned To</label>
                  <input
                    type="text"
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleInputChange}
                    placeholder="Sales representative name"
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">📝 Additional Notes</h3>
                <p className="section-description">Additional information and internal notes</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Internal notes, follow-up details, or any additional information"
                    rows="4"
                    className="form-textarea"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function EditLeadLoading() {
  return (
    <div className="page-container">
      <Navigation />
      <div className="main-content">
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function EditLeadPage() {
  return (
    <Suspense fallback={<EditLeadLoading />}>
      <EditLeadContent />
    </Suspense>
  );
}
