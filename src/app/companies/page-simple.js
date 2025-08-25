'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import CompanyForm from '@/components/companies/CompanyForm';
import './companies.css';

export default function CompaniesPage() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const router = useRouter();

  const sectors = ['Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Others'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Others'];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadCompanies();
  }, [router]);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, filterSector, filterCity, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      const data = await response.json();
      if (data.success) {
        setCompanies(data.companies);
      } else {
        console.error('Failed to load companies:', data.error);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.phone?.includes(searchTerm) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSector && filterSector !== '') {
      filtered = filtered.filter(company => company.sector === filterSector);
    }

    if (filterCity && filterCity !== '') {
      filtered = filtered.filter(company => company.city === filterCity);
    }

    setFilteredCompanies(filtered);
  };

  const handleFormSubmit = async (companyData) => {
    try {
      const url = '/api/companies';
      const method = editingCompany ? 'PUT' : 'POST';
      
      if (editingCompany) {
        companyData.id = editingCompany.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData),
      });

      if (response.ok) {
        setShowForm(false);
        setEditingCompany(null);
        loadCompanies();
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
        loadCompanies();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete company'));
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company. Please try again.');
    }
  };

  // Excel Import Functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('action', 'preview');

    try {
      const response = await fetch('/api/companies/import-names', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setImportPreview(result);
      } else {
        alert('Error previewing file: ' + result.error);
      }
    } catch (error) {
      console.error('Error previewing import:', error);
      alert('Error previewing file. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('action', 'import');

    try {
      const response = await fetch('/api/companies/import-names', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(`Import completed! ${result.imported} companies imported successfully.`);
        setShowExcelImport(false);
        setImportPreview(null);
        setSelectedFile(null);
        loadCompanies();
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('Import failed: ' + result.error);
      }
    } catch (error) {
      console.error('Error importing companies:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page-wrapper">
      <Navigation />
      <div className="content-area">
        <div className="page-header">
          <h1 className="page-title">Company Management</h1>
          <div className="header-actions">
            <button 
              className="btn-primary"
              onClick={() => setShowExcelImport(true)}
            >
              📊 Import Excel
            </button>
            <button 
              className="btn-primary"
              onClick={() => setShowForm(true)}
            >
              + Add Company
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{companies.length}</div>
            <div className="stat-label">Total Companies</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{new Set(companies.map(c => c.sector)).size}</div>
            <div className="stat-label">Sectors</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{new Set(companies.map(c => c.city)).size}</div>
            <div className="stat-label">Cities</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredCompanies.length}</div>
            <div className="stat-label">Filtered Results</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-filter-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="filter-select"
          >
            <option value="">All Sectors</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="filter-select"
          >
            <option value="">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Companies Table */}
        <div className="data-table-container">
          {loading ? (
            <div className="loading-state">Loading companies...</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Sector</th>
                  <th>City</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(company => (
                  <tr key={company.id}>
                    <td className="company-name-cell">
                      <div className="company-name">{company.name}</div>
                      {company.website && (
                        <div className="company-website">{company.website}</div>
                      )}
                    </td>
                    <td>
                      <span className="sector-badge">{company.sector || '-'}</span>
                    </td>
                    <td>{company.city || '-'}</td>
                    <td>{company.phone || '-'}</td>
                    <td>{company.email || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditCompany(company)}
                          className="btn-action edit"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="btn-action delete"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Company Form Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
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

        {/* Excel Import Modal */}
        {showExcelImport && (
          <div className="modal-overlay">
            <div className="modal-content excel-import-modal">
              <div className="modal-header">
                <h2>Import Company Names</h2>
                <button 
                  className="close-button"
                  onClick={() => {
                    setShowExcelImport(false);
                    resetImport();
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                {!importPreview ? (
                  <div className="file-upload-section">
                    <div className="upload-info">
                      <h3>📋 Upload Excel File</h3>
                      <p>Upload an Excel file containing company names. The system will automatically detect columns for:</p>
                      <ul>
                        <li><strong>Company Name</strong> (Required)</li>
                        <li>City (Optional)</li>
                        <li>Sector/Industry (Optional)</li>
                        <li>Phone (Optional)</li>
                        <li>Email (Optional)</li>
                      </ul>
                    </div>
                    
                    <div className="file-input-area">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileSelect}
                        className="file-input"
                      />
                      {selectedFile && (
                        <div className="selected-file">
                          Selected: {selectedFile.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="modal-actions">
                      <button
                        onClick={() => {
                          setShowExcelImport(false);
                          resetImport();
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePreview}
                        disabled={!selectedFile || importing}
                        className="btn-primary"
                      >
                        {importing ? 'Processing...' : 'Preview Import'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="preview-section">
                    <div className="preview-header">
                      <h3>📊 Import Preview</h3>
                      <div className="preview-stats">
                        <span className="stat-item">Total: {importPreview.totalRows}</span>
                        <span className="stat-item success">Valid: {importPreview.validRows}</span>
                        <span className="stat-item error">Errors: {importPreview.errorRows}</span>
                      </div>
                    </div>
                    
                    {importPreview.data && importPreview.data.length > 0 && (
                      <div className="preview-table-container">
                        <table className="preview-table">
                          <thead>
                            <tr>
                              <th>Row</th>
                              <th>Company Name</th>
                              <th>City</th>
                              <th>Sector</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.data.slice(0, 10).map((row, index) => (
                              <tr key={index} className={row.errors.length > 0 ? 'error-row' : 'valid-row'}>
                                <td>{row.rowNumber}</td>
                                <td>{row.name || '-'}</td>
                                <td>{row.city || '-'}</td>
                                <td>{row.sector || '-'}</td>
                                <td>
                                  {row.errors.length > 0 ? (
                                    <span className="status error">❌ {row.errors[0]}</span>
                                  ) : (
                                    <span className="status success">✅ Valid</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="modal-actions">
                      <button
                        onClick={() => setImportPreview(null)}
                        className="btn-secondary"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleImport}
                        disabled={importing || importPreview.validRows === 0}
                        className="btn-primary"
                      >
                        {importing ? 'Importing...' : `Import ${importPreview.validRows} Companies`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
