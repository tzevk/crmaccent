"use client";

import { useState } from "react";
import "./EmployeeList.css";

export default function EmployeeList({ employees, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Get unique departments for filter
  const departments = ["All", ...new Set(employees.filter(e => e.department).map(e => e.department))];
  const statuses = ["All", "Working", "On Leave", "Terminated"];

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === "All" || employee.department === filterDepartment;
    const matchesStatus = filterStatus === "All" || employee.employeeStatus === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const formatSalary = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const calculateGrossSalary = (employee) => {
    const basic = parseFloat(employee.basicSalary) || 0;
    const da = parseFloat(employee.da) || 0;
    const hra = parseFloat(employee.hra) || 0;
    const conveyance = parseFloat(employee.conveyanceAllowance) || 0;
    const other = parseFloat(employee.otherAllowance) || 0;
    return basic + da + hra + conveyance + other;
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Working": "status-working",
      "On Leave": "status-leave",
      "Terminated": "status-terminated"
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'status-default'}`}>
        {status || "Unknown"}
      </span>
    );
  };

  return (
    <div className="employee-list-container">
      {/* Search and Filters */}
      <div className="list-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search employees by name, email, department, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <div className="filters-container">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Showing {filteredEmployees.length} of {employees.length} employees
      </div>

      {/* Employee Table */}
      <div className="table-container">
        {filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <h3>No employees found</h3>
            <p>Try adjusting your search criteria or add a new employee.</p>
          </div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joining Date</th>
                <th>Gross Salary</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="employee-row">
                  <td>
                    <span className="employee-id">
                      {employee.username || `EMP${employee.id?.toString().padStart(3, '0')}`}
                    </span>
                  </td>
                  <td>
                    <div className="employee-name">
                      <div className="name-primary">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="name-secondary">
                        {employee.email}
                      </div>
                    </div>
                  </td>
                  <td>{employee.department || "-"}</td>
                  <td>{employee.role || "-"}</td>
                  <td>{getStatusBadge(employee.employeeStatus)}</td>
                  <td>{formatDate(employee.joiningDate)}</td>
                  <td className="salary-cell">
                    {formatSalary(calculateGrossSalary(employee))}
                  </td>
                  <td>
                    <div className="contact-info">
                      {employee.mobile && (
                        <div className="contact-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                          {employee.mobile}
                        </div>
                      )}
                      {employee.email && (
                        <div className="contact-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                          {employee.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEdit(employee)}
                        className="btn btn-edit"
                        title="Edit Employee"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                        className="btn btn-delete"
                        title="Delete Employee"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
