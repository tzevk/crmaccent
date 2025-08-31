'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import './timeline.css';

export default function ProjectTimelinePage() {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, calendar, gantt
  const [filterStatus, setFilterStatus] = useState('All');
  const [timeRange, setTimeRange] = useState('6months'); // 3months, 6months, 1year, all
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
        throw new Error('Failed to fetch projects');
      }
      
      const projectsData = await response.json();
      // Ensure projectsData is always an array
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
      setProjects([]); // Ensure projects remains an array on error
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': '#3b82f6',
      'In Progress': '#10b981',
      'On Hold': '#f59e0b',
      'Completed': '#059669',
      'Cancelled': '#dc2626'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (!value) return '₹0';
    const num = parseFloat(value);
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Cr`;
    } else if (num >= 100000) {
      return `₹${(num / 100000).toFixed(2)} L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const getProjectProgress = (project) => {
    if (project.current_status === 'Completed') return 100;
    if (project.current_status === 'Cancelled') return 0;
    
    const startDate = new Date(project.start_date || project.created_at);
    const endDate = new Date(project.expected_end_date || project.start_date);
    const currentDate = new Date();
    
    if (currentDate < startDate) return 0;
    if (currentDate > endDate) return 90; // Overdue but not complete
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = currentDate - startDate;
    return Math.min(Math.max((elapsedDuration / totalDuration) * 100, 0), 90);
  };

  const filteredProjects = (Array.isArray(projects) ? projects : []).filter(project => {
    if (filterStatus !== 'All' && project.current_status !== filterStatus) {
      return false;
    }
    
    if (timeRange !== 'all') {
      const projectDate = new Date(project.start_date || project.created_at);
      const cutoffDate = new Date();
      
      switch (timeRange) {
        case '3months':
          cutoffDate.setMonth(cutoffDate.getMonth() - 3);
          break;
        case '6months':
          cutoffDate.setMonth(cutoffDate.getMonth() - 6);
          break;
        case '1year':
          cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
          break;
      }
      
      if (projectDate < cutoffDate) return false;
    }
    
    return true;
  });

  const generateTimelineData = () => {
    const sortedProjects = [...filteredProjects].sort((a, b) => {
      const dateA = new Date(a.start_date || a.created_at);
      const dateB = new Date(b.start_date || b.created_at);
      return dateA - dateB;
    });

    const timelineItems = [];
    
    sortedProjects.forEach(project => {
      const startDate = new Date(project.start_date || project.created_at);
      const endDate = new Date(project.expected_end_date || project.start_date);
      
      timelineItems.push({
        ...project,
        startDate,
        endDate,
        progress: getProjectProgress(project),
        duration: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) || 30
      });
    });

    return timelineItems;
  };

  const timelineData = generateTimelineData();

  if (loading) {
    return (
      <div className="timeline-page">
        <Navigation user={user} />
        <div className="timeline-main">
          <div className="loading-spinner">
            <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p>Loading timeline...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <Navigation user={user} />
      
      <div className="timeline-main">
        <div className="timeline-container">
          {/* Header */}
          <div className="timeline-header">
            <div className="header-content">
              <h1>Project Timeline</h1>
              <p>Visualize project schedules, milestones, and progress across your portfolio</p>
            </div>
            <div className="header-actions">
              <button
                onClick={() => router.push('/projects')}
                className="btn-secondary"
              >
                Back to Projects
              </button>
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="timeline-controls">
            <div className="control-group">
              <label>View:</label>
              <div className="toggle-buttons">
                <button
                  className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'gantt' ? 'active' : ''}`}
                  onClick={() => setViewMode('gantt')}
                >
                  Gantt
                </button>
              </div>
            </div>

            <div className="control-group">
              <label>Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="control-group">
              <label>Time Range:</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="filter-select"
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Timeline Content */}
          {viewMode === 'timeline' && (
            <div className="timeline-content">
              <div className="timeline-track">
                {timelineData.map((project) => (
                  <div key={project.id} className="timeline-item">
                    <div className="timeline-date">
                      <span className="start-date">{formatDate(project.start_date)}</span>
                      <span className="end-date">{formatDate(project.expected_end_date)}</span>
                    </div>
                    
                    <div className="timeline-marker">
                      <div 
                        className="marker-dot"
                        style={{ backgroundColor: getStatusColor(project.current_status) }}
                      ></div>
                      <div className="marker-line"></div>
                    </div>
                    
                    <div className="timeline-card">
                      <div className="card-header">
                        <h3>{project.project_title || project.project_name}</h3>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(project.current_status) }}
                        >
                          {project.current_status}
                        </span>
                      </div>
                      
                      <div className="card-content">
                        <div className="project-details">
                          <p><strong>Client:</strong> {project.client_name}</p>
                          <p><strong>Value:</strong> {formatCurrency(project.estimated_value)}</p>
                          <p><strong>Duration:</strong> {project.duration} days</p>
                          <p><strong>Manager:</strong> {project.project_manager || 'Not assigned'}</p>
                        </div>
                        
                        <div className="progress-section">
                          <div className="progress-header">
                            <span>Progress</span>
                            <span>{Math.round(project.progress)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${project.progress}%`,
                                backgroundColor: getStatusColor(project.current_status)
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button
                          onClick={() => router.push(`/projects/${project.id}`)}
                          className="btn-view"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {timelineData.length === 0 && (
                <div className="empty-timeline">
                  <div className="empty-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12,6 12,12 16,14"></polyline>
                    </svg>
                  </div>
                  <h3>No Projects Found</h3>
                  <p>No projects match your current filters</p>
                  <button
                    onClick={() => router.push('/projects/add')}
                    className="btn-primary"
                  >
                    Create First Project
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Calendar View */}
          {viewMode === 'calendar' && (
            <div className="calendar-content">
              <div className="calendar-grid">
                <div className="calendar-header">
                  <div className="month-navigation">
                    <button className="nav-btn">←</button>
                    <h3>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3>
                    <button className="nav-btn">→</button>
                  </div>
                </div>
                
                <div className="calendar-body">
                  <div className="weekdays">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="weekday">{day}</div>
                    ))}
                  </div>
                  
                  <div className="calendar-days">
                    {/* Calendar implementation would go here */}
                    <div className="calendar-placeholder">
                      <p>Calendar view coming soon...</p>
                      <p>Switch to Timeline view to see project schedules</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gantt View */}
          {viewMode === 'gantt' && (
            <div className="gantt-content">
              <div className="gantt-chart">
                <div className="gantt-header">
                  <div className="gantt-timeline-header">
                    {/* Timeline headers would be generated dynamically */}
                    <div className="time-unit">Jan 2025</div>
                    <div className="time-unit">Feb 2025</div>
                    <div className="time-unit">Mar 2025</div>
                    <div className="time-unit">Apr 2025</div>
                    <div className="time-unit">May 2025</div>
                    <div className="time-unit">Jun 2025</div>
                  </div>
                </div>
                
                <div className="gantt-body">
                  {timelineData.map((project) => (
                    <div key={project.id} className="gantt-row">
                      <div className="gantt-project-info">
                        <h4>{project.project_title}</h4>
                        <p>{project.client_name}</p>
                      </div>
                      <div className="gantt-timeline">
                        <div 
                          className="gantt-bar"
                          style={{
                            backgroundColor: getStatusColor(project.current_status),
                            width: `${project.duration / 10}%`,
                            marginLeft: `${Math.random() * 20}%` // Placeholder positioning
                          }}
                        >
                          <span className="gantt-bar-label">{Math.round(project.progress)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {timelineData.length === 0 && (
                  <div className="gantt-placeholder">
                    <p>No projects to display in Gantt chart</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
