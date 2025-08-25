'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import CompanyForm from '@/components/companies/CompanyForm';
import './companies.css';

export default function CompaniesPage() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: 'All',
    city: 'All',
    employeeCount: 'All'
  });
  
  const [stats, setStats] = useState({
    total: 0,
    industries: 0,
    cities: 0,
    lastAdded: null
  });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCompanies();
  }, [router]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/companies?search=${encodeURIComponent(searchTerm)}&limit=100`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch companies`);
      }
      
      const data = await response.json();
      const companiesData = data.companies || [];
      setCompanies(companiesData);
      
      // Calculate stats
      const totalCompanies = companiesData.length;
      const uniqueIndustries = new Set(companiesData.filter(c => c.industry).map(c => c.industry)).size;
      const uniqueCities = new Set(companiesData.filter(c => c.city).map(c => c.city)).size;
      const lastAdded = companiesData.length > 0 ? companiesData[0].created_at : null;
      
      setStats({
        total: totalCompanies,
        industries: uniqueIndustries,
        cities: uniqueCities,
        lastAdded: lastAdded
      });
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (companyData) => {
    try {
      const url = editingCompany ? '/api/companies' : '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      
      if (editingCompany) {
        companyData.id = editingCompany.id;
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      });

      if (response.ok) {
        alert(editingCompany ? 'Company updated successfully!' : 'Company created successfully!');
        setShowForm(false);
        setEditingCompany(null);
        fetchCompanies();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to save company'));
      }
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Error saving company. Please try again.');
    }
  };

  const handleEditCompany = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleDeleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company?')) return;
    
    try {
      const response = await fetch(`/api/companies?id=${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Company deleted successfully!');
        fetchCompanies();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete company'));
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company. Please try again.');
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
      const response = await fetch('/api/companies/import', {
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
      const response = await fetch('/api/companies/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(`Import completed! ${result.imported} companies imported, ${result.failed} failed.`);
        setShowImportModal(false);
        setImportPreview(null);
        fetchCompanies();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error importing companies:', error);
      alert('Error importing companies. Please try again.');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatRevenue = (revenue, currency = 'INR') => {
    if (!revenue) return '-';
    const num = parseFloat(revenue);
    if (currency === 'INR') {
      if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
      if (num >= 100000) return `₹${(num / 100000).toFixed(1)} L`;
      return `₹${num.toLocaleString()}`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  const filteredCompanies = companies.filter(company => {
    if (filters.industry !== 'All' && company.industry !== filters.industry) return false;
    if (filters.city !== 'All' && company.city !== filters.city) return false;
    if (filters.employeeCount !== 'All' && company.employee_count !== filters.employeeCount) return false;
    return true;
  });

  if (!user) return null;

  return (
    <div className="companies-page">
      <Navigation user={user} />
      
      <main className="companies-main">
        <div className="companies-container">
          {/* Header Section */}
          <div className="companies-header">
            <div className="header-content">
              <h1>Company Management</h1>
              <p>Manage your company database and contacts</p>
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
                New Company
              </button>
              <button className="btn-secondary">
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="companies-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0f9ff'}}>
                <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Companies</h3>
                <p className="stat-number">{stats.total}</p>
                <span className="stat-change neutral">In database</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fff7ed'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Industries</h3>
                <p className="stat-number">{stats.industries}</p>
                <span className="stat-change neutral">Unique sectors</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#d1fae5'}}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Cities</h3>
                <p className="stat-number">{stats.cities}</p>
                <span className="stat-change neutral">Locations</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 1118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Last Added</h3>
                <p className="stat-number">{stats.lastAdded ? formatDate(stats.lastAdded) : 'None'}</p>
                <span className="stat-change neutral">Recent activity</span>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="companies-filters">
            <input 
              type="text" 
              placeholder="Search companies..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <select 
              className="filter-select" 
              value={filters.industry} 
              onChange={(e) => setFilters({...filters, industry: e.target.value})}
            >
              <option value="All">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>

            <select 
              className="filter-select" 
              value={filters.employeeCount} 
              onChange={(e) => setFilters({...filters, employeeCount: e.target.value})}
            >
              <option value="All">All Sizes</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading companies...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchCompanies} className="btn-secondary">Retry</button>
            </div>
          ) : (
            <div className="companies-table-container">
              <div className="table-header">
                <h2>Company Directory</h2>
                <div className="table-actions">
                  <span className="results-count">{filteredCompanies.length} companies</span>
                </div>
              </div>

              <div className="companies-table">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Industry</th>
                      <th>Contact</th>
                      <th>Location</th>
                      <th>Size</th>
                      <th>Revenue</th>
                      <th>Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr key={company.id}>
                        <td>
                          <div className="company-info">
                            <p className="company-name">{company.name}</p>
                            <span className="company-type">{company.company_type || 'Private'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="industry-info">
                            <p>{company.industry || '-'}</p>
                            <span className="sector">{company.sector || ''}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-info">
                            <p>{company.primary_contact_name || company.email || '-'}</p>
                            <span className="contact-details">{company.phone || company.primary_contact_phone || '-'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="location-info">
                            <p>{company.city || '-'}</p>
                            <span className="state">{company.state || ''}</span>
                          </div>
                        </td>
                        <td className="size-cell">{company.employee_count || '-'}</td>
                        <td className="revenue-cell">{formatRevenue(company.annual_revenue, company.currency)}</td>
                        <td>{formatDate(company.created_at)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon"
                              title="Edit Company"
                              onClick={() => handleEditCompany(company)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon"
                              title="View Details"
                              onClick={() => router.push(`/companies/${company.id}`)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon btn-delete"
                              title="Delete Company"
                              onClick={() => handleDeleteCompany(company.id)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredCompanies.length === 0 && !loading && (
                  <div className="empty-state">
                    <div className="empty-icon">🏢</div>
                    <h3>No companies found</h3>
                    <p>Create your first company to get started.</p>
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                      + Add First Company
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Company Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <CompanyForm
              company={editingCompany}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCompany(null);
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
                  {importPreview.summary?.errorRows?.slice(0, 5).map((row, index) => (
                    <div key={index} className="error-row">
                      <strong>Row {row.rowNumber}:</strong> {row.errors?.join(', ')}
                    </div>
                  ))}
                  {importPreview.summary?.errorRows?.length > 5 && (
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
                        <th>Industry</th>
                        <th>City</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Website</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.data?.slice(0, 5).map((row, index) => (
                        <tr key={index} className={row.errors ? 'error-row' : 'valid-row'}>
                          <td>{row.name || '-'}</td>
                          <td>{row.industry || '-'}</td>
                          <td>{row.city || '-'}</td>
                          <td>{row.phone || '-'}</td>
                          <td>{row.email || '-'}</td>
                          <td>{row.website || '-'}</td>
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
                {importLoading ? '⏳ Importing...' : `✅ Import ${importPreview.validRows} Companies`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
