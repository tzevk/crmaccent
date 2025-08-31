'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationMinimal from '@/components/navigation/Navigation';
import './pipeline.css';

export default function PipelinePage() {
  const [user, setUser] = useState(null);
  const [pipelineData, setPipelineData] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list, funnel
  const [selectedStage, setSelectedStage] = useState(null);
  const [draggedLead, setDraggedLead] = useState(null);
  const [filters, setFilters] = useState({
    assignedTo: 'All',
    dateRange: '30',
    minValue: '',
    maxValue: ''
  });
  const [stats, setStats] = useState({
    totalValue: 0,
    avgDealSize: 0,
    conversionRate: 0,
    avgSalesCycle: 0
  });
  const router = useRouter();

  const stageOrder = ['New', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed-Won', 'Closed-Lost'];
  const stageColors = {
    'New': '#3B82F6',
    'Qualified': '#10B981',
    'Proposal Sent': '#F59E0B',
    'Negotiation': '#EF4444',
    'Closed-Won': '#059669',
    'Closed-Lost': '#6B7280'
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchPipelineData();
    fetchLeads();
  }, [router]);

  // Refetch data when filters change
  useEffect(() => {
    if (user) {
      fetchPipelineData();
    }
  }, [filters.assignedTo, filters.dateRange]);

  const fetchPipelineData = async () => {
    try {
      const params = new URLSearchParams({
        timeframe: filters.dateRange,
        assignedTo: filters.assignedTo
      });
      
      const response = await fetch(`/api/leads/pipeline?${params}`);
      if (!response.ok) throw new Error('Failed to fetch pipeline data');
      const data = await response.json();
      
      setPipelineData(data.pipeline || []);
      calculateStats(data.pipeline || [], data.conversions || [], data.velocity || []);
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
      setError('Failed to load pipeline data');
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) throw new Error('Failed to fetch leads');
      const data = await response.json();
      setLeads(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setError('Failed to load leads');
      setLoading(false);
    }
  };

  const calculateStats = (pipelineData, conversions = [], velocity = []) => {
    const totalValue = pipelineData.reduce((sum, stage) => sum + (stage.total_value || 0), 0);
    const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0);
    const wonStage = pipelineData.find(stage => stage.lead_stage === 'Closed-Won');
    const avgDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;
    const conversionRate = totalLeads > 0 ? ((wonStage?.count || 0) / totalLeads) * 100 : 0;
    
    // Calculate average sales cycle from velocity data
    const avgSalesCycle = velocity.length > 0 
      ? velocity.reduce((sum, v) => sum + (v.avg_days_in_stage || 0), 0) / velocity.length
      : 45;

    setStats({
      totalValue,
      avgDealSize,
      conversionRate,
      avgSalesCycle: Math.round(avgSalesCycle)
    });
  };

  const getLeadsByStage = (stage) => {
    return leads.filter(lead => lead.lead_stage === stage);
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedLead || draggedLead.lead_stage === newStage) {
      setDraggedLead(null);
      return;
    }

    try {
      const response = await fetch('/api/leads/pipeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          leadId: draggedLead.id, 
          newStage,
          notes: `Stage changed via drag and drop from ${draggedLead.lead_stage} to ${newStage}`
        })
      });

      if (response.ok) {
        fetchLeads();
        fetchPipelineData();
        // Show success message
        const result = await response.json();
        console.log(result.message);
      } else {
        throw new Error('Failed to update lead stage');
      }
    } catch (error) {
      console.error('Error updating lead stage:', error);
      alert('Failed to update lead stage');
    } finally {
      setDraggedLead(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  if (loading) {
    return (
      <div className="pipeline-page">
        <NavigationMinimal />
        <div className="pipeline-loading">
          <div className="spinner"></div>
          <p>Loading pipeline data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pipeline-page">
        <NavigationMinimal />
        <div className="pipeline-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pipeline-page">
      <NavigationMinimal />
      
      <main className="pipeline-main">
        <div className="pipeline-container">
          {/* Header */}
          <div className="pipeline-header">
            <div className="header-content">
              <h1>Sales Pipeline</h1>
              <p>Visualize and manage your sales opportunities through every stage</p>
            </div>
            <div className="header-actions">
              <div className="view-switcher">
                <button
                  className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                  onClick={() => setViewMode('kanban')}
                >
                  Kanban
                </button>
                <button
                  className={`view-btn ${viewMode === 'funnel' ? 'active' : ''}`}
                  onClick={() => setViewMode('funnel')}
                >
                  Funnel
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
              </div>
              <Link href="/leads/add" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"></path>
                </svg>
                Add Lead
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="pipeline-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(stats.totalValue)}</div>
                <div className="stat-label">Total Pipeline Value</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{formatCurrency(stats.avgDealSize)}</div>
                <div className="stat-label">Average Deal Size</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.conversionRate.toFixed(1)}%</div>
                <div className="stat-label">Win Rate</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.avgSalesCycle} days</div>
                <div className="stat-label">Avg Sales Cycle</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="pipeline-filters">
            <div className="filter-group">
              <label>Assigned To:</label>
              <select 
                value={filters.assignedTo} 
                onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
              >
                <option value="All">All Team Members</option>
                <option value="me">Assigned to Me</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Date Range:</label>
              <select 
                value={filters.dateRange} 
                onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
                <option value="all">All time</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Deal Value:</label>
              <div className="value-range">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={filters.minValue}
                  onChange={(e) => setFilters({...filters, minValue: e.target.value})}
                />
                <span>to</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={filters.maxValue}
                  onChange={(e) => setFilters({...filters, maxValue: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Pipeline Content */}
          {viewMode === 'kanban' && (
            <div className="kanban-board">
              {stageOrder.map(stage => {
                const stageData = pipelineData.find(s => s.lead_stage === stage) || { count: 0, total_value: 0 };
                const stageLeads = getLeadsByStage(stage);
                
                return (
                  <div 
                    key={stage} 
                    className="kanban-column"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage)}
                  >
                    <div className="column-header" style={{ borderTopColor: stageColors[stage] }}>
                      <div className="stage-info">
                        <h3>{stage}</h3>
                        <div className="stage-stats">
                          <span className="stage-count">{stageData.count} leads</span>
                          <span className="stage-value">{formatCurrency(stageData.total_value)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="column-content">
                      {stageLeads.map(lead => (
                        <div 
                          key={lead.id} 
                          className="lead-card"
                          draggable
                          onDragStart={(e) => handleDragStart(e, lead)}
                        >
                          <div className="lead-header">
                            <h4>{lead.company_name}</h4>
                            <div className="lead-value">{formatCurrency(lead.estimated_value)}</div>
                          </div>
                          
                          <div className="lead-details">
                            <p className="lead-contact">{lead.contact_name}</p>
                            <p className="lead-location">{lead.city}, {lead.state}</p>
                            <div className="lead-meta">
                              <span className="lead-date">
                                {new Date(lead.created_at).toLocaleDateString()}
                              </span>
                              {lead.assigned_to && (
                                <span className="lead-assigned">
                                  {lead.assigned_to}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="lead-actions">
                            <Link href={`/leads/${lead.id}`} className="lead-action">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            </Link>
                            <button className="lead-action">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {stageLeads.length === 0 && (
                        <div className="empty-stage">
                          <p>No leads in this stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'funnel' && (
            <div className="funnel-view">
              <div className="funnel-chart">
                {stageOrder.slice(0, -1).map((stage, index) => {
                  const stageData = pipelineData.find(s => s.lead_stage === stage) || { count: 0, total_value: 0 };
                  const totalLeads = pipelineData.reduce((sum, s) => sum + s.count, 0);
                  const percentage = totalLeads > 0 ? (stageData.count / totalLeads) * 100 : 0;
                  
                  return (
                    <div key={stage} className="funnel-stage" style={{ width: `${Math.max(percentage, 10)}%` }}>
                      <div className="funnel-bar" style={{ backgroundColor: stageColors[stage] }}>
                        <div className="funnel-content">
                          <h4>{stage}</h4>
                          <div className="funnel-stats">
                            <span>{stageData.count} leads</span>
                            <span>{formatCurrency(stageData.total_value)}</span>
                            <span>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="funnel-outcomes">
                <div className="outcome won">
                  <h4>Closed Won</h4>
                  <div className="outcome-stats">
                    <span>{pipelineData.find(s => s.lead_stage === 'Closed-Won')?.count || 0} leads</span>
                    <span>{formatCurrency(pipelineData.find(s => s.lead_stage === 'Closed-Won')?.total_value || 0)}</span>
                  </div>
                </div>
                
                <div className="outcome lost">
                  <h4>Closed Lost</h4>
                  <div className="outcome-stats">
                    <span>{pipelineData.find(s => s.lead_stage === 'Closed-Lost')?.count || 0} leads</span>
                    <span>{formatCurrency(pipelineData.find(s => s.lead_stage === 'Closed-Lost')?.total_value || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'list' && (
            <div className="list-view">
              <div className="list-header">
                <div className="list-controls">
                  <div className="sort-controls">
                    <label>Sort by:</label>
                    <select>
                      <option value="stage">Stage</option>
                      <option value="value">Deal Value</option>
                      <option value="date">Date Created</option>
                      <option value="company">Company</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="pipeline-table">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Contact</th>
                      <th>Stage</th>
                      <th>Value</th>
                      <th>Location</th>
                      <th>Created</th>
                      <th>Assigned</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id}>
                        <td className="company-cell">
                          <strong>{lead.company_name}</strong>
                        </td>
                        <td>{lead.contact_name}</td>
                        <td>
                          <span 
                            className="stage-badge" 
                            style={{ backgroundColor: stageColors[lead.lead_stage] }}
                          >
                            {lead.lead_stage}
                          </span>
                        </td>
                        <td className="value-cell">{formatCurrency(lead.estimated_value)}</td>
                        <td>{lead.city}, {lead.state}</td>
                        <td>{new Date(lead.created_at).toLocaleDateString()}</td>
                        <td>{lead.assigned_to || 'Unassigned'}</td>
                        <td className="actions-cell">
                          <Link href={`/leads/${lead.id}`} className="action-btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
