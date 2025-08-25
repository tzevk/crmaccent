'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import '../leads.css';
import './new-lead.css';

export default function NewLeadPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    enquiry_date: new Date().toISOString().split('T')[0],
    enquiry_type: 'Direct',
    source: '',
    company_name: '',
    city: '',
    industry: '',
    contact_name: '',
    designation: '',
    mobile: '',
    email: '',
    address: '',
    project_name: '',
    project_description: '',
    estimated_value: '',
    estimated_duration: '',
    currency: 'INR',
    enquiry_status: 'New',
    project_status: 'Pending',
    lead_stage: 'New',
    assigned_to: '',
    remarks: ''
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          created_by: user?.id || 1
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert(`Lead created successfully! Enquiry No: ${result.enquiry_no}`);
        router.push('/leads');
      } else {
        throw new Error(result.error || 'Failed to create lead');
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="leads-page">
      <Navigation user={user} />
      
      <main className="leads-main">
        <div className="leads-container">
          {/* Header */}
          <div className="new-lead-header">
            <div className="header-content">
              <Link href="/leads" className="back-link">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Leads
              </Link>
              <h1>Add New Lead</h1>
              <p>Create a new lead in your sales pipeline</p>
            </div>
          </div>

          {/* Form */}
          <div className="new-lead-form-container">
            <form onSubmit={handleSubmit} className="new-lead-form">
              
              {/* Lead Details Section */}
              <div className="form-section">
                <h2>Lead Details</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="enquiry_date">Enquiry Date *</label>
                    <input
                      type="date"
                      id="enquiry_date"
                      name="enquiry_date"
                      value={formData.enquiry_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="enquiry_type">Enquiry Type</label>
                    <select
                      id="enquiry_type"
                      name="enquiry_type"
                      value={formData.enquiry_type}
                      onChange={handleChange}
                    >
                      <option value="Direct">Direct</option>
                      <option value="Reference">Reference</option>
                      <option value="Exhibition">Exhibition</option>
                      <option value="Website">Website</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Cold Call">Cold Call</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="source">Source</label>
                    <input
                      type="text"
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="Referrer name, website, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lead_stage">Lead Stage</label>
                    <select
                      id="lead_stage"
                      name="lead_stage"
                      value={formData.lead_stage}
                      onChange={handleChange}
                    >
                      <option value="New">New</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed-Won">Closed-Won</option>
                      <option value="Closed-Lost">Closed-Lost</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="form-section">
                <h2>Company Information</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="company_name">Company Name *</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter company name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Company location"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="industry">Industry/Sector</label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Manufacturing, IT, etc."
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Complete address (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h2>Contact Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="contact_name">Contact Person *</label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      required
                      placeholder="Primary contact name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="designation">Designation</label>
                    <input
                      type="text"
                      id="designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Manager, Director, etc."
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email ID</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contact@company.com"
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="form-section">
                <h2>Project Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="project_name">Project Name</label>
                    <input
                      type="text"
                      id="project_name"
                      name="project_name"
                      value={formData.project_name}
                      onChange={handleChange}
                      placeholder="Project title (if known)"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="project_description">Project Description</label>
                    <select
                      id="project_description"
                      name="project_description"
                      value={formData.project_description}
                      onChange={handleChange}
                    >
                      <option value="">Select project type</option>
                      <option value="Software Development">Software Development</option>
                      <option value="Web Application">Web Application</option>
                      <option value="Mobile Application">Mobile Application</option>
                      <option value="ERP System">ERP System</option>
                      <option value="CRM System">CRM System</option>
                      <option value="E-commerce">E-commerce</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="estimated_value">Estimated Value</label>
                    <input
                      type="number"
                      id="estimated_value"
                      name="estimated_value"
                      value={formData.estimated_value}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="estimated_duration">Duration (months)</label>
                    <input
                      type="number"
                      id="estimated_duration"
                      name="estimated_duration"
                      value={formData.estimated_duration}
                      onChange={handleChange}
                      placeholder="Project duration"
                      min="1"
                      max="120"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Assignment */}
              <div className="form-section">
                <h2>Status & Assignment</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="enquiry_status">Enquiry Status</label>
                    <select
                      id="enquiry_status"
                      name="enquiry_status"
                      value={formData.enquiry_status}
                      onChange={handleChange}
                    >
                      <option value="New">New</option>
                      <option value="Awaiting">Awaiting Response</option>
                      <option value="In Discussion">In Discussion</option>
                      <option value="Awarded">Awarded</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="project_status">Project Status</label>
                    <select
                      id="project_status"
                      name="project_status"
                      value={formData.project_status}
                      onChange={handleChange}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Hold">Hold</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="assigned_to">Assigned To</label>
                    <select
                      id="assigned_to"
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                    >
                      <option value="">Select sales rep</option>
                      <option value="1">Sales Rep 1</option>
                      <option value="2">Sales Rep 2</option>
                      <option value="3">Sales Rep 3</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="remarks">Remarks/Notes</label>
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Additional notes, requirements, or observations..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="form-actions">
                <Link href="/leads" className="btn-cancel">
                  Cancel
                </Link>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Lead...' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
