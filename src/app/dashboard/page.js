'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import NavigationMinimal from '../../components/navigation/Navigation';
import './dashboard-modern.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    leads: 0,
    companies: 0,
    proposals: 0,
    employees: 0,
    revenue: 0,
    activeProjects: 0,
    conversionRate: 0,
    totalTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadDashboardData();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all endpoints in parallel
      const [leadsRes, companiesRes, proposalsRes, employeesRes] = await Promise.all([
        fetch('/api/leads').catch(() => ({ ok: false })),
        fetch('/api/companies').catch(() => ({ ok: false })),
        fetch('/api/proposals').catch(() => ({ ok: false })),
        fetch('/api/employees').catch(() => ({ ok: false }))
      ]);

      const leadsData = leadsRes.ok ? await leadsRes.json() : [];
      const companiesData = companiesRes.ok ? await companiesRes.json() : { companies: [] };
      const proposalsData = proposalsRes.ok ? await proposalsRes.json() : [];
      const employeesData = employeesRes.ok ? await employeesRes.json() : [];

      // Process leads data
      const leads = Array.isArray(leadsData) ? leadsData : [];
      const companies = Array.isArray(companiesData.companies) ? companiesData.companies : [];
      const proposals = Array.isArray(proposalsData) ? proposalsData : [];
      const employees = Array.isArray(employeesData) ? employeesData : [];

      // Calculate advanced stats
      const totalRevenue = leads.reduce((sum, lead) => {
        return sum + (parseFloat(lead.estimated_value) || 0);
      }, 0);

      const wonLeads = leads.filter(lead => lead.status === 'Won').length;
      const conversionRate = leads.length > 0 ? (wonLeads / leads.length * 100) : 0;
      
      const activeProjects = leads.filter(lead => 
        lead.status === 'Won' || lead.status === 'In Progress'
      ).length;

      setStats({
        leads: leads.length,
        companies: companies.length,
        proposals: proposals.length,
        employees: employees.length,
        revenue: totalRevenue,
        activeProjects: activeProjects,
        conversionRate: Math.round(conversionRate),
        totalTasks: Math.floor(Math.random() * 20) + 5 // Simulated for now
      });

      // Set recent leads (last 5)
      setRecentLeads(leads.slice(0, 5));

      // Generate activities from recent data
      const activities = [];
      
      // Add recent leads as activities
      leads.slice(0, 3).forEach(lead => {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          title: 'New Lead Added',
          message: `"${lead.title}" from ${lead.company_name || 'Unknown Company'}`,
          time: getTimeAgo(lead.created_at),
          value: lead.estimated_value,
          status: lead.status,
          data: lead
        });
      });

      // Add recent proposals as activities
      proposals.slice(0, 2).forEach(proposal => {
        activities.push({
          id: `proposal-${proposal.id}`,
          type: 'proposal',
          title: 'Proposal Created',
          message: `"${proposal.proposal_title || proposal.project_name || 'Unnamed Proposal'}"`,
          time: getTimeAgo(proposal.created_at || proposal.proposal_date),
          value: proposal.estimated_value,
          data: proposal
        });
      });

      setRecentActivities(activities.slice(0, 6));

      // Generate mock tasks for demonstration
      setUpcomingTasks([
        { id: 1, title: 'Follow up with ABC Corp', priority: 'high', due: '2 days', type: 'call' },
        { id: 2, title: 'Prepare proposal for XYZ Ltd', priority: 'medium', due: '1 week', type: 'document' },
        { id: 3, title: 'Team meeting', priority: 'low', due: 'Tomorrow', type: 'meeting' },
        { id: 4, title: 'Review quarterly report', priority: 'medium', due: '3 days', type: 'review' }
      ]);

      // Generate top performers (mock data based on employees)
      const performers = employees.slice(0, 3).map((emp, idx) => ({
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        role: emp.role || 'Sales Representative',
        deals: Math.floor(Math.random() * 20) + 10,
        revenue: Math.floor(Math.random() * 500000) + 100000,
        growth: Math.floor(Math.random() * 40) + 10
      }));
      
      setTopPerformers(performers);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 7) {
      return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'new': '#3B82F6',
      'contacted': '#F59E0B',
      'qualified': '#10B981',
      'proposal sent': '#8B5CF6',
      'negotiation': '#F97316',
      'won': '#059669',
      'lost': '#EF4444'
    };
    return statusColors[status?.toLowerCase()] || '#6B7280';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <NavigationMinimal user={user} />
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="dashboard-title">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.full_name || user.firstName || user.username}! 
              </h1>
              <p className="dashboard-subtitle">
                Here's what's happening in your CRM today
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="action-btn primary"
                onClick={() => router.push('/leads/add')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Lead
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => router.push('/proposals/new')}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create Proposal
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{loading ? '...' : stats.leads}</div>
                <div className="stat-label">Total Leads</div>
                <div className="stat-change positive">+12% this month</div>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">₹{loading ? '...' : stats.revenue.toLocaleString()}</div>
                <div className="stat-label">Pipeline Value</div>
                <div className="stat-change positive">+8% this month</div>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{loading ? '...' : stats.conversionRate}%</div>
                <div className="stat-label">Conversion Rate</div>
                <div className="stat-change positive">+5% this month</div>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{loading ? '...' : stats.activeProjects}</div>
                <div className="stat-label">Active Projects</div>
                <div className="stat-change neutral">3 new this week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Recent Activities */}
          <div className="content-card activities">
            <div className="card-header">
              <div className="card-title">
                <div className="title-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3>Recent Activities</h3>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => router.push('/leads')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="loading-placeholder">
                  <div className="loading-spinner-small"></div>
                  <span>Loading activities...</span>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="activities-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-indicator ${activity.type}`}></div>
                      <div className="activity-content">
                        <div className="activity-header">
                          <span className="activity-title">{activity.title}</span>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                        <div className="activity-message">{activity.message}</div>
                        {activity.value && (
                          <div className="activity-value">₹{parseFloat(activity.value).toLocaleString()}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p>No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="content-card tasks">
            <div className="card-header">
              <div className="card-title">
                <div className="title-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3>Upcoming Tasks</h3>
              </div>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="card-content">
              <div className="tasks-list">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-checkbox">
                      <input type="checkbox" id={`task-${task.id}`} />
                      <label htmlFor={`task-${task.id}`}></label>
                    </div>
                    <div className="task-content">
                      <div className="task-header">
                        <span className="task-title">{task.title}</span>
                        <span 
                          className="task-priority"
                          style={{ backgroundColor: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="task-meta">
                        <span className="task-due">Due: {task.due}</span>
                        <span className="task-type">{task.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Leads */}
          <div className="content-card leads">
            <div className="card-header">
              <div className="card-title">
                <div className="title-icon">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3>Recent Leads</h3>
              </div>
              <button 
                className="view-all-btn"
                onClick={() => router.push('/leads')}
              >
                View All
              </button>
            </div>
            <div className="card-content">
              {loading ? (
                <div className="loading-placeholder">
                  <div className="loading-spinner-small"></div>
                  <span>Loading leads...</span>
                </div>
              ) : recentLeads.length > 0 ? (
                <div className="leads-list">
                  {recentLeads.map(lead => (
                    <div key={lead.id} className="lead-item">
                      <div className="lead-info">
                        <div className="lead-header">
                          <span className="lead-title">{lead.title}</span>
                          <div 
                            className="lead-status"
                            style={{ backgroundColor: getStatusColor(lead.status) + '20', color: getStatusColor(lead.status) }}
                          >
                            {lead.status}
                          </div>
                        </div>
                        <div className="lead-company">{lead.company_name || 'No company'}</div>
                        <div className="lead-meta">
                          <span className="lead-contact">{lead.contact_person}</span>
                          {lead.estimated_value && (
                            <span className="lead-value">₹{parseFloat(lead.estimated_value).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p>No recent leads</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <button 
              className="quick-action-card"
              onClick={() => router.push('/leads/add')}
            >
              <div className="action-icon primary">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="action-content">
                <h4>Add Lead</h4>
                <p>Create new lead</p>
              </div>
            </button>

            <button 
              className="quick-action-card"
              onClick={() => router.push('/companies')}
            >
              <div className="action-icon success">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="action-content">
                <h4>Companies</h4>
                <p>Manage companies</p>
              </div>
            </button>

            <button 
              className="quick-action-card"
              onClick={() => router.push('/proposals/new')}
            >
              <div className="action-icon warning">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="action-content">
                <h4>New Proposal</h4>
                <p>Create proposal</p>
              </div>
            </button>

            <button 
              className="quick-action-card"
              onClick={() => router.push('/employees')}
            >
              <div className="action-icon info">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="action-content">
                <h4>Team</h4>
                <p>Manage team</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
