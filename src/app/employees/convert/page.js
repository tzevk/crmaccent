"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationMinimal from '@/components/navigation/Navigation';
import "../employees.css";

export default function EmployeeConvertPage() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [convertedEmployees, setConvertedEmployees] = useState(new Set());
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    converted: 0,
    pending: 0,
    departments: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchEmployees();
    fetchConvertedEmployees();
  }, [router]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/employees");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch employees`);
      }
      
      const employeesData = await response.json();
      setEmployees(employeesData);
      
      // Calculate stats
      const totalEmployees = employeesData.length;
      const uniqueDepartments = new Set(employeesData.filter(e => e.department).map(e => e.department)).size;
      
      setStats(prevStats => ({
        ...prevStats,
        total: totalEmployees,
        departments: uniqueDepartments,
      }));
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchConvertedEmployees = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const users = await response.json();
        const convertedIds = new Set(
          users
            .filter(user => user.employee_id)
            .map(user => user.employee_id)
        );
        setConvertedEmployees(convertedIds);
        
        setStats(prevStats => ({
          ...prevStats,
          converted: convertedIds.size,
          pending: prevStats.total - convertedIds.size,
        }));
      }
    } catch (error) {
      console.error("Error fetching converted employees:", error);
    }
  };

  const handleConvertEmployee = async (employee) => {
    if (convertedEmployees.has(employee.id)) {
      alert("This employee has already been converted to a user account.");
      return;
    }

    // Navigate to detailed conversion page
    router.push(`/employees/convert/${employee.id}`);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  }).sort((a, b) => {
    // Sort alphabetically by full name (firstName + lastName)
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const departments = [...new Set(employees.filter(e => e.department).map(e => e.department))];

  if (loading) {
    return (
      <div className="page-container">
        <NavigationMinimal user={user} />
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner"></div>
              <div className="loading-text">Loading employees...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <NavigationMinimal user={user} />
      
      <div className="main-content">
        {/* Header Section */}
        <div className="content-header">
          <div className="header-text">
            <h1 className="page-title">Employee to User Conversion</h1>
            <p className="page-description">
              Convert employees to user accounts with system access and login credentials
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => router.push('/users')}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              View Users
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.converted}</div>
              <div className="stat-label">Converted to Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending Conversion</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.departments}</div>
              <div className="stat-label">Departments</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="filters-container">
          <div className="search-container">
            <svg className="search-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search employees by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-group">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Employees Table */}
        <div className="table-container">
          {filteredEmployees.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-icon" width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3>No employees found</h3>
              <p>No employees match your current search and filter criteria.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Conversion Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const isConverted = convertedEmployees.has(employee.id);
                  return (
                    <tr key={employee.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {employee.firstName.charAt(0).toUpperCase()}{employee.lastName.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name">{employee.firstName} {employee.lastName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="email">{employee.email}</span>
                      </td>
                      <td>
                        <span className="department">{employee.department || 'Not Assigned'}</span>
                      </td>
                      <td>
                        <span className={`status-badge status-${(employee.status || 'active').toLowerCase()}`}>
                          <div className={`status-dot status-dot-${(employee.status || 'active').toLowerCase()}`}></div>
                          {employee.status || 'Active'}
                        </span>
                      </td>
                      <td>
                        {isConverted ? (
                          <span className="conversion-status converted">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Converted
                          </span>
                        ) : (
                          <span className="conversion-status pending">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleConvertEmployee(employee)}
                          disabled={isConverted}
                          className={`btn btn-sm ${isConverted ? 'btn-disabled' : 'btn-primary'}`}
                          title={isConverted ? 'Already converted' : 'Convert to user'}
                        >
                          {isConverted ? (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Converted
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Convert
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Credential Modal */}
    </div>
  );
}