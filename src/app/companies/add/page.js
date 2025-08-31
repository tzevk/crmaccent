'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import './addCompany.css';

function AddCompanyContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    sector: '',
    description: '',
    employees_count: '',
    annual_revenue: '',
    founded_year: ''
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs = [
    { 
      key: 'basic', 
      label: 'Basic Info', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Company name, contact details'
    },
    { 
      key: 'details', 
      label: 'Company Details', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      description: 'Sector, employees, revenue'
    },
    { 
      key: 'address', 
      label: 'Address Info', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      description: 'Location and address details'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));

    // Check if we're in edit mode
    const editId = searchParams.get('edit');
    if (editId) {
      setIsEditing(true);
      setCompanyId(editId);
      loadCompanyData(editId);
    }
  }, [router, searchParams]);

  const loadCompanyData = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`);
      if (response.ok) {
        const company = await response.json();
        // Ensure all fields have default empty string values to prevent null/undefined issues
        setCompanyData({
          name: company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          website: company.website || '',
          address: company.address || '',
          city: company.city || '',
          state: company.state || '',
          postal_code: company.postal_code || '',
          country: company.country || 'India',
          sector: company.sector || '',
          description: company.description || '',
          employees_count: company.employees_count || '',
          annual_revenue: company.annual_revenue || '',
          founded_year: company.founded_year || ''
        });
      } else {
        console.error('Failed to load company data');
        router.push('/companies');
      }
    } catch (error) {
      console.error('Error loading company:', error);
      router.push('/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!companyData.name || !companyData.email) {
      alert('Please fill in company name and email');
      return;
    }

    setLoading(true);
    
    try {
      const url = isEditing ? '/api/companies' : '/api/companies';
      const method = isEditing ? 'PUT' : 'POST';
      const payload = isEditing ? { ...companyData, id: companyId } : companyData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEditing ? 'Company updated successfully!' : 'Company added successfully!');
        router.push('/companies');
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || `Failed to ${isEditing ? 'update' : 'save'} company`));
      }
    } catch (err) {
      console.error('Error saving company:', err);
      alert('Error saving company. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/companies');
  };

  const getCurrentTabLabel = () => {
    return tabs.find(tab => tab.key === activeTab)?.label || '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="form-section">
            <h3>Basic Information</h3>
            <p>Enter the fundamental company details</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Company Name *</label>
                <input
                  type="text"
                  id="name"
                  value={companyData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={companyData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={companyData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  value={companyData.website || ''}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.company.com"
                />
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="form-section">
            <h3>Company Details</h3>
            <p>Additional information about the company</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="sector">Sector</label>
                <select
                  id="sector"
                  value={companyData.sector || ''}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                >
                  <option value="">Select sector</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="employees_count">Number of Employees</label>
                <select
                  id="employees_count"
                  value={companyData.employees_count || ''}
                  onChange={(e) => handleInputChange('employees_count', e.target.value)}
                >
                  <option value="">Select range</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="annual_revenue">Annual Revenue</label>
                <input
                  type="text"
                  id="annual_revenue"
                  value={companyData.annual_revenue || ''}
                  onChange={(e) => handleInputChange('annual_revenue', e.target.value)}
                  placeholder="e.g., ₹1Cr - ₹10Cr"
                />
              </div>

              <div className="form-group">
                <label htmlFor="founded_year">Founded Year</label>
                <input
                  type="number"
                  id="founded_year"
                  value={companyData.founded_year || ''}
                  onChange={(e) => handleInputChange('founded_year', e.target.value)}
                  placeholder="e.g., 2010"
                  min="1800"
                  max="2025"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={companyData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the company"
                  rows="4"
                />
              </div>
            </div>
          </div>
        );

      case 'address':
        return (
          <div className="form-section">
            <h3>Address Information</h3>
            <p>Location and contact address details</p>
            
            <div className="form-grid">
              <div className="form-group full-width">
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  value={companyData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={companyData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                >
                  <option value="">Select city</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <input
                  type="text"
                  id="state"
                  value={companyData.state || ''}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>

              <div className="form-group">
                <label htmlFor="postal_code">Postal Code</label>
                <input
                  type="text"
                  id="postal_code"
                  value={companyData.postal_code || ''}
                  onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  placeholder="Enter postal code"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  value={companyData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
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

  return (
    <div className="add-company-page">
      <Navigation />
      
      <main className="add-company-main">
        <div className="add-company-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>{isEditing ? 'Edit Company' : 'Add New Company'}</h1>
                <p>{isEditing ? 'Update company profile with detailed information' : 'Create a new company profile with detailed information'}</p>
              </div>
              <div className="header-actions">
                <button className="btn-secondary" onClick={handleCancel}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
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

          {/* Content */}
          <div className="content-section">
            <form onSubmit={handleSubmit}>
              {renderTabContent()}
              
              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (isEditing ? 'Updating Company...' : 'Saving Company...') : (isEditing ? 'Update Company' : 'Save Company')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AddCompanyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddCompanyContent />
    </Suspense>
  );
}
