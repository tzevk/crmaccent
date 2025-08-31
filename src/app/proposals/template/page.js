'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationMinimal from '@/components/navigation/Navigation';
import './template.css';

export default function ProposalTemplatePage() {
  const [user, setUser] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'General',
    description: '',
    content: '',
    sections: [],
    default_currency: 'INR',
    is_active: true
  });
  const [newSection, setNewSection] = useState({
    title: '',
    content: '',
    order: 0,
    is_required: false
  });
  const [stats, setStats] = useState({
    totalTemplates: 0,
    activeTemplates: 0,
    categoryCounts: {}
  });
  const router = useRouter();

  const defaultSections = [
    { title: 'Executive Summary', content: 'Brief overview of the proposal and key benefits.', order: 1, is_required: true },
    { title: 'Project Scope', content: 'Detailed description of work to be performed.', order: 2, is_required: true },
    { title: 'Timeline', content: 'Project timeline and key milestones.', order: 3, is_required: true },
    { title: 'Investment', content: 'Pricing breakdown and payment terms.', order: 4, is_required: true },
    { title: 'Company Profile', content: 'About our company and relevant experience.', order: 5, is_required: false },
    { title: 'Terms & Conditions', content: 'Legal terms and conditions.', order: 6, is_required: false },
    { title: 'Next Steps', content: 'How to proceed and contact information.', order: 7, is_required: false }
  ];

  const categories = [
    'General',
    'Software Development',
    'Web Design',
    'Marketing',
    'Consulting',
    'Construction',
    'Healthcare',
    'Education',
    'Real Estate',
    'Other'
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTemplates();
  }, [router]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/proposals/template');
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const templates = await response.json();
      setTemplates(templates);
      calculateStats(templates);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates');
      setLoading(false);
    }
  };

  const calculateStats = (templatesData) => {
    const active = templatesData.filter(t => t.is_active).length;
    const categoryCounts = templatesData.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});

    setStats({
      totalTemplates: templatesData.length,
      activeTemplates: active,
      categoryCounts
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      category: 'General',
      description: '',
      content: '',
      sections: [...defaultSections],
      default_currency: 'INR',
      is_active: true
    });
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({...template});
    setShowCreateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      const templateData = {
        ...templateForm,
        created_by: user?.name || 'Unknown'
      };

      let response;
      if (editingTemplate) {
        // Update existing template
        response = await fetch(`/api/proposals/template/${editingTemplate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
      } else {
        // Create new template
        response = await fetch('/api/proposals/template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
      }

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template');
      }

      // Refresh templates
      await fetchTemplates();
      setShowCreateModal(false);
      setTemplateForm({});
      setEditingTemplate(null);
      setSaving(false);
      
      alert(editingTemplate ? 'Template updated successfully!' : 'Template created successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(`Failed to save template: ${error.message}`);
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/proposals/template/${templateId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete template');
      }

      // Refresh templates
      await fetchTemplates();
      alert('Template deleted successfully!');
    } catch (error) {
      console.error('Error deleting template:', error);
      alert(`Failed to delete template: ${error.message}`);
    }
  };

  const handleUseTemplate = (template) => {
    // Navigate to create proposal with template data
    const templateData = encodeURIComponent(JSON.stringify(template));
    router.push(`/proposals/new?template=${templateData}`);
  };

  const addSection = () => {
    if (!newSection.title.trim()) return;
    
    const section = {
      ...newSection,
      id: Date.now(),
      order: templateForm.sections.length + 1
    };
    
    setTemplateForm({
      ...templateForm,
      sections: [...templateForm.sections, section]
    });
    
    setNewSection({ title: '', content: '', order: 0, is_required: false });
  };

  const removeSection = (sectionId) => {
    setTemplateForm({
      ...templateForm,
      sections: templateForm.sections.filter(s => s.id !== sectionId)
    });
  };

  const moveSectionUp = (index) => {
    if (index === 0) return;
    const sections = [...templateForm.sections];
    [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    sections.forEach((section, i) => section.order = i + 1);
    setTemplateForm({...templateForm, sections});
  };

  const moveSectionDown = (index) => {
    if (index === templateForm.sections.length - 1) return;
    const sections = [...templateForm.sections];
    [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    sections.forEach((section, i) => section.order = i + 1);
    setTemplateForm({...templateForm, sections});
  };

  if (loading) {
    return (
      <div className="template-page">
        <NavigationMinimal />
        <div className="template-loading">
          <div className="spinner"></div>
          <p>Loading proposal templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-page">
      <NavigationMinimal />
      
      <main className="template-main">
        <div className="template-container">
          {/* Header */}
          <div className="template-header">
            <div className="header-content">
              <h1>Proposal Templates</h1>
              <p>Create and manage reusable proposal templates for faster proposal generation</p>
            </div>
            <div className="header-actions">
              <button onClick={handleCreateTemplate} className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                Create Template
              </button>
              <Link href="/proposals" className="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"></path>
                </svg>
                Back to Proposals
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="template-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTemplates}</div>
                <div className="stat-label">Total Templates</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeTemplates}</div>
                <div className="stat-label">Active Templates</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{Object.keys(stats.categoryCounts).length}</div>
                <div className="stat-label">Categories</div>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="templates-section">
            <div className="section-header">
              <h2>Available Templates</h2>
              <div className="section-filters">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Templates</option>
                  <option value="Active">Active Only</option>
                  <option value="Inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="templates-grid">
              {templates
                .filter(template => {
                  // Status filter
                  if (statusFilter === 'Active' && !template.is_active) return false;
                  if (statusFilter === 'Inactive' && template.is_active) return false;
                  
                  // Search filter
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    return template.name.toLowerCase().includes(query) ||
                           template.category.toLowerCase().includes(query) ||
                           template.description.toLowerCase().includes(query);
                  }
                  
                  return true;
                })
                .map(template => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <div className="template-info">
                        <h3>{template.name}</h3>
                        <p className="template-category">{template.category}</p>
                      </div>
                      <div className="template-status">
                        <span className={`status-badge ${template.is_active ? 'active' : 'inactive'}`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="template-content">
                      <p className="template-description">{template.description}</p>
                      <div className="template-meta">
                        <div className="template-sections">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14,2 14,8 20,8"></polyline>
                          </svg>
                          {template.sections?.length || 0} sections
                        </div>
                        <div className="template-currency">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                          </svg>
                          {template.default_currency}
                        </div>
                      </div>
                      <div className="template-created">
                        Created by {template.created_by} on {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="template-actions">
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className="btn-primary"
                        disabled={!template.is_active}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Use Template
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="btn-secondary"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="btn-danger"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6M8,6V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              
              {templates.length === 0 && (
                <div className="empty-templates">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14,2 14,8 20,8"></polyline>
                    </svg>
                  </div>
                  <h3>No Templates Yet</h3>
                  <p>Create your first proposal template to speed up proposal creation</p>
                  <button onClick={handleCreateTemplate} className="btn-primary">
                    Create First Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content template-modal">
            <div className="modal-header">
              <h2>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="template-form">
                <div className="form-section">
                  <h3>Template Details</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Template Name</label>
                      <input
                        type="text"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                        placeholder="Enter template name"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={templateForm.category}
                        onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Default Currency</label>
                      <select
                        value={templateForm.default_currency}
                        onChange={(e) => setTemplateForm({...templateForm, default_currency: e.target.value})}
                      >
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={templateForm.is_active}
                        onChange={(e) => setTemplateForm({...templateForm, is_active: e.target.value === 'true'})}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={templateForm.description}
                      onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
                      placeholder="Brief description of this template"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Template Sections</h3>
                  <div className="sections-list">
                    {templateForm.sections.map((section, index) => (
                      <div key={section.id || index} className="section-item">
                        <div className="section-header">
                          <div className="section-info">
                            <h4>{section.title}</h4>
                            {section.is_required && <span className="required-badge">Required</span>}
                          </div>
                          <div className="section-controls">
                            <button
                              onClick={() => moveSectionUp(index)}
                              disabled={index === 0}
                              className="control-btn"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="18,15 12,9 6,15"></polyline>
                              </svg>
                            </button>
                            <button
                              onClick={() => moveSectionDown(index)}
                              disabled={index === templateForm.sections.length - 1}
                              className="control-btn"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="6,9 12,15 18,9"></polyline>
                              </svg>
                            </button>
                            <button
                              onClick={() => removeSection(section.id || index)}
                              className="control-btn delete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="M19,6V20a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                        <p className="section-content">{section.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="add-section">
                    <h4>Add New Section</h4>
                    <div className="add-section-form">
                      <div className="form-row">
                        <input
                          type="text"
                          value={newSection.title}
                          onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                          placeholder="Section title"
                        />
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={newSection.is_required}
                            onChange={(e) => setNewSection({...newSection, is_required: e.target.checked})}
                          />
                          Required
                        </label>
                      </div>
                      <textarea
                        value={newSection.content}
                        onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                        placeholder="Section content"
                        rows="2"
                      />
                      <button onClick={addSection} className="btn-secondary">
                        Add Section
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={handleSaveTemplate} className="btn-primary">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
