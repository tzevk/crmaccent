'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './reports-refined.css';

export default function ReportsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    leads: [],
    companies: [],
    proposals: [],
    projects: [],
    employees: []
  });
  const [selectedReport, setSelectedReport] = useState('leads');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    assignedTo: '',
    type: ''
  });
  const [exportFormat, setExportFormat] = useState('csv');
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadReportData();
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    loadReportData();
  }, [selectedReport, dateRange, filters]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch data based on selected report
      const endpoints = {
        leads: '/api/leads',
        companies: '/api/companies',
        proposals: '/api/proposals',
        projects: '/api/projects',
        employees: '/api/employees'
      };

      const response = await fetch(endpoints[selectedReport]);
      if (response.ok) {
        const data = await response.json();
        setReportData(prev => ({
          ...prev,
          [selectedReport]: data[selectedReport] || data || []
        }));
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const currentData = reportData[selectedReport] || [];
    
    // Apply filters
    let filteredData = currentData.filter(item => {
      const itemDate = new Date(item.created_at || item.received_date || new Date());
      const inDateRange = itemDate >= new Date(dateRange.startDate) && 
                         itemDate <= new Date(dateRange.endDate);
      
      if (!inDateRange) return false;
      
      if (filters.status && item.status !== filters.status) return false;
      if (filters.source && item.source !== filters.source) return false;
      if (filters.type && item.project_type !== filters.type) return false;
      if (filters.assignedTo && item.assigned_to !== filters.assignedTo) return false;
      
      return true;
    });

    return filteredData;
  };

  const getReportSummary = (data) => {
    const summary = {
      totalRecords: data.length,
      revenue: 0,
      avgValue: 0,
      statusBreakdown: {},
      typeBreakdown: {},
      sourceBreakdown: {}
    };

    data.forEach(item => {
      // Revenue calculation
      const value = parseFloat(item.estimated_value || item.project_cost || item.proposal_amount || 0);
      summary.revenue += value;

      // Status breakdown
      const status = item.status || 'Unknown';
      summary.statusBreakdown[status] = (summary.statusBreakdown[status] || 0) + 1;

      // Type breakdown
      const type = item.project_type || item.type || item.industry || 'Unknown';
      summary.typeBreakdown[type] = (summary.typeBreakdown[type] || 0) + 1;

      // Source breakdown
      const source = item.source || 'Unknown';
      summary.sourceBreakdown[source] = (summary.sourceBreakdown[source] || 0) + 1;
    });

    summary.avgValue = data.length > 0 ? summary.revenue / data.length : 0;

    return summary;
  };

  const exportReport = (format) => {
    const data = generateReport();
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${selectedReport}_report_${timestamp}`;

    if (format === 'csv') {
      exportToCSV(data, filename);
    } else if (format === 'json') {
      exportToJSON(data, filename);
    } else if (format === 'pdf') {
      exportToPDF(data, filename);
    }
  };

  const exportToCSV = (data, filename) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(key => 
      !key.includes('_at') || key === 'created_at'
    );
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value || '';
        }).join(',')
      )
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data, filename) => {
    // For a full implementation, you would use a library like jsPDF
    // For now, we'll create a simple HTML report
    const summary = getReportSummary(data);
    const htmlContent = `
      <html>
        <head>
          <title>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #64126D; color: white; padding: 20px; text-align: center; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #64126D; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Period: ${dateRange.startDate} to ${dateRange.endDate}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Records:</strong> ${summary.totalRecords}</p>
            <p><strong>Total Revenue:</strong> ₹${summary.revenue.toLocaleString()}</p>
            <p><strong>Average Value:</strong> ₹${summary.avgValue.toLocaleString()}</p>
          </div>
          
          <h2>Detailed Data</h2>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${Object.values(row).map(value => `<td>${value || ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const currentData = generateReport();
  const summary = getReportSummary(currentData);

  if (loading) {
    return (
      <div className="reports-loading">
        <div className="loading-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <Navigation user={user} />
      
      <main className="reports-main">
        <div className="reports-header">
          <h1>Reports Dashboard</h1>
          <div className="reports-actions">
            <button 
              onClick={() => exportReport(exportFormat)} 
              className="export-btn"
              disabled={currentData.length === 0}
            >
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
              </svg>
              Export Report
            </button>
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="format-select"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="pdf">HTML</option>
            </select>
          </div>
        </div>

        {/* Report Controls */}
        <div className="reports-controls">
          <div className="control-section">
            <label>Report Type:</label>
            <select 
              value={selectedReport} 
              onChange={(e) => setSelectedReport(e.target.value)}
              className="report-select"
            >
              <option value="leads">Leads Report</option>
              <option value="companies">Companies Report</option>
              <option value="proposals">Proposals Report</option>
              <option value="projects">Projects Report</option>
              <option value="employees">Employees Report</option>
            </select>
          </div>

          <div className="control-section">
            <label>Date Range:</label>
            <input 
              type="date" 
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
              className="date-input"
            />
            <span>to</span>
            <input 
              type="date" 
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
              className="date-input"
            />
          </div>

          <div className="control-section">
            <label>Filters:</label>
            <select 
              value={filters.status}
              onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {selectedReport === 'leads' && (
              <select 
                value={filters.source}
                onChange={(e) => setFilters(prev => ({...prev, source: e.target.value}))}
                className="filter-select"
              >
                <option value="">All Sources</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Email Campaign">Email Campaign</option>
                <option value="Cold Call">Cold Call</option>
              </select>
            )}
          </div>
        </div>

        {/* Report Summary */}
        <div className="reports-summary">
          <div className="summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7 13l3 3 7-7"/>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Total Records</h3>
              <p className="summary-number">{summary.totalRecords}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Total Revenue</h3>
              <p className="summary-number">{formatCurrency(summary.revenue)}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
              </svg>
            </div>
            <div className="summary-content">
              <h3>Average Value</h3>
              <p className="summary-number">{formatCurrency(summary.avgValue)}</p>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="reports-breakdown">
          <div className="breakdown-card">
            <h3>Status Breakdown</h3>
            <div className="breakdown-list">
              {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                <div key={status} className="breakdown-item">
                  <span className="breakdown-label">{status}</span>
                  <span className="breakdown-count">{count}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{
                        width: `${(count / summary.totalRecords) * 100}%`,
                        backgroundColor: '#64126D'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-card">
            <h3>Type Breakdown</h3>
            <div className="breakdown-list">
              {Object.entries(summary.typeBreakdown).map(([type, count]) => (
                <div key={type} className="breakdown-item">
                  <span className="breakdown-label">{type}</span>
                  <span className="breakdown-count">{count}</span>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-fill"
                      style={{
                        width: `${(count / summary.totalRecords) * 100}%`,
                        backgroundColor: '#86288F'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedReport === 'leads' && (
            <div className="breakdown-card">
              <h3>Source Breakdown</h3>
              <div className="breakdown-list">
                {Object.entries(summary.sourceBreakdown).map(([source, count]) => (
                  <div key={source} className="breakdown-item">
                    <span className="breakdown-label">{source}</span>
                    <span className="breakdown-count">{count}</span>
                    <div className="breakdown-bar">
                      <div 
                        className="breakdown-fill"
                        style={{
                          width: `${(count / summary.totalRecords) * 100}%`,
                          backgroundColor: '#A855F7'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Table */}
        <div className="reports-table">
          <h3>{selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Data</h3>
          {currentData.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    {Object.keys(currentData[0]).filter(key => 
                      !key.includes('_at') || key === 'created_at'
                    ).map(key => (
                      <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.slice(0, 50).map((item, index) => (
                    <tr key={index}>
                      {Object.entries(item).filter(([key]) => 
                        !key.includes('_at') || key === 'created_at'
                      ).map(([key, value]) => (
                        <td key={key}>
                          {key.includes('cost') || key.includes('amount') || key.includes('value')
                            ? formatCurrency(value)
                            : key === 'created_at'
                            ? new Date(value).toLocaleDateString()
                            : value || '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {currentData.length > 50 && (
                <p className="table-note">Showing first 50 records. Export for complete data.</p>
              )}
            </div>
          ) : (
            <div className="no-data">
              <p>No data available for the selected filters and date range.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
