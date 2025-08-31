'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import './conversionFunnel.css';

export default function ConversionFunnelPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState({
    leads: {
      total: 0,
      new: 0,
      qualified: 0,
      proposalSent: 0,
      negotiation: 0,
      closedWon: 0,
      closedLost: 0,
      converted: 0
    },
    proposals: {
      total: 0,
      draft: 0,
      submitted: 0,
      underDiscussion: 0,
      awarded: 0,
      lost: 0,
      converted: 0
    },
    projects: {
      total: 0,
      planning: 0,
      inProgress: 0,
      onHold: 0,
      completed: 0,
      cancelled: 0
    },
    conversions: {
      leadToProposal: {
        rate: 0,
        count: 0
      },
      proposalToProject: {
        rate: 0,
        count: 0
      },
      leadToProject: {
        rate: 0,
        count: 0
      }
    },
    revenue: {
      leadValue: 0,
      proposalValue: 0,
      projectValue: 0,
      wonValue: 0
    }
  });
  const [timeRange, setTimeRange] = useState('all');
  const [selectedStage, setSelectedStage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchFunnelData();
  }, [router, timeRange]);

  const fetchFunnelData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [leadsRes, proposalsRes, projectsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/proposals'),
        fetch('/api/projects')
      ]);

      const leads = leadsRes.ok ? await leadsRes.json() : [];
      const proposals = proposalsRes.ok ? await proposalsRes.json() : [];
      const projects = projectsRes.ok ? await projectsRes.json() : [];

      // Process leads data
      const leadsData = Array.isArray(leads) ? leads : [];
      const proposalsData = Array.isArray(proposals) ? proposals : [];
      const projectsData = Array.isArray(projects) ? projects : [];

      // Calculate lead stages
      const leadStats = {
        total: leadsData.length,
        new: leadsData.filter(l => l.enquiry_status === 'New' || l.status === 'New').length,
        qualified: leadsData.filter(l => l.enquiry_status === 'Qualified' || l.status === 'Qualified').length,
        proposalSent: leadsData.filter(l => l.enquiry_status === 'Proposal Sent' || l.status === 'Proposal Sent').length,
        negotiation: leadsData.filter(l => l.enquiry_status === 'Negotiation' || l.status === 'Negotiation').length,
        closedWon: leadsData.filter(l => l.enquiry_status === 'Closed-Won' || l.status === 'Won').length,
        closedLost: leadsData.filter(l => l.enquiry_status === 'Closed-Lost' || l.status === 'Lost').length,
        converted: leadsData.filter(l => l.enquiry_status === 'converted').length
      };

      // Calculate proposal stages
      const proposalStats = {
        total: proposalsData.length,
        draft: proposalsData.filter(p => p.current_status === 'Draft').length,
        submitted: proposalsData.filter(p => p.current_status === 'Submitted').length,
        underDiscussion: proposalsData.filter(p => p.current_status === 'Under Discussion').length,
        awarded: proposalsData.filter(p => p.current_status === 'Awarded').length,
        lost: proposalsData.filter(p => p.current_status === 'Lost').length,
        converted: proposalsData.filter(p => p.is_converted_to_project).length
      };

      // Calculate project stages
      const projectStats = {
        total: projectsData.length,
        planning: projectsData.filter(p => p.project_status === 'Planning' || p.status === 'planning').length,
        inProgress: projectsData.filter(p => p.project_status === 'In Progress' || p.status === 'in_progress').length,
        onHold: projectsData.filter(p => p.project_status === 'On Hold' || p.status === 'on_hold').length,
        completed: projectsData.filter(p => p.project_status === 'Completed' || p.status === 'completed').length,
        cancelled: projectsData.filter(p => p.project_status === 'Cancelled' || p.status === 'cancelled').length
      };

      // Calculate conversion rates
      const leadToProposalCount = leadStats.converted;
      const leadToProposalRate = leadStats.total > 0 ? (leadToProposalCount / leadStats.total * 100) : 0;
      
      const proposalToProjectCount = proposalStats.converted;
      const proposalToProjectRate = proposalStats.total > 0 ? (proposalToProjectCount / proposalStats.total * 100) : 0;
      
      const leadToProjectRate = leadStats.total > 0 ? (projectStats.total / leadStats.total * 100) : 0;

      // Calculate revenue data
      const leadValue = leadsData.reduce((sum, lead) => sum + (parseFloat(lead.estimated_value || lead.value) || 0), 0);
      const proposalValue = proposalsData.reduce((sum, proposal) => sum + (parseFloat(proposal.estimated_value) || 0), 0);
      const projectValue = projectsData.reduce((sum, project) => sum + (parseFloat(project.estimated_value || project.value) || 0), 0);
      const wonValue = leadsData.filter(l => l.enquiry_status === 'Closed-Won' || l.status === 'Won')
                                .reduce((sum, lead) => sum + (parseFloat(lead.estimated_value || lead.value) || 0), 0);

      setFunnelData({
        leads: leadStats,
        proposals: proposalStats,
        projects: projectStats,
        conversions: {
          leadToProposal: {
            rate: Math.round(leadToProposalRate * 100) / 100,
            count: leadToProposalCount
          },
          proposalToProject: {
            rate: Math.round(proposalToProjectRate * 100) / 100,
            count: proposalToProjectCount
          },
          leadToProject: {
            rate: Math.round(leadToProjectRate * 100) / 100,
            count: projectStats.total
          }
        },
        revenue: {
          leadValue,
          proposalValue,
          projectValue,
          wonValue
        }
      });
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
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

  const getConversionColor = (rate) => {
    if (rate >= 30) return '#10b981';
    if (rate >= 20) return '#f59e0b';
    if (rate >= 10) return '#ef4444';
    return '#6b7280';
  };

  const handleStageClick = (stage, type) => {
    setSelectedStage({ stage, type });
    
    // Navigate to appropriate page with filter
    switch (type) {
      case 'leads':
        router.push(`/leads?filter=${stage}`);
        break;
      case 'proposals':
        router.push(`/proposals?filter=${stage}`);
        break;
      case 'projects':
        router.push(`/projects?filter=${stage}`);
        break;
    }
  };

  if (loading) {
    return (
      <div className="funnel-page">
        <Navigation />
        <div className="funnel-loading">
          <div className="spinner"></div>
          <p>Loading conversion funnel data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="funnel-page">
      <Navigation />
      
      <main className="funnel-main">
        <div className="funnel-container">
        <div className="funnel-header">
          <div className="header-content">
            <h1>Conversion Funnel</h1>
            <p>Visualize your customer journey from leads to successful projects</p>
          </div>
          
          <div className="header-actions">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-filter"
            >
              <option value="all">All Time</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Overall Conversion</h3>
              <div className="metric-value">{funnelData.conversions.leadToProject.rate}%</div>
              <div className="metric-subtitle">Lead to Project</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Total Pipeline Value</h3>
              <div className="metric-value">{formatCurrency(funnelData.revenue.leadValue)}</div>
              <div className="metric-subtitle">All Active Leads</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Won Revenue</h3>
              <div className="metric-value">{formatCurrency(funnelData.revenue.wonValue)}</div>
              <div className="metric-subtitle">Closed Deals</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="metric-content">
              <h3>Active Projects</h3>
              <div className="metric-value">{funnelData.projects.total}</div>
              <div className="metric-subtitle">Total Projects</div>
            </div>
          </div>
        </div>

        {/* Conversion Funnel Visualization */}
        <div className="funnel-visualization">
          <div className="funnel-title">
            <h2>Conversion Funnel</h2>
            <p>Track how leads progress through your sales pipeline</p>
          </div>

          <div className="funnel-stages">
            {/* Stage 1: Leads */}
            <div className="funnel-stage leads-stage">
              <div className="stage-header">
                <div className="stage-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3>Leads</h3>
                <div className="stage-total">{funnelData.leads.total}</div>
              </div>
              
              <div className="stage-breakdown">
                <div 
                  className="breakdown-item new"
                  onClick={() => handleStageClick('new', 'leads')}
                >
                  <span className="item-label">New</span>
                  <span className="item-count">{funnelData.leads.new}</span>
                </div>
                <div 
                  className="breakdown-item qualified"
                  onClick={() => handleStageClick('qualified', 'leads')}
                >
                  <span className="item-label">Qualified</span>
                  <span className="item-count">{funnelData.leads.qualified}</span>
                </div>
                <div 
                  className="breakdown-item proposal-sent"
                  onClick={() => handleStageClick('proposalSent', 'leads')}
                >
                  <span className="item-label">Proposal Sent</span>
                  <span className="item-count">{funnelData.leads.proposalSent}</span>
                </div>
                <div 
                  className="breakdown-item negotiation"
                  onClick={() => handleStageClick('negotiation', 'leads')}
                >
                  <span className="item-label">Negotiation</span>
                  <span className="item-count">{funnelData.leads.negotiation}</span>
                </div>
                <div 
                  className="breakdown-item won"
                  onClick={() => handleStageClick('closedWon', 'leads')}
                >
                  <span className="item-label">Closed Won</span>
                  <span className="item-count">{funnelData.leads.closedWon}</span>
                </div>
              </div>
            </div>

            {/* Conversion Arrow 1 */}
            <div className="conversion-arrow">
              <div className="arrow-content">
                <div className="conversion-rate" style={{color: getConversionColor(funnelData.conversions.leadToProposal.rate)}}>
                  {funnelData.conversions.leadToProposal.rate}%
                </div>
                <div className="conversion-label">Lead → Proposal</div>
                <div className="conversion-count">{funnelData.conversions.leadToProposal.count} converted</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Stage 2: Proposals */}
            <div className="funnel-stage proposals-stage">
              <div className="stage-header">
                <div className="stage-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3>Proposals</h3>
                <div className="stage-total">{funnelData.proposals.total}</div>
              </div>
              
              <div className="stage-breakdown">
                <div 
                  className="breakdown-item draft"
                  onClick={() => handleStageClick('draft', 'proposals')}
                >
                  <span className="item-label">Draft</span>
                  <span className="item-count">{funnelData.proposals.draft}</span>
                </div>
                <div 
                  className="breakdown-item submitted"
                  onClick={() => handleStageClick('submitted', 'proposals')}
                >
                  <span className="item-label">Submitted</span>
                  <span className="item-count">{funnelData.proposals.submitted}</span>
                </div>
                <div 
                  className="breakdown-item discussion"
                  onClick={() => handleStageClick('underDiscussion', 'proposals')}
                >
                  <span className="item-label">Under Discussion</span>
                  <span className="item-count">{funnelData.proposals.underDiscussion}</span>
                </div>
                <div 
                  className="breakdown-item awarded"
                  onClick={() => handleStageClick('awarded', 'proposals')}
                >
                  <span className="item-label">Awarded</span>
                  <span className="item-count">{funnelData.proposals.awarded}</span>
                </div>
              </div>
            </div>

            {/* Conversion Arrow 2 */}
            <div className="conversion-arrow">
              <div className="arrow-content">
                <div className="conversion-rate" style={{color: getConversionColor(funnelData.conversions.proposalToProject.rate)}}>
                  {funnelData.conversions.proposalToProject.rate}%
                </div>
                <div className="conversion-label">Proposal → Project</div>
                <div className="conversion-count">{funnelData.conversions.proposalToProject.count} converted</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Stage 3: Projects */}
            <div className="funnel-stage projects-stage">
              <div className="stage-header">
                <div className="stage-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3>Projects</h3>
                <div className="stage-total">{funnelData.projects.total}</div>
              </div>
              
              <div className="stage-breakdown">
                <div 
                  className="breakdown-item planning"
                  onClick={() => handleStageClick('planning', 'projects')}
                >
                  <span className="item-label">Planning</span>
                  <span className="item-count">{funnelData.projects.planning}</span>
                </div>
                <div 
                  className="breakdown-item in-progress"
                  onClick={() => handleStageClick('inProgress', 'projects')}
                >
                  <span className="item-label">In Progress</span>
                  <span className="item-count">{funnelData.projects.inProgress}</span>
                </div>
                <div 
                  className="breakdown-item completed"
                  onClick={() => handleStageClick('completed', 'projects')}
                >
                  <span className="item-label">Completed</span>
                  <span className="item-count">{funnelData.projects.completed}</span>
                </div>
                <div 
                  className="breakdown-item on-hold"
                  onClick={() => handleStageClick('onHold', 'projects')}
                >
                  <span className="item-label">On Hold</span>
                  <span className="item-count">{funnelData.projects.onHold}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Tracking */}
        <div className="revenue-tracking">
          <div className="revenue-header">
            <h2>Revenue Pipeline</h2>
            <p>Track value across all funnel stages</p>
          </div>
          
          <div className="revenue-bars">
            <div className="revenue-bar">
              <div className="bar-header">
                <span className="bar-label">Lead Value</span>
                <span className="bar-value">{formatCurrency(funnelData.revenue.leadValue)}</span>
              </div>
              <div className="bar-container">
                <div className="bar-fill leads-bar" style={{width: '100%'}}></div>
              </div>
            </div>
            
            <div className="revenue-bar">
              <div className="bar-header">
                <span className="bar-label">Proposal Value</span>
                <span className="bar-value">{formatCurrency(funnelData.revenue.proposalValue)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill proposals-bar" 
                  style={{width: `${(funnelData.revenue.proposalValue / funnelData.revenue.leadValue * 100) || 0}%`}}
                ></div>
              </div>
            </div>
            
            <div className="revenue-bar">
              <div className="bar-header">
                <span className="bar-label">Project Value</span>
                <span className="bar-value">{formatCurrency(funnelData.revenue.projectValue)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill projects-bar" 
                  style={{width: `${(funnelData.revenue.projectValue / funnelData.revenue.leadValue * 100) || 0}%`}}
                ></div>
              </div>
            </div>
            
            <div className="revenue-bar">
              <div className="bar-header">
                <span className="bar-label">Won Revenue</span>
                <span className="bar-value">{formatCurrency(funnelData.revenue.wonValue)}</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill won-bar" 
                  style={{width: `${(funnelData.revenue.wonValue / funnelData.revenue.leadValue * 100) || 0}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Insights */}
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-header">
              <h3>Conversion Health</h3>
            </div>
            <div className="health-metrics">
              <div className="health-item">
                <div className="health-label">Lead Quality</div>
                <div className="health-indicator">
                  <div className={`health-status ${funnelData.conversions.leadToProposal.rate >= 25 ? 'good' : funnelData.conversions.leadToProposal.rate >= 15 ? 'average' : 'poor'}`}>
                    {funnelData.conversions.leadToProposal.rate >= 25 ? 'Good' : funnelData.conversions.leadToProposal.rate >= 15 ? 'Average' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Proposal Win Rate</div>
                <div className="health-indicator">
                  <div className={`health-status ${funnelData.conversions.proposalToProject.rate >= 30 ? 'good' : funnelData.conversions.proposalToProject.rate >= 20 ? 'average' : 'poor'}`}>
                    {funnelData.conversions.proposalToProject.rate >= 30 ? 'Excellent' : funnelData.conversions.proposalToProject.rate >= 20 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              <div className="health-item">
                <div className="health-label">Overall Pipeline</div>
                <div className="health-indicator">
                  <div className={`health-status ${funnelData.conversions.leadToProject.rate >= 15 ? 'good' : funnelData.conversions.leadToProject.rate >= 10 ? 'average' : 'poor'}`}>
                    {funnelData.conversions.leadToProject.rate >= 15 ? 'Strong' : funnelData.conversions.leadToProject.rate >= 10 ? 'Moderate' : 'Weak'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-header">
              <h3>Quick Actions</h3>
            </div>
            <div className="action-buttons">
              <button 
                className="action-btn leads-btn"
                onClick={() => router.push('/leads')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Manage Leads
              </button>
              <button 
                className="action-btn proposals-btn"
                onClick={() => router.push('/proposals')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Proposals
              </button>
              <button 
                className="action-btn projects-btn"
                onClick={() => router.push('/projects')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Track Projects
              </button>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
