"use client";

import { useState, useEffect } from "react";
import "./CompanyForm.css";

export default function CompanyForm({ company, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    industry: "",
    sector: "",
    company_type: "Private",
    founded_year: "",
    
    // Contact Information
    phone: "",
    email: "",
    website: "",
    fax: "",
    
    // Address Details
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    
    // Business Details
    employee_count: "",
    annual_revenue: "",
    currency: "INR",
    business_description: "",
    
    // Contact Person
    primary_contact_name: "",
    primary_contact_designation: "",
    primary_contact_phone: "",
    primary_contact_email: "",
    
    // Additional Info
    gst_number: "",
    pan_number: "",
    registration_number: "",
    tax_id: "",
    notes: "",
    tags: ""
  });

  // Helper function to ensure no null values
  const initializeFormData = () => ({
    name: "",
    industry: "",
    sector: "",
    company_type: "Private",
    founded_year: "",
    phone: "",
    email: "",
    website: "",
    fax: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    employee_count: "",
    annual_revenue: "",
    currency: "INR",
    business_description: "",
    primary_contact_name: "",
    primary_contact_designation: "",
    primary_contact_phone: "",
    primary_contact_email: "",
    gst_number: "",
    pan_number: "",
    registration_number: "",
    tax_id: "",
    notes: "",
    tags: ""
  });

  useEffect(() => {
    if (company) {
      // Clean company data and convert null values to empty strings
      const baseData = initializeFormData();
      const cleanedCompany = {};
      
      Object.keys(company).forEach(key => {
        if (company[key] === null || company[key] === undefined) {
          cleanedCompany[key] = baseData[key] !== undefined ? baseData[key] : '';
        } else {
          cleanedCompany[key] = company[key];
        }
      });
      
      setFormData({
        ...baseData,
        ...cleanedCompany
      });
    } else {
      setFormData(initializeFormData());
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="company-form-container">
      {/* Floating Save Button */}
      <div className="floating-save-buttons">
        <button
          type="submit"
          onClick={handleSubmit}
          className="btn btn-primary"
        >
          💾 {company ? "Update" : "Save"} Company
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          ❌ Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="company-form">
        {/* Basic Information */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Construction">Construction</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Transportation">Transportation</option>
                <option value="Media & Entertainment">Media & Entertainment</option>
                <option value="Government">Government</option>
                <option value="Non-Profit">Non-Profit</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Sector</label>
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                placeholder="e.g., IT Services, Software"
              />
            </div>

            <div className="form-group">
              <label>Company Type</label>
              <select
                name="company_type"
                value={formData.company_type}
                onChange={handleInputChange}
              >
                <option value="Private">Private Limited</option>
                <option value="Public">Public Limited</option>
                <option value="Partnership">Partnership</option>
                <option value="LLP">Limited Liability Partnership</option>
                <option value="Sole Proprietorship">Sole Proprietorship</option>
                <option value="Government">Government</option>
                <option value="NGO">Non-Governmental Organization</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Founded Year</label>
              <input
                type="number"
                name="founded_year"
                value={formData.founded_year}
                onChange={handleInputChange}
                placeholder="e.g., 2010"
                min="1800"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h3 className="section-title">Contact Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91-XXXXXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@company.com"
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
              />
            </div>

            <div className="form-group">
              <label>Fax</label>
              <input
                type="tel"
                name="fax"
                value={formData.fax}
                onChange={handleInputChange}
                placeholder="Fax number"
              />
            </div>
          </div>
        </div>

        {/* Address Details */}
        <div className="form-section">
          <h3 className="section-title">Address Details</h3>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="3"
                placeholder="Complete address"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="City"
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Delhi">Delhi</option>
              </select>
            </div>

            <div className="form-group">
              <label>Country</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                placeholder="PIN/ZIP Code"
              />
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="form-section">
          <h3 className="section-title">Business Details</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Employee Count</label>
              <select
                name="employee_count"
                value={formData.employee_count}
                onChange={handleInputChange}
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="form-group">
              <label>Annual Revenue</label>
              <input
                type="number"
                name="annual_revenue"
                value={formData.annual_revenue}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Business Description</label>
              <textarea
                name="business_description"
                value={formData.business_description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe the company's business, products, and services..."
              />
            </div>
          </div>
        </div>

        {/* Primary Contact */}
        <div className="form-section">
          <h3 className="section-title">Primary Contact Person</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="primary_contact_name"
                value={formData.primary_contact_name}
                onChange={handleInputChange}
                placeholder="Primary contact person"
              />
            </div>

            <div className="form-group">
              <label>Designation</label>
              <input
                type="text"
                name="primary_contact_designation"
                value={formData.primary_contact_designation}
                onChange={handleInputChange}
                placeholder="CEO, Manager, etc."
              />
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="primary_contact_phone"
                value={formData.primary_contact_phone}
                onChange={handleInputChange}
                placeholder="Direct phone number"
              />
            </div>

            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                name="primary_contact_email"
                value={formData.primary_contact_email}
                onChange={handleInputChange}
                placeholder="Direct email"
              />
            </div>
          </div>
        </div>

        {/* Legal & Tax Information */}
        <div className="form-section">
          <h3 className="section-title">Legal & Tax Information</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                name="gst_number"
                value={formData.gst_number}
                onChange={handleInputChange}
                placeholder="GST Registration Number"
              />
            </div>

            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleInputChange}
                placeholder="PAN Number"
              />
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                placeholder="Company Registration Number"
              />
            </div>

            <div className="form-group">
              <label>Tax ID</label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                placeholder="Tax Identification Number"
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="form-section">
          <h3 className="section-title">Additional Information</h3>
          
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes or comments..."
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., client, partner, vendor (comma-separated)"
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
            {company ? "✅ Update Company" : "✅ Save Company"}
          </button>
        </div>
      </form>
    </div>
  );
}
