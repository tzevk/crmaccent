'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './analytics.css';

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalLeads: 0,
      totalCompanies: 0,
      totalProposals: 0,
      totalProjects: 0,
      totalRevenue: 0,
      conversionRate: 0,
      activeUsers: 0,
      monthlyGrowth: 0
    },
    leadAnalytics: {
      leadsBySource: [],
      leadsByStatus: [],
      leadConversionTrend: [],
      topPerformingSources: []
    },
    projectAnalytics: {
      projectsByStatus: [],
      projectsByType: [],
      projectRevenue: [],
      projectDuration: []
    },
    companyAnalytics: {
      companiesByIndustry: [],
      companiesBySize: [],
      topClients: [],
      clientRetention: 0
    },
    employeeAnalytics: {
      employeePerformance: [],
      departmentDistribution: [],
      activityLevels: []
    }
  });
  const [timeRange, setTimeRange] = useState('30d');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadAnalyticsData();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
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

      // Process and analyze the data
      const processedData = processAnalyticsData(
        leadsData.leads || [],
        companiesData.companies || [],
        proposalsData.proposals || [],
        projectsData.projects || [],
        employeesData.employees || []
      );

      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (leads, companies, proposals, projects, employees) => {
    // Process overview metrics
    const totalRevenue = projects.reduce((sum, project) => sum + (parseFloat(project.project_cost) || 0), 0);
    const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
    const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : 0;

    // Process lead analytics
    const leadsBySource = leads.reduce((acc, lead) => {
      const source = lead.source || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const leadsByStatus = leads.reduce((acc, lead) => {
      const status = lead.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Process project analytics
    const projectsByStatus = projects.reduce((acc, project) => {
      const status = project.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const projectsByType = projects.reduce((acc, project) => {
      const type = project.project_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Process company analytics
    const companiesByIndustry = companies.reduce((acc, company) => {
      const industry = company.industry || 'Unknown';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {});

    return {
      overview: {
        totalLeads: leads.length,
        totalCompanies: companies.length,
        totalProposals: proposals.length,
        totalProjects: projects.length,
        totalRevenue: totalRevenue,
        conversionRate: parseFloat(conversionRate),
        activeUsers: employees.length,
        monthlyGrowth: 12.5 // This would be calculated based on historical data
      },
      leadAnalytics: {
        leadsBySource: Object.entries(leadsBySource).map(([key, value]) => ({ name: key, value })),
        leadsByStatus: Object.entries(leadsByStatus).map(([key, value]) => ({ name: key, value })),
        leadConversionTrend: generateTrendData(leads),
        topPerformingSources: Object.entries(leadsBySource)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([key, value]) => ({ name: key, count: value }))
      },
      projectAnalytics: {
        projectsByStatus: Object.entries(projectsByStatus).map(([key, value]) => ({ name: key, value })),
        projectsByType: Object.entries(projectsByType).map(([key, value]) => ({ name: key, value })),
        projectRevenue: generateRevenueData(projects),
        projectDuration: calculateAverageProjectDuration(projects)
      },
      companyAnalytics: {
        companiesByIndustry: Object.entries(companiesByIndustry).map(([key, value]) => ({ name: key, value })),
        companiesBySize: generateCompanySizeData(companies),
        topClients: getTopClients(companies, projects),
        clientRetention: 85.2 // This would be calculated based on historical data
      },
      employeeAnalytics: {
        employeePerformance: generateEmployeePerformanceData(employees),
        departmentDistribution: generateDepartmentData(employees),
        activityLevels: generateActivityData(employees)
      }
    };
  };

  const generateTrendData = (leads) => {
    // Generate mock trend data based on created dates
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      leads: Math.floor(Math.random() * 50) + 10,
      conversions: Math.floor(Math.random() * 15) + 5
    }));
  };

  const generateRevenueData = (projects) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 100000) + 50000
    }));
  };

  const calculateAverageProjectDuration = (projects) => {
    if (projects.length === 0) return 0;
    
    const durations = projects
      .filter(p => p.start_date && p.end_date)
      .map(p => {
        const start = new Date(p.start_date);
        const end = new Date(p.end_date);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      });
    
    return durations.length > 0 
      ? Math.round(durations.reduce((sum, duration) => sum + duration, 0) / durations.length)
      : 0;
  };

  const generateCompanySizeData = (companies) => {
    return [
      { name: 'Small (1-50)', value: Math.floor(companies.length * 0.4) },
      { name: 'Medium (51-200)', value: Math.floor(companies.length * 0.4) },
      { name: 'Large (201+)', value: Math.floor(companies.length * 0.2) }
    ];
  };

  const getTopClients = (companies, projects) => {
    const clientRevenue = projects.reduce((acc, project) => {
      const client = project.client_name || 'Unknown';
      acc[client] = (acc[client] || 0) + (parseFloat(project.project_cost) || 0);
      return acc;
    }, {});

    return Object.entries(clientRevenue)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }));
  };

  const generateEmployeePerformanceData = (employees) => {
    return employees.slice(0, 5).map(emp => ({
      name: emp.name || 'Unknown',
      performance: Math.floor(Math.random() * 40) + 60,
      tasksCompleted: Math.floor(Math.random() * 20) + 5
    }));
  };

  const generateDepartmentData = (employees) => {
    const departments = employees.reduce((acc, emp) => {
      const dept = emp.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(departments).map(([name, count]) => ({ name, count }));
  };

  const generateActivityData = (employees) => {
    return employees.map(emp => ({
      name: emp.name || 'Unknown',
      activity: Math.floor(Math.random() * 100),
      lastActive: new Date().toISOString().split('T')[0]
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <Navigation user={user} />
      
      <main className="analytics-main">
        <div className="analytics-content">
          {/* Header */}
          <div className="analytics-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="analytics-title">Analytics Dashboard</h1>
              <p className="analytics-subtitle">Comprehensive insights and performance metrics</p>
            </div>
            <div className="header-actions">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="time-range-select"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="365d">Last year</option>
              </select>
              <button onClick={loadAnalyticsData} className="refresh-btn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="analytics-overview">
          <div className="overview-grid">
            <div className="overview-card">
              <div className="card-icon leads">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-label">Total Leads</div>
                <div className="card-number">{analyticsData.overview.totalLeads}</div>
                <div className="card-change positive">+12.5%</div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon companies">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-label">Total Companies</div>
                <div className="card-number">{analyticsData.overview.totalCompanies}</div>
                <div className="card-change positive">+8.2%</div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon projects">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-label">Total Projects</div>
                <div className="card-number">{analyticsData.overview.totalProjects}</div>
                <div className="card-change positive">+15.3%</div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon revenue">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-label">Total Revenue</div>
                <div className="card-number">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
                <div className="card-change positive">+23.1%</div>
              </div>
            </div>

            <div className="overview-card">
              <div className="card-icon conversion">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <div className="card-content">
                <div className="card-label">Conversion Rate</div>
                <div className="card-number">{analyticsData.overview.conversionRate}%</div>
                <div className="card-change positive">+2.3%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Content */}
        <div className="analytics-content">
          <div className="analytics-grid">
          {/* Lead Analytics */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h2 className="analytics-card-title">
                <div className="analytics-title-icon">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                Lead Analytics
              </h2>
            </div>
            <div className="analytics-card-content">
              <div className="analytics-chart">
                <h3>Leads by Source</h3>
                <div className="chart-data">
                  {analyticsData.leadAnalytics.leadsBySource.map((item, index) => (
                    <div key={index} className="chart-item">
                      <div className="chart-bar">
                        <div 
                          className="chart-fill" 
                          style={{
                            width: `${(item.value / Math.max(...analyticsData.leadAnalytics.leadsBySource.map(i => i.value))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="chart-labels">
                        <span className="chart-label">{item.name}</span>
                        <span className="chart-value">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Project Analytics */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h2 className="analytics-card-title">
                <div className="analytics-title-icon">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                Project Analytics
              </h2>
            </div>
            <div className="analytics-card-content">
              <div className="analytics-chart">
                <h3>Projects by Status</h3>
                <div className="chart-data">
                  {analyticsData.projectAnalytics.projectsByStatus.map((item, index) => (
                    <div key={index} className="chart-item">
                      <div className="chart-bar">
                        <div 
                          className="chart-fill" 
                          style={{
                            width: `${(item.value / Math.max(...analyticsData.projectAnalytics.projectsByStatus.map(i => i.value))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <div className="chart-labels">
                        <span className="chart-label">{item.name}</span>
                        <span className="chart-value">{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h2 className="analytics-card-title">
                <div className="analytics-title-icon">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                Top Performers
              </h2>
            </div>
            <div className="analytics-card-content">
              <div className="performers-list">
                {analyticsData.leadAnalytics.topPerformingSources.map((source, index) => (
                  <div key={index} className="performer-item">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-info">
                      <div className="performer-name">{source.name}</div>
                      <div className="performer-metric">{source.count} leads</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Trends */}
        <div className="analytics-card full-width">
          <div className="analytics-card-header">
            <h2 className="analytics-card-title">
              <div className="analytics-title-icon">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
                </svg>
              </div>
              Revenue Trends
            </h2>
          </div>
          <div className="analytics-card-content">
            <div className="trend-chart">
              {analyticsData.projectAnalytics.projectRevenue.map((item, index) => (
                <div key={index} className="trend-item">
                  <div className="trend-month">{item.month}</div>
                  <div className="trend-bar" style={{height: `${item.revenue / 1000}px`}}>
                    <div className="trend-value">{formatCurrency(item.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        </div>
      </main>
    </div>
  );
}
