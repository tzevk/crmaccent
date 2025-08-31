'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import './companies.css';

export default function CompaniesPage() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [importing, setImporting] = useState(false);
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
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [searchTerm, filterSector, filterCity, companies]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies || [];
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.phone?.includes(searchTerm) ||
        company.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterSector) filtered = filtered.filter(c => c.sector === filterSector);
    if (filterCity) filtered = filtered.filter(c => c.city === filterCity);
    setFilteredCompanies(filtered);
  };

  const handleEditCompany = (company) => {
    // Navigate to add page with edit mode
    router.push(`/companies/add?edit=${company.id}`);
  };

  const handleDeleteCompany = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const response = await fetch(`/api/companies?id=${id}`, { method: 'DELETE' });
      if (response.ok) loadCompanies();
    } catch (err) {
      console.error(err);
    }
  };

  // Excel Import
  const handleFileSelect = (e) => setSelectedFile(e.target.files[0] || null);

  const handlePreview = async () => {
    if (!selectedFile) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('action', 'preview');
    try {
      const response = await fetch('/api/companies/import-names', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) setImportPreview(result);
      else alert('Error previewing file: ' + result.error);
    } catch (err) {
      console.error(err);
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
      const response = await fetch('/api/companies/import-names', { method: 'POST', body: formData });
      const result = await response.json();
      if (result.success) {
        alert(`Import completed! ${result.imported} companies imported successfully.`);
        setImportPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        loadCompanies();
      } else {
        alert('Import failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
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
    <div className="companies-page">
      <Navigation />
      <main className="companies-main">
        <div className="companies-container">

          {/* Header */}
          <div className="companies-header">
            <div className="header-content">
              <h1>Company Management</h1>
              <p>Manage and organize your company database efficiently</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => { setSearchTerm(''); setFilterSector(''); setFilterCity(''); }}>
                Reset Filters
              </button>
              <Link href="/companies/add" className="btn-primary">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Company
              </Link>
            </div>
          </div>

          {/* Filters */}
          {activeTab === 'list' && (
            <div className="companies-filters">
              <div className="filters-header">
                <h3>Search & Filters</h3>
                <p>Find companies quickly using the options below</p>
              </div>
              <div className="filters-content">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                </div>
                <div className="filters-row">
                  <select value={filterSector} onChange={(e) => setFilterSector(e.target.value)} className="filter-select">
                    <option value="">All Sectors</option>
                    {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="filter-select">
                    <option value="">All Cities</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="btn-secondary" onClick={() => { setSearchTerm(''); setFilterSector(''); setFilterCity(''); }}>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {activeTab === 'list' && (
            <div className="companies-table-section">
              <div className="table-header">
                <div className="table-title">
                  <h2>Companies List</h2>
                  <p>Showing all registered companies</p>
                </div>
                <div className="table-actions">
                  <span className="results-count">{filteredCompanies.length} results</span>
                </div>
              </div>
              <div className="table-container">
                {loading ? (
                  <div className="loading-container"><div className="loading-spinner"></div></div>
                ) : (
                  <table className="companies-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Sector</th><th>City</th><th>Phone</th><th>Email</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCompanies.map(c => (
                        <tr key={c.id}>
                          <td className="company-name-cell">
                            <div className="company-info">
                              <div className="company-name">{c.name}</div>
                              {c.website && <div className="company-website">{c.website}</div>}
                            </div>
                          </td>
                          <td>{c.sector && <span className="sector-tag">{c.sector}</span>}</td>
                          <td className="city-cell">{c.city || '-'}</td>
                          <td className="contact-cell">{c.phone || '-'}</td>
                          <td className="email-cell">{c.email || '-'}</td>
                          <td>
                            <div className="action-buttons">
                              <button onClick={() => handleEditCompany(c)} className="btn-action btn-edit">✎</button>
                              <button onClick={() => handleDeleteCompany(c.id)} className="btn-action btn-delete">🗑</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCompanies.length === 0 && (
                        <tr><td colSpan="6" className="no-data">No companies found</td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Import */}
          {activeTab === 'import' && (
            <div className="info-card">
              {!importPreview ? (
                <div className="file-upload-section">
                  <div className="upload-info">
                    <h3>Upload Excel File</h3>
                    <p>Supported formats: .xlsx, .xls, .csv</p>
                  </div>
                  <div className="file-input-area">
                    <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="file-input" />
                    {selectedFile && <div className="selected-file">Selected: {selectedFile.name}</div>}
                  </div>
                  <div className="form-actions">
                    <button onClick={handlePreview} disabled={!selectedFile || importing} className="btn-primary">
                      {importing ? 'Processing...' : 'Preview Import'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="preview-section">
                  <div className="preview-header">
                    <h3>Import Preview</h3>
                    <div className="preview-stats">
                      <span className="stat-item">Total: {importPreview.totalRows}</span>
                      <span className="stat-item success">Valid: {importPreview.validRows}</span>
                      <span className="stat-item error">Errors: {importPreview.errorRows}</span>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => setImportPreview(null)} className="btn-secondary">Back</button>
                    <button onClick={handleImport} disabled={importing || importPreview.validRows === 0} className="btn-primary">
                      {importing ? 'Importing...' : `Import ${importPreview.validRows} Companies`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}