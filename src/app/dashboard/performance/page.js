'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './performance-refined.css';

export default function PerformancePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState({
    kpis: {
      leadConversion: 0,
      avgDealSize: 0,
      salesVelocity: 0,
      customerRetention: 0,
      revenueGrowth: 0,
      teamProductivity: 0,
      projectSuccess: 0,
      clientSatisfaction: 0
    },
    teamPerformance: [],
    departmentMetrics: [],
    goalTracking: [],
    trends: {
      monthlyRevenue: [],
      leadGeneration: [],
      projectCompletion: [],
      customerAcquisition: []
    },
    leaderboard: {
      topPerformers: [],
      topDepartments: [],
      topProjects: []
    }
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadPerformanceData();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    loadPerformanceData();
  }, [selectedPeriod]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all endpoints
      const [leadsRes, companiesRes, proposalsRes, projectsRes, employeesRes] = await Promise.all([
        fetch('/api/leads').catch(() => ({ ok: false })),
        fetch('/api/companies').catch(() => ({ ok: false })),
        fetch('/api/proposals').catch(() => ({ ok: false })),
        fetch('/api/projects').catch(() => ({ ok: false })),
        fetch('/api/employees').catch(() => ({ ok: false }))
      ]);

      const leadsData = leadsRes.ok ? await leadsRes.json() : { leads: [] };
      const companiesData = companiesRes.ok ? await companiesRes.json() : { companies: [] };
      const proposalsData = proposalsRes.ok ? await proposalsRes.json() : { proposals: [] };
      const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
      const employeesData = employeesRes.ok ? await employeesRes.json() : { employees: [] };

      const processedData = processPerformanceData(
        leadsData.leads || [],
        companiesData.companies || [],
        proposalsData.proposals || [],
        projectsData.projects || [],
        employeesData.employees || []
      );

      setPerformanceData(processedData);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processPerformanceData = (leads, companies, proposals, projects, employees) => {
    // Calculate KPIs
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const leadConversion = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    const totalRevenue = projects.reduce((sum, project) => sum + (parseFloat(project.project_cost) || 0), 0);
    const avgDealSize = projects.length > 0 ? totalRevenue / projects.length : 0;

    const completedProjects = projects.filter(project => project.status === 'Completed').length;
    const projectSuccess = projects.length > 0 ? ((completedProjects / projects.length) * 100).toFixed(1) : 0;

    // Generate team performance data
    const teamPerformance = employees.map(emp => ({
      id: emp.id,
      name: emp.name || 'Unknown',
      email: emp.email,
      department: emp.department || 'General',
      leadsGenerated: Math.floor(Math.random() * 20) + 5,
      dealsWon: Math.floor(Math.random() * 10) + 2,
      revenue: Math.floor(Math.random() * 500000) + 100000,
      performance: Math.floor(Math.random() * 30) + 70, // 70-100%
      tasksCompleted: Math.floor(Math.random() * 50) + 20,
      clientMeetings: Math.floor(Math.random() * 15) + 5,
      responseTime: Math.floor(Math.random() * 24) + 1 // hours
    }));

    // Generate department metrics
    const departments = [...new Set(employees.map(emp => emp.department || 'General'))];
    const departmentMetrics = departments.map(dept => {
      const deptEmployees = employees.filter(emp => (emp.department || 'General') === dept);
      return {
        name: dept,
        employeeCount: deptEmployees.length,
        avgPerformance: Math.floor(Math.random() * 20) + 75,
        totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
        projectsCompleted: Math.floor(Math.random() * 20) + 10,
        efficiency: Math.floor(Math.random() * 15) + 85
      };
    });

    // Generate goal tracking data
    const goalTracking = [
      {
        goal: 'Monthly Revenue Target',
        target: 2000000,
        current: totalRevenue,
        progress: totalRevenue > 0 ? Math.min((totalRevenue / 2000000) * 100, 100) : 0,
        status: totalRevenue >= 2000000 ? 'achieved' : totalRevenue >= 1600000 ? 'on-track' : 'behind'
      },
      {
        goal: 'Lead Generation',
        target: 100,
        current: totalLeads,
        progress: totalLeads > 0 ? Math.min((totalLeads / 100) * 100, 100) : 0,
        status: totalLeads >= 100 ? 'achieved' : totalLeads >= 80 ? 'on-track' : 'behind'
      },
      {
        goal: 'Project Completion',
        target: 50,
        current: completedProjects,
        progress: completedProjects > 0 ? Math.min((completedProjects / 50) * 100, 100) : 0,
        status: completedProjects >= 50 ? 'achieved' : completedProjects >= 40 ? 'on-track' : 'behind'
      },
      {
        goal: 'Client Acquisition',
        target: 25,
        current: companies.length,
        progress: companies.length > 0 ? Math.min((companies.length / 25) * 100, 100) : 0,
        status: companies.length >= 25 ? 'achieved' : companies.length >= 20 ? 'on-track' : 'behind'
      }
    ];

    // Generate trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const trends = {
      monthlyRevenue: months.map(month => ({
        month,
        value: Math.floor(Math.random() * 500000) + 1500000,
        growth: Math.floor(Math.random() * 20) - 10
      })),
      leadGeneration: months.map(month => ({
        month,
        value: Math.floor(Math.random() * 30) + 70,
        growth: Math.floor(Math.random() * 30) - 15
      })),
      projectCompletion: months.map(month => ({
        month,
        value: Math.floor(Math.random() * 15) + 35,
        growth: Math.floor(Math.random() * 25) - 12
      })),
      customerAcquisition: months.map(month => ({
        month,
        value: Math.floor(Math.random() * 8) + 12,
        growth: Math.floor(Math.random() * 40) - 20
      }))
    };

    // Generate leaderboards
    const topPerformers = teamPerformance
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5);

    const topDepartments = departmentMetrics
      .sort((a, b) => b.avgPerformance - a.avgPerformance)
      .slice(0, 3);

    const topProjects = projects
      .filter(p => p.project_cost)
      .sort((a, b) => parseFloat(b.project_cost) - parseFloat(a.project_cost))
      .slice(0, 5);

    return {
      kpis: {
        leadConversion: parseFloat(leadConversion),
        avgDealSize: avgDealSize,
        salesVelocity: Math.floor(Math.random() * 20) + 15, // Days
        customerRetention: Math.floor(Math.random() * 10) + 85,
        revenueGrowth: Math.floor(Math.random() * 20) + 10,
        teamProductivity: Math.floor(Math.random() * 15) + 80,
        projectSuccess: parseFloat(projectSuccess),
        clientSatisfaction: Math.floor(Math.random() * 10) + 85
      },
      teamPerformance,
      departmentMetrics,
      goalTracking,
      trends,
      leaderboard: {
        topPerformers,
        topDepartments,
        topProjects
      }
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'achieved': return '#10b981';
      case 'on-track': return '#f59e0b';
      case 'behind': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: '#10b981' };
    if (score >= 80) return { level: 'Good', color: '#f59e0b' };
    if (score >= 70) return { level: 'Average', color: '#f97316' };
    return { level: 'Needs Improvement', color: '#ef4444' };
  };

  if (loading) {
    return (
      <div className="performance-loading">
        <div className="loading-spinner"></div>
        <p>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="performance-container">
      <Navigation user={user} />
      
      <main className="performance-main">
        <div className="performance-header">
          <h1>Performance Dashboard</h1>
          <div className="performance-controls">
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="period-select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button onClick={loadPerformanceData} className="refresh-btn">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon lead-conversion">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Lead Conversion</h3>
              <p className="kpi-value">{performanceData.kpis.leadConversion}%</p>
              <span className="kpi-trend positive">+2.5%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon deal-size">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Avg Deal Size</h3>
              <p className="kpi-value">{formatCurrency(performanceData.kpis.avgDealSize)}</p>
              <span className="kpi-trend positive">+12.3%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon sales-velocity">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13,3A9,9 0 0,0 4,12H1L4.96,16.03L9,12H6A7,7 0 0,1 13,5A7,7 0 0,1 20,12A7,7 0 0,1 13,19C11.07,19 9.32,18.21 8.06,16.94L6.64,18.36C8.27,20 10.5,21 13,21A9,9 0 0,0 22,12A9,9 0 0,0 13,3Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Sales Velocity</h3>
              <p className="kpi-value">{performanceData.kpis.salesVelocity} days</p>
              <span className="kpi-trend negative">+1.2 days</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon retention">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Customer Retention</h3>
              <p className="kpi-value">{performanceData.kpis.customerRetention}%</p>
              <span className="kpi-trend positive">+3.1%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon revenue-growth">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Revenue Growth</h3>
              <p className="kpi-value">{performanceData.kpis.revenueGrowth}%</p>
              <span className="kpi-trend positive">+{performanceData.kpis.revenueGrowth}%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon productivity">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.9L16.2,16.2Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Team Productivity</h3>
              <p className="kpi-value">{performanceData.kpis.teamProductivity}%</p>
              <span className="kpi-trend positive">+4.8%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon project-success">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Project Success</h3>
              <p className="kpi-value">{performanceData.kpis.projectSuccess}%</p>
              <span className="kpi-trend positive">+6.2%</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon satisfaction">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12,2C6.47,2 2,6.47 2,12C2,17.53 6.47,22 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M13,9.94L14.06,11L15.12,9.94L16.18,11L17.24,9.94L15.12,7.82L13,9.94M8.88,9.94L9.94,11L11,9.94L8.88,7.82L6.76,9.94L7.82,11L8.88,9.94M12,17.5C14.33,17.5 16.31,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5Z"/>
              </svg>
            </div>
            <div className="kpi-content">
              <h3>Client Satisfaction</h3>
              <p className="kpi-value">{performanceData.kpis.clientSatisfaction}%</p>
              <span className="kpi-trend positive">+1.9%</span>
            </div>
          </div>
        </div>

        {/* Goal Tracking */}
        <div className="goals-section">
          <h2>Goal Tracking</h2>
          <div className="goals-grid">
            {performanceData.goalTracking.map((goal, index) => (
              <div key={index} className="goal-card">
                <div className="goal-header">
                  <h3>{goal.goal}</h3>
                  <span className={`goal-status ${goal.status}`}>
                    {goal.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="goal-progress">
                  <div className="goal-numbers">
                    <span className="current">{goal.current.toLocaleString()}</span>
                    <span className="target">/ {goal.target.toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{
                        width: `${Math.min(goal.progress, 100)}%`,
                        backgroundColor: getStatusColor(goal.status)
                      }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{goal.progress.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="team-section">
          <h2>Team Performance</h2>
          <div className="team-table-container">
            <table className="team-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Performance</th>
                  <th>Leads Generated</th>
                  <th>Deals Won</th>
                  <th>Revenue</th>
                  <th>Tasks Completed</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.teamPerformance.slice(0, 10).map((member, index) => {
                  const perfLevel = getPerformanceLevel(member.performance);
                  return (
                    <tr key={index}>
                      <td>
                        <div className="employee-info">
                          <div className="employee-avatar">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="employee-name">{member.name}</div>
                            <div className="employee-email">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{member.department}</td>
                      <td>
                        <div className="performance-cell">
                          <span 
                            className="performance-score"
                            style={{ color: perfLevel.color }}
                          >
                            {member.performance}%
                          </span>
                          <span 
                            className="performance-level"
                            style={{ color: perfLevel.color }}
                          >
                            {perfLevel.level}
                          </span>
                        </div>
                      </td>
                      <td>{member.leadsGenerated}</td>
                      <td>{member.dealsWon}</td>
                      <td>{formatCurrency(member.revenue)}</td>
                      <td>{member.tasksCompleted}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="leaderboards">
          <div className="leaderboard-card">
            <h3>Top Performers</h3>
            <div className="leaderboard-list">
              {performanceData.leaderboard.topPerformers.map((performer, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="performer-info">
                    <span className="performer-name">{performer.name}</span>
                    <span className="performer-metric">{performer.performance}% Performance</span>
                  </div>
                  <div className="performer-revenue">{formatCurrency(performer.revenue)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-card">
            <h3>Top Departments</h3>
            <div className="leaderboard-list">
              {performanceData.leaderboard.topDepartments.map((dept, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="performer-info">
                    <span className="performer-name">{dept.name}</span>
                    <span className="performer-metric">{dept.avgPerformance}% Avg Performance</span>
                  </div>
                  <div className="performer-revenue">{formatCurrency(dept.totalRevenue)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard-card">
            <h3>Top Projects</h3>
            <div className="leaderboard-list">
              {performanceData.leaderboard.topProjects.map((project, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="rank">#{index + 1}</div>
                  <div className="performer-info">
                    <span className="performer-name">{project.project_name || 'Unknown Project'}</span>
                    <span className="performer-metric">{project.client_name || 'Unknown Client'}</span>
                  </div>
                  <div className="performer-revenue">{formatCurrency(project.project_cost)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Trends */}
        <div className="trends-section">
          <h2>Performance Trends</h2>
          <div className="trend-selector">
            <button 
              className={selectedMetric === 'revenue' ? 'active' : ''}
              onClick={() => setSelectedMetric('revenue')}
            >
              Revenue
            </button>
            <button 
              className={selectedMetric === 'leads' ? 'active' : ''}
              onClick={() => setSelectedMetric('leads')}
            >
              Lead Generation
            </button>
            <button 
              className={selectedMetric === 'projects' ? 'active' : ''}
              onClick={() => setSelectedMetric('projects')}
            >
              Project Completion
            </button>
            <button 
              className={selectedMetric === 'customers' ? 'active' : ''}
              onClick={() => setSelectedMetric('customers')}
            >
              Customer Acquisition
            </button>
          </div>
          
          <div className="trend-chart">
            {performanceData.trends[selectedMetric === 'revenue' ? 'monthlyRevenue' : 
                                   selectedMetric === 'leads' ? 'leadGeneration' :
                                   selectedMetric === 'projects' ? 'projectCompletion' : 'customerAcquisition']
              .map((item, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-month">{item.month}</div>
                  <div className="trend-bar" style={{
                    height: `${selectedMetric === 'revenue' ? item.value / 10000 : item.value * 3}px`,
                    backgroundColor: item.growth >= 0 ? '#10b981' : '#ef4444'
                  }}>
                    <div className="trend-tooltip">
                      {selectedMetric === 'revenue' ? formatCurrency(item.value) : item.value}
                      <br/>
                      <span className={item.growth >= 0 ? 'positive' : 'negative'}>
                        {item.growth >= 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
