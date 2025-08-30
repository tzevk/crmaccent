'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavigationMinimal from '../../../components/navigation/Navigation';
import './leadMaster.css';

export default function LeadMasterPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sources');
  const [leadSources, setLeadSources] = useState([]);
  const [leadStatuses, setLeadStatuses] = useState([]);
  const [leadCategories, setLeadCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', color: '#3B82F6', active: true });
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadMasterData();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadMasterData = async () => {
    try {
      setLoading(true);
      
      // Initialize with default data (you can replace this with API calls later)
      setLeadSources([
        { id: 1, name: 'Website', description: 'Leads from website forms', color: '#3B82F6', active: true, count: 45 },
        { id: 2, name: 'Social Media', description: 'Facebook, LinkedIn, Instagram', color: '#10B981', active: true, count: 32 },
        { id: 3, name: 'Email Campaign', description: 'Marketing email campaigns', color: '#F59E0B', active: true, count: 28 },
        { id: 4, name: 'Cold Calling', description: 'Outbound calling campaigns', color: '#8B5CF6', active: true, count: 19 },
        { id: 5, name: 'Referral', description: 'Customer referrals', color: '#EF4444', active: true, count: 23 },
      ]);

      setLeadStatuses([
        { id: 1, name: 'New', description: 'Newly created leads', color: '#3B82F6', active: true, count: 67 },
        { id: 2, name: 'Contacted', description: 'Initial contact made', color: '#F59E0B', active: true, count: 34 },
        { id: 3, name: 'Qualified', description: 'Qualified prospects', color: '#10B981', active: true, count: 28 },
        { id: 4, name: 'Proposal Sent', description: 'Proposal submitted', color: '#8B5CF6', active: true, count: 15 },
        { id: 5, name: 'Won', description: 'Converted to customer', color: '#059669', active: true, count: 12 },
        { id: 6, name: 'Lost', description: 'Lost opportunity', color: '#EF4444', active: true, count: 8 },
      ]);

      setLeadCategories([
        { id: 1, name: 'Hot Lead', description: 'High probability leads', color: '#EF4444', active: true, count: 23 },
        { id: 2, name: 'Warm Lead', description: 'Medium probability leads', color: '#F59E0B', active: true, count: 45 },
        { id: 3, name: 'Cold Lead', description: 'Low probability leads', color: '#3B82F6', active: true, count: 78 },
      ]);

      setPriorities([
        { id: 1, name: 'High', description: 'Urgent follow-up required', color: '#EF4444', active: true, count: 15 },
        { id: 2, name: 'Medium', description: 'Standard follow-up', color: '#F59E0B', active: true, count: 89 },
        { id: 3, name: 'Low', description: 'Can wait for follow-up', color: '#10B981', active: true, count: 42 },
      ]);

      setIndustries([
        { id: 1, name: 'Technology', description: 'Software, Hardware, IT Services', color: '#3B82F6', active: true, count: 34 },
        { id: 2, name: 'Healthcare', description: 'Medical, Pharmaceutical', color: '#10B981', active: true, count: 28 },
        { id: 3, name: 'Finance', description: 'Banking, Insurance, Investment', color: '#F59E0B', active: true, count: 22 },
        { id: 4, name: 'Manufacturing', description: 'Production, Industrial', color: '#8B5CF6', active: true, count: 19 },
        { id: 5, name: 'Retail', description: 'E-commerce, Stores', color: '#EF4444', active: true, count: 31 },
      ]);

    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveData = () => {
    switch (activeTab) {
      case 'sources': return leadSources;
      case 'statuses': return leadStatuses;
      case 'categories': return leadCategories;
      case 'priorities': return priorities;
      case 'industries': return industries;
      default: return [];
    }
  };

  const setActiveData = (data) => {
    switch (activeTab) {
      case 'sources': setLeadSources(data); break;
      case 'statuses': setLeadStatuses(data); break;
      case 'categories': setLeadCategories(data); break;
      case 'priorities': setPriorities(data); break;
      case 'industries': setIndustries(data); break;
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setNewItem({ name: '', description: '', color: '#3B82F6', active: true });
    setShowAddModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setShowAddModal(true);
  };

  const handleSave = () => {
    const currentData = getActiveData();
    if (editingItem) {
      // Edit existing item
      const updatedData = currentData.map(item => 
        item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item
      );
      setActiveData(updatedData);
    } else {
      // Add new item
      const newId = Math.max(...currentData.map(item => item.id)) + 1;
      const updatedData = [...currentData, { ...newItem, id: newId, count: 0 }];
      setActiveData(updatedData);
    }
    setShowAddModal(false);
    setNewItem({ name: '', description: '', color: '#3B82F6', active: true });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const currentData = getActiveData();
      const updatedData = currentData.filter(item => item.id !== id);
      setActiveData(updatedData);
    }
  };

  const toggleActive = (id) => {
    const currentData = getActiveData();
    const updatedData = currentData.map(item => 
      item.id === id ? { ...item, active: !item.active } : item
    );
    setActiveData(updatedData);
  };

  const tabs = [
    { 
      key: 'sources', 
      label: 'Lead Sources', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ), 
      count: leadSources.length 
    },
    { 
      key: 'statuses', 
      label: 'Lead Statuses', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ), 
      count: leadStatuses.length 
    },
    { 
      key: 'categories', 
      label: 'Categories', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ), 
      count: leadCategories.length 
    },
    { 
      key: 'priorities', 
      label: 'Priorities', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ), 
      count: priorities.length 
    },
    { 
      key: 'industries', 
      label: 'Industries', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ), 
      count: industries.length 
    },
  ];

  const getCurrentTabLabel = () => {
    return tabs.find(tab => tab.key === activeTab)?.label || '';
  };

  if (!user) return null;

  return (
    <div className="lead-master-page">
      <NavigationMinimal user={user} />
      
      <main className="lead-master-main">
        <div className="lead-master-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>Lead Master</h1>
                <p>Manage lead sources, statuses, categories, and other master data</p>
              </div>
              <div className="header-actions">
                <button className="btn-primary" onClick={handleAdd}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New {getCurrentTabLabel().slice(0, -1)}
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
                  <span className="tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="content-section">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading master data...</p>
              </div>
            ) : (
              <div className="master-grid">
                {getActiveData().map(item => (
                  <div key={item.id} className={`master-card ${!item.active ? 'inactive' : ''}`}>
                    <div className="card-header">
                      <div className="item-indicator" style={{ backgroundColor: item.color }}></div>
                      <div className="item-info">
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="item-actions">
                        <button
                          className={`toggle-btn ${item.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleActive(item.id)}
                          title={item.active ? 'Deactivate' : 'Activate'}
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="card-stats">
                      <div className="stat">
                        <span className="stat-value">{item.count}</span>
                        <span className="stat-label">Active Leads</span>
                      </div>
                      <div className="stat-status">
                        <span className={`status-badge ${item.active ? 'active' : 'inactive'}`}>
                          {item.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit' : 'Add'} {getCurrentTabLabel().slice(0, -1)}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Enter description"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Color</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  />
                  <span className="color-preview" style={{ backgroundColor: newItem.color }}></span>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newItem.active}
                    onChange={(e) => setNewItem({ ...newItem, active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
