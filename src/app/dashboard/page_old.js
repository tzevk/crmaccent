'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/navigation/Navigation';
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
    activeProjects: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentProposals, setRecentProposals] = useState([]);
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
        fetch('/api/leads'),
        fetch('/api/companies'),
        fetch('/api/proposals'),
        fetch('/api/employees')
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

      // Calculate stats
      const totalRevenue = leads.reduce((sum, lead) => {
        return sum + (parseFloat(lead.estimated_value) || 0);
      }, 0);

      const activeProjects = leads.filter(lead => 
        lead.status === 'Won' || lead.status === 'In Progress'
      ).length;

      setStats({
        leads: leads.length,
        companies: companies.length,
        proposals: proposals.length,
        employees: employees.length,
        revenue: totalRevenue,
        activeProjects: activeProjects
      });

      // Set recent leads (last 5)
      setRecentLeads(leads.slice(0, 5));

      // Set recent proposals (last 3)
      setRecentProposals(proposals.slice(0, 3));

      // Generate activities from recent data
      const activities = [];
      
      // Add recent leads as activities
      leads.slice(0, 3).forEach(lead => {
        activities.push({
          id: `lead-${lead.id}`,
          type: 'lead',
          message: `New lead "${lead.title}" from ${lead.company_name || 'Unknown Company'}`,
          time: getTimeAgo(lead.created_at),
          data: lead
        });
      });

      // Add recent proposals as activities
      proposals.slice(0, 2).forEach(proposal => {
        activities.push({
          id: `proposal-${proposal.id}`,
          type: 'proposal',
          message: `Proposal "${proposal.proposal_title}" created`,
          time: getTimeAgo(proposal.created_at || proposal.proposal_date),
          data: proposal
        });
      });

      setRecentActivities(activities.slice(0, 5));

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

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Recently';
    }
  };

  const getPriorityColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'blue';
      case 'contacted': return 'orange';
      case 'qualified': return 'green';
      case 'won': return 'green';
      case 'lost': return 'red';
      default: return 'gray';
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navigation user={user} />
      
      <div className="dashboard-scroll-container">
        <div className="dashboard-main">
          <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1 className="welcome-title">
                  Welcome back, {user.full_name || user.firstName || user.username}!
                </h1>
                <p className="welcome-subtitle">
                  Here's what's happening with your CRM today.
                </p>
              </div>
              <div className="welcome-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => router.push('/leads/add')}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Lead
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon leads">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{loading ? '...' : stats.leads}</h3>
                    <p className="stat-label">Total Leads</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  Active pipeline
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon companies">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{loading ? '...' : stats.companies}</h3>
                    <p className="stat-label">Companies</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  In database
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon deals">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">₹{loading ? '...' : stats.revenue.toLocaleString()}</h3>
                    <p className="stat-label">Pipeline Value</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  Total estimated
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon projects">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{loading ? '...' : stats.proposals}</h3>
                    <p className="stat-label">Proposals</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  Total created
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon tasks">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{loading ? '...' : stats.activeProjects}</h3>
                    <p className="stat-label">Active Projects</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  In progress
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon employees">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-value">{loading ? '...' : stats.employees}</h3>
                    <p className="stat-label">Team Members</p>
                  </div>
                </div>
                <div className="stat-change positive">
                  Total employees
                </div>
              </div>
            </div>

            {/* Dashboard Content Grid */}
            <div className="dashboard-content-grid">
              {/* Recent Activities */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Recent Activities</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => router.push('/leads')}
                  >
                    View All
                  </button>
                </div>
                <div className="activities-list">
                  {loading ? (
                    <div className="loading-placeholder">
                      <div className="loading-spinner-small"></div>
                      <span>Loading activities...</span>
                    </div>
                  ) : recentActivities.length > 0 ? (
                    recentActivities.map(activity => (
                      <div key={activity.id} className="activity-item">
                        <div className={`activity-icon ${activity.type}`}>
                          {activity.type === 'lead' && (
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                          {activity.type === 'proposal' && (
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="activity-content">
                          <p className="activity-message">{activity.message}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Leads */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h2 className="card-title">Recent Leads</h2>
                  <button 
                    className="view-all-btn"
                    onClick={() => router.push('/leads')}
                  >
                    View All
                  </button>
                </div>
                <div className="leads-list">
                  {loading ? (
                    <div className="loading-placeholder">
                      <div className="loading-spinner-small"></div>
                      <span>Loading leads...</span>
                    </div>
                  ) : recentLeads.length > 0 ? (
                    recentLeads.map(lead => (
                      <div key={lead.id} className="lead-item">
                        <div className="lead-content">
                          <h4 className="lead-title">{lead.title}</h4>
                          <p className="lead-company">{lead.company_name || 'No company'}</p>
                          <div className="lead-meta">
                            <span className={`lead-status ${getPriorityColor(lead.status)}`}>
                              {lead.status}
                            </span>
                            {lead.estimated_value && (
                              <span className="lead-value">₹{parseFloat(lead.estimated_value).toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <p>No recent leads</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="quick-actions-grid">
                <button 
                  className="quick-action-card"
                  onClick={() => router.push('/leads/add')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>Add New Lead</h3>
                    <p>Create a new lead and start the sales process</p>
                  </div>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => router.push('/companies')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>Manage Companies</h3>
                    <p>View and manage your company database</p>
                  </div>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => router.push('/proposals/new')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>Create Proposal</h3>
                    <p>Generate a new proposal for your clients</p>
                  </div>
                </button>

                <button 
                  className="quick-action-card"
                  onClick={() => router.push('/employees')}
                >
                  <div className="action-icon">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="action-content">
                    <h3>Manage Team</h3>
                    <p>View and manage your team members</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

  if (!user) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Navigation user={user} />
      
      <div className="dashboard-scroll-container">
        <div className="dashboard-main">
          <div className="dashboard-container">
            {/* Welcome Section */}
            <div className="welcome-section">
              <div className="welcome-content">
                <h1 className="welcome-title">
                  Welcome back, {user.full_name || user.username}!
                </h1>
                <p className="welcome-subtitle">
                  Here's what's happening with your CRM today.
                </p>
              </div>
              <div className="welcome-actions">
                <button className="btn btn-primary">
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Lead
                </button>
              </div>
            </div>

          {/* Enhanced Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon leads">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.leads}</h3>
                  <p className="stat-label">Total Leads</p>
                </div>
              </div>
              <div className="stat-change positive">
                +12% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon customers">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.customers}</h3>
                  <p className="stat-label">Active Customers</p>
                </div>
              </div>
              <div className="stat-change positive">
                +8% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon deals">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">${stats.revenue.toLocaleString()}</h3>
                  <p className="stat-label">Revenue</p>
                </div>
              </div>
              <div className="stat-change positive">
                +25% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon projects">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.projects}</h3>
                  <p className="stat-label">Active Projects</p>
                </div>
              </div>
              <div className="stat-change positive">
                +3 new projects
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon tasks">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.tasks}</h3>
                  <p className="stat-label">Pending Tasks</p>
                </div>
              </div>
              <div className="stat-change neutral">
                Due this week
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon employees">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.employees}</h3>
                  <p className="stat-label">Total Employees</p>
                </div>
              </div>
              <div className="stat-change positive">
                +2 new hires
              </div>
            </div>            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon customers">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.customers}</h3>
                  <p className="stat-label">Active Customers</p>
                </div>
              </div>
              <div className="stat-change positive">
                +8% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon deals">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">${stats.revenue.toLocaleString()}</h3>
                  <p className="stat-label">Revenue</p>
                </div>
              </div>
              <div className="stat-change positive">
                +25% from last month
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon projects">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.projects}</h3>
                  <p className="stat-label">Active Projects</p>
                </div>
              </div>
              <div className="stat-change positive">
                +3 new projects
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon tasks">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.tasks}</h3>
                  <p className="stat-label">Pending Tasks</p>
                </div>
              </div>
              <div className="stat-change neutral">
                Due this week
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon employees">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="stat-content">
                  <h3 className="stat-value">{stats.employees}</h3>
                  <p className="stat-label">Total Employees</p>
                </div>
              </div>
              <div className="stat-change positive">
                +2 new hires
              </div>
            </div>
          </div>

          {/* Dashboard Content Grid */}
          <div className="dashboard-content-grid">
            {/* Recent Activities */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Recent Activities</h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="activities-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      {activity.type === 'lead' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                      {activity.type === 'project' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {activity.type === 'customer' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )}
                      {activity.type === 'task' && (
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      )}
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.message}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Upcoming Tasks</h2>
                <button className="view-all-btn">View All</button>
              </div>
              <div className="tasks-list">
                {upcomingTasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-checkbox">
                      <input type="checkbox" id={`task-${task.id}`} />
                      <label htmlFor={`task-${task.id}`}></label>
                    </div>
                    <div className="task-content">
                      <h4 className="task-title">{task.title}</h4>
                      <div className="task-meta">
                        <span className={`task-priority ${task.priority}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        <span className="task-due">Due: {task.due}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-card">
                <div className="action-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>Add New Lead</h3>
                  <p>Create a new lead and start the sales process</p>
                </div>
              </button>

              <button className="quick-action-card">
                <div className="action-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>Manage Customers</h3>
                  <p>View and manage your customer database</p>
                </div>
              </button>

              <button className="quick-action-card">
                <div className="action-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>Create Task</h3>
                  <p>Add a new task to your to-do list</p>
                </div>
              </button>

              <button className="quick-action-card">
                <div className="action-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div className="action-content">
                  <h3>View Reports</h3>
                  <p>Analyze your sales performance and trends</p>
                </div>
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
