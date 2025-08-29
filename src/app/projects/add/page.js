'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/navigation/Navigation';
import '../projects.css';
import './project-form.css';

export default function AddProjectPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    project_number: '',
    project_name: '',
    client_name: '',
    city: '',
    received_date: '',
    project_type: 'Construction',
    project_cost: '',
    currency: 'INR',
    start_date: '',
    end_date: '',
    duration: '',
    manhours: '',
    project_head: '',
    project_manager: '',
    project_lead: '',
    area_engineer: '',
    project_team: [],
    status: 'Proposal',
    proposal_id: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchCompanies();
    fetchEmployees();
  }, [router]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-calculate duration when dates change
    if (name === 'start_date' || name === 'end_date') {
      const startDate = name === 'start_date' ? new Date(value) : new Date(formData.start_date);
      const endDate = name === 'end_date' ? new Date(value) : new Date(formData.end_date);
      
      if (startDate && endDate && !isNaN(startDate) && !isNaN(endDate)) {
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        if (daysDiff >= 0) {
          setFormData(prev => ({ ...prev, duration: daysDiff.toString() }));
        }
      }
    }
  };

  const handleTeamMemberAdd = () => {
    setFormData(prev => ({
      ...prev,
      project_team: [...prev.project_team, '']
    }));
  };

  const handleTeamMemberChange = (index, value) => {
    const newTeam = [...formData.project_team];
    newTeam[index] = value;
    setFormData(prev => ({
      ...prev,
      project_team: newTeam
    }));
  };

  const handleTeamMemberRemove = (index) => {
    const newTeam = formData.project_team.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      project_team: newTeam
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        project_team: JSON.stringify(formData.project_team.filter(member => member.trim()))
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Project created successfully!');
        router.push('/projects');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('Error creating project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateProjectNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const projectNumber = `PRJ-${year}${month}-${random}`;
    
    setFormData(prev => ({
      ...prev,
      project_number: projectNumber
    }));
  };

  if (!user) return null;

  return (
    <div className="projects-page">
      <Navigation user={user} />
      
      <main className="projects-main">
        <div className="projects-container">
          {/* Header */}
          <div className="form-header">
            <div className="header-content">
              <h1>Add New Project</h1>
              <p>Create a new project in your portfolio</p>
            </div>
            <Link href="/projects" className="btn-secondary">
              ← Back to Projects
            </Link>
          </div>

          {/* Form */}
          <div className="form-container">
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="project_number">Project Number *</label>
                    <div className="input-with-button">
                      <input
                        type="text"
                        id="project_number"
                        name="project_number"
                        value={formData.project_number}
                        onChange={handleInputChange}
                        required
                        placeholder="PRJ-202412-001"
                      />
                      <button
                        type="button"
                        onClick={generateProjectNumber}
                        className="btn-generate"
                        title="Generate Project Number"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="project_name">Project Name *</label>
                    <input
                      type="text"
                      id="project_name"
                      name="project_name"
                      value={formData.project_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter project name"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="client_name">Client Name *</label>
                    <input
                      type="text"
                      id="client_name"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter client name"
                      list="companies-list"
                    />
                    <datalist id="companies-list">
                      {companies.map((company) => (
                        <option key={company.id} value={company.company_name} />
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter city"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="received_date">Received Date</label>
                    <input
                      type="date"
                      id="received_date"
                      name="received_date"
                      value={formData.received_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="project_type">Project Type *</label>
                    <select
                      id="project_type"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Construction">Construction</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Design">Design</option>
                      <option value="Supply">Supply</option>
                      <option value="Installation">Installation</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Financial Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="project_cost">Project Cost</label>
                    <input
                      type="number"
                      id="project_cost"
                      name="project_cost"
                      value={formData.project_cost}
                      onChange={handleInputChange}
                      placeholder="Enter project cost"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Timeline</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_date">Start Date</label>
                    <input
                      type="date"
                      id="start_date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end_date">End Date</label>
                    <input
                      type="date"
                      id="end_date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="duration">Duration (Days)</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      placeholder="Auto-calculated or manual entry"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="manhours">Manhours</label>
                    <input
                      type="number"
                      id="manhours"
                      name="manhours"
                      value={formData.manhours}
                      onChange={handleInputChange}
                      placeholder="Estimated manhours"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Team Assignment</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="project_head">Project Head</label>
                    <select
                      id="project_head"
                      name="project_head"
                      value={formData.project_head}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Project Head</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.name}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="project_manager">Project Manager</label>
                    <select
                      id="project_manager"
                      name="project_manager"
                      value={formData.project_manager}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Project Manager</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.name}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="project_lead">Project Lead</label>
                    <select
                      id="project_lead"
                      name="project_lead"
                      value={formData.project_lead}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Project Lead</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.name}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="area_engineer">Area Engineer</label>
                    <select
                      id="area_engineer"
                      name="area_engineer"
                      value={formData.area_engineer}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Area Engineer</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.name}>
                          {employee.name} - {employee.designation}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Project Team Members</label>
                  <div className="team-members">
                    {formData.project_team.map((member, index) => (
                      <div key={index} className="team-member-row">
                        <select
                          value={member}
                          onChange={(e) => handleTeamMemberChange(index, e.target.value)}
                          className="team-member-select"
                        >
                          <option value="">Select Team Member</option>
                          {employees.map((employee) => (
                            <option key={employee.id} value={employee.name}>
                              {employee.name} - {employee.designation}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleTeamMemberRemove(index)}
                          className="btn-remove-member"
                          title="Remove Member"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleTeamMemberAdd}
                      className="btn-add-member"
                    >
                      + Add Team Member
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Status & Additional</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Proposal">Proposal</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Project">Project</option>
                      <option value="Hold">Hold</option>
                      <option value="Closed">Closed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Regret">Regret</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="proposal_id">Related Proposal ID</label>
                    <input
                      type="number"
                      id="proposal_id"
                      name="proposal_id"
                      value={formData.proposal_id}
                      onChange={handleInputChange}
                      placeholder="Optional: Link to proposal"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="form-actions">
                <Link href="/projects" className="btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
