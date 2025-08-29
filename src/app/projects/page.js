'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import './projects.css';

export default function ProjectsPage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [filters, setFilters] = useState({
    status: 'All',
    projectType: 'All',
    projectHead: 'All',
    city: 'All',
    dateRange: 'All'
  });
  const [stats, setStats] = useState({
    total: 0,
    ongoing: 0,
    completed: 0,
    hold: 0,
    totalValue: 0,
    avgDuration: 0
  });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchProjects();
  }, [router]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch projects`);
      }
      
      const data = await response.json();
      const projectsData = data.projects || [];
      setProjects(projectsData);
      
      // Calculate stats
      const totalProjects = projectsData.length;
      const ongoingCount = projectsData.filter(p => p.status === 'Ongoing').length;
      const completedCount = projectsData.filter(p => p.status === 'Closed' || p.status === 'Project').length;
      const holdCount = projectsData.filter(p => p.status === 'Hold').length;
      const totalValue = projectsData
        .filter(p => p.project_cost)
        .reduce((sum, p) => sum + parseFloat(p.project_cost || 0), 0);
      const avgDuration = projectsData.length > 0 
        ? Math.round(projectsData.reduce((sum, p) => sum + parseInt(p.duration || 0), 0) / projectsData.length)
        : 0;
      
      setStats({
        total: totalProjects,
        ongoing: ongoingCount,
        completed: completedCount,
        hold: holdCount,
        totalValue: totalValue,
        avgDuration: avgDuration
      });
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Project deleted successfully!');
        fetchProjects();
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.error || 'Failed to delete project'));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project. Please try again.');
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
      const response = await fetch('/api/projects/import', {
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
      const response = await fetch('/api/projects/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert(`Import completed! ${result.imported} projects imported, ${result.failed} failed.`);
        setShowImportModal(false);
        setImportPreview(null);
        fetchProjects();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error importing projects:', error);
      alert('Error importing projects. Please try again.');
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatCurrency = (value, currency = 'INR') => {
    if (!value) return '-';
    const num = parseFloat(value);
    if (currency === 'INR') {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    return `${currency} ${num.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Ongoing': '#3b82f6',
      'Project': '#10b981', 
      'Hold': '#f59e0b',
      'Proposal': '#8b5cf6',
      'Closed': '#6b7280',
      'Cancelled': '#ef4444',
      'Regret': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const parseProjectTeam = (teamString) => {
    if (!teamString) return [];
    try {
      return typeof teamString === 'string' ? JSON.parse(teamString) : teamString;
    } catch {
      return teamString.split(',').map(member => member.trim());
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'All' && project.status !== filters.status) return false;
    if (filters.projectType !== 'All' && project.project_type !== filters.projectType) return false;
    if (filters.projectHead !== 'All' && project.project_head !== filters.projectHead) return false;
    if (filters.city !== 'All' && project.city !== filters.city) return false;
    return true;
  });

  if (!user) return null;

  return (
    <div className="projects-page">
      <Navigation user={user} />
      
      <main className="projects-main">
        <div className="projects-container">
          {/* Header Section */}
          <div className="projects-header">
            <div className="header-content">
              <h1>Project Management</h1>
              <p>Track and manage your project portfolio</p>
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
              <Link 
                href="/projects/add"
                className="btn-primary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span>+</span>
                New Project
              </Link>
              <button className="btn-secondary">
                Export
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="projects-stats">
            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0f9ff'}}>
                <svg width="24" height="24" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Total Projects</h3>
                <p className="stat-number">{stats.total}</p>
                <span className="stat-change neutral">Active portfolio</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#ecfdf5'}}>
                <svg width="24" height="24" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Ongoing</h3>
                <p className="stat-number">{stats.ongoing}</p>
                <span className="stat-change positive">In progress</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#f0fdf4'}}>
                <svg width="24" height="24" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 701.946 1.946l1.999 3.46a11.952 11.952 0 90-8.91l-3.44-1.999a3.42 3.42 0 70-1.946z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Completed</h3>
                <p className="stat-number">{stats.completed}</p>
                <span className="stat-change positive">{formatCurrency(stats.totalValue)} Value</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{backgroundColor: '#fef3c7'}}>
                <svg width="24" height="24" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 1118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <h3>Avg Duration</h3>
                <p className="stat-number">{stats.avgDuration}</p>
                <span className="stat-change neutral">Days per project</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="projects-filters">
            <select 
              className="filter-select" 
              value={filters.status} 
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All">All Status</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Project">Project</option>
              <option value="Hold">Hold</option>
              <option value="Proposal">Proposal</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Regret">Regret</option>
            </select>

            <select 
              className="filter-select" 
              value={filters.projectType} 
              onChange={(e) => setFilters({...filters, projectType: e.target.value})}
            >
              <option value="All">All Types</option>
              <option value="Construction">Construction</option>
              <option value="Engineering">Engineering</option>
              <option value="Consulting">Consulting</option>
              <option value="Maintenance">Maintenance</option>
            </select>

            <input 
              type="text" 
              placeholder="Search by project name, client..." 
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <p>Loading projects...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchProjects} className="btn-secondary">Retry</button>
            </div>
          ) : (
            <div className="projects-table-container">
              <div className="table-header">
                <h2>Project Portfolio</h2>
                <div className="table-actions">
                  <button className="btn-secondary">Filter</button>
                  <button className="btn-secondary">Export</button>
                </div>
              </div>

              <div className="projects-table">
                <table>
                  <thead>
                    <tr>
                      <th>Project No.</th>
                      <th>Project Details</th>
                      <th>Client</th>
                      <th>Cost & Duration</th>
                      <th>Team</th>
                      <th>Status</th>
                      <th>Timeline</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <span className="project-number">{project.project_number}</span>
                          <span className="project-type">{project.project_type}</span>
                        </td>
                        <td>
                          <div className="project-info">
                            <p>{project.project_name}</p>
                            <span className="project-desc">Received: {formatDate(project.received_date)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="client-info">
                            <p>{project.client_name}</p>
                            <span className="city">{project.city || 'N/A'}</span>
                          </div>
                        </td>
                        <td>
                          <div className="cost-duration">
                            <p className="cost">{formatCurrency(project.project_cost, project.currency)}</p>
                            <span className="duration">{project.duration} days | {project.manhours} hrs</span>
                          </div>
                        </td>
                        <td>
                          <div className="team-info">
                            <p className="team-head">Head: {project.project_head || 'TBD'}</p>
                            <p className="team-manager">PM: {project.project_manager || 'TBD'}</p>
                            <span className="team-count">
                              {parseProjectTeam(project.project_team).length} members
                            </span>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="status-badge" 
                            style={{backgroundColor: getStatusColor(project.status)}}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td>
                          <div className="timeline-info">
                            <p className="dates">{formatDate(project.start_date)}</p>
                            <span className="to">to</span>
                            <p className="dates">{formatDate(project.end_date)}</p>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link 
                              href={`/projects/edit?id=${project.id}`}
                              className="btn-icon"
                              title="Edit Project"
                              style={{ textDecoration: 'none' }}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Link>
                            <button 
                              className="btn-icon"
                              title="View Details"
                              onClick={() => router.push(`/projects/${project.id}`)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              className="btn-icon btn-delete"
                              title="Delete Project"
                              onClick={() => handleDeleteProject(project.id)}
                            >
                              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            {project.proposal_id && (
                              <button 
                                className="btn-icon btn-convert"
                                title="View Related Proposal"
                                onClick={() => router.push(`/proposals/${project.proposal_id}`)}
                              >
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredProjects.length === 0 && (
                  <div className="empty-state">
                    <p>No projects found. Create your first project to get started.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

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
            <div className="modal-body">
              <div className="import-summary">
                <p><strong>File:</strong> {importPreview.fileName}</p>
                <p><strong>Total Rows:</strong> {importPreview.totalRows}</p>
                <p><strong>Valid Rows:</strong> {importPreview.validRows}</p>
                <p><strong>Invalid Rows:</strong> {importPreview.invalidRows}</p>
              </div>
              
              {importPreview.errors && importPreview.errors.length > 0 && (
                <div className="import-errors">
                  <h4>⚠️ Validation Errors:</h4>
                  <ul>
                    {importPreview.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => {
                  setShowImportModal(false);
                  setImportPreview(null);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleImportConfirm}
                className="btn-primary"
                disabled={importLoading}
              >
                {importLoading ? 'Importing...' : 'Confirm Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}