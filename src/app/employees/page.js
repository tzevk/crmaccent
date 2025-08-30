"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationMinimal from "@/components/navigation/Navigation";
import EmployeeForm from "@/components/employees/EmployeeForm";
import EmployeeList from "@/components/employees/EmployeeList";
import "./employees.css";

export default function EmployeesPage() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const router = useRouter();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
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
      const activeCount = employeesData.filter(e => e.status === "Active").length;
      const inactiveCount = employeesData.filter(e => e.status === "Inactive").length;
      const uniqueDepartments = new Set(employeesData.filter(e => e.department).map(e => e.department)).size;
      
      setStats({
        total: totalEmployees,
        active: activeCount,
        inactive: inactiveCount,
        departments: uniqueDepartments,
      });
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setActiveTab("form");
  };

  const handleImportEmployees = () => {
    setShowImportModal(true);
    setSelectedFile(null);
    setError(null);
    setPreviewData(null);
    setShowPreview(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError(null);
    setPreviewData(null);
    setShowPreview(false);
  };

  const handlePreview = async () => {
    console.log('Preview button clicked!');
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    console.log('Selected file:', selectedFile.name);

    try {
      // Import XLSX dynamically
      console.log('Importing XLSX...');
      const XLSX = await import('xlsx');
      
      // Read the Excel file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with header row
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '' 
      });
      
      if (jsonData.length < 2) {
        setError('Excel file must contain at least a header row and one data row');
        return;
      }
      
      const headers = jsonData[0];
      const dataRows = jsonData.slice(1);
      
      // Process the data for preview
      const processedData = dataRows.map((row, index) => {
        const rowData = {};
        headers.forEach((header, colIndex) => {
          rowData[header] = row[colIndex] || '';
        });
        return { ...rowData, originalRowIndex: index + 1 };
      }).filter(row => {
        // Filter out completely empty rows
        return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
      });
      
      setPreviewData({
        headers,
        data: processedData,
        totalRows: processedData.length
      });
      setShowPreview(true);
      setError(null);
      
    } catch (error) {
      console.error('Preview error:', error);
      setError(`Failed to preview file: ${error.message}`);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    if (importing) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setImporting(true);
      setError(null);
      
      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      // Show detailed results
      if (result.results && result.results.imported > 0) {
        alert(`✅ Success! ${result.results.imported} employees imported successfully${result.results.errors > 0 ? ` (${result.results.errors} errors)` : ''}`);
      } else {
        alert(`❌ Import completed but no employees were added. ${result.message}`);
      }
      
      await fetchEmployees();
      setShowImportModal(false);
      setSelectedFile(null);
      setShowPreview(false);
      setPreviewData(null);
      
    } catch (error) {
      console.error('Error importing employees:', error);
      setError(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = '/api/employees/template';
    link.download = 'employees_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setActiveTab("form");
  };

  const handleFormSubmit = async (employeeData) => {
    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.id}` 
        : "/api/employees";
      
      const method = editingEmployee ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save employee");
      }

      await fetchEmployees();
      setActiveTab("list");
      setEditingEmployee(null);
      setError(null);
      
      // Show success message
      const successDiv = document.createElement("div");
      successDiv.className = "success-message";
      successDiv.textContent = editingEmployee 
        ? "Employee updated successfully!" 
        : "Employee added successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(error.message);
    }
  };

  const handleDeleteEmployee = async (id, employeeName) => {
    if (!confirm(`Are you sure you want to delete "${employeeName}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete employee");
      }

      await fetchEmployees();
      setError(null);
      
      // Show success message
      const successDiv = document.createElement("div");
      successDiv.className = "success-message";
      successDiv.textContent = "Employee deleted successfully!";
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
      
    } catch (error) {
      console.error("Error deleting employee:", error);
      setError(error.message);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="page-container">
        <NavigationMinimal user={user} />
        <div className="loading-container">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading employees...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <NavigationMinimal user={user} />
      
      <main className="main-content">
        {/* Header Section */}
        <div className="content-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Employee Management</h1>
              <p className="page-description">
                Manage employee records, salary structures, and personal information
              </p>
            </div>
            
            <div className="header-actions">
              <button
                onClick={downloadTemplate}
                className="btn btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Template
              </button>
              <button
                onClick={handleImportEmployees}
                className="btn btn-secondary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,10 12,5 7,10" />
                  <line x1="12" y1="5" x2="12" y2="15" />
                </svg>
                Import Excel
              </button>
              <button
                onClick={handleAddEmployee}
                className="btn btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add Employee
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tabs-container">
          <button
            onClick={() => setActiveTab("list")}
            className={`tab-button ${activeTab === "list" ? "active" : ""}`}
          >
            Employee List
          </button>
          <button
            onClick={() => setActiveTab("form")}
            className={`tab-button ${activeTab === "form" ? "active" : ""}`}
          >
            {editingEmployee ? "Edit Employee" : "Add Employee"}
          </button>
        </div>

        {/* Stats Cards */}
        {activeTab === "list" && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Employees</div>
              </div>
              <div className="stat-icon bg-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active</div>
              </div>
              <div className="stat-icon bg-green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.inactive}</div>
                <div className="stat-label">Inactive</div>
              </div>
              <div className="stat-icon bg-orange">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                </svg>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.departments}</div>
                <div className="stat-label">Departments</div>
              </div>
              <div className="stat-icon bg-purple">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === "list" ? (
          <EmployeeList
            employees={employees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        ) : (
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setActiveTab("list");
              setEditingEmployee(null);
            }}
          />
        )}
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Employees from Excel</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="modal-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {!showPreview ? (
                <>
                  <div className="import-instructions">
                    <h4>Import Instructions:</h4>
                    <ul>
                      <li>Download the template file using the "Download Template" button</li>
                      <li>Fill in your employee data with the required columns:</li>
                      <ul>
                        <li><strong>SR.NO:</strong> Serial number (optional)</li>
                        <li><strong>Employee Code:</strong> Unique employee code (optional, will be generated if empty)</li>
                        <li><strong>Full Name:</strong> Complete employee name (required)</li>
                      </ul>
                      <li>Save the file and upload it using the form below</li>
                      <li>Supported formats: .xlsx, .xls, .csv</li>
                    </ul>
                  </div>

                  <div className="import-form">
                    <div className="file-input-container">
                      <label htmlFor="employeeFile" className={`file-input-label ${selectedFile ? 'has-file' : ''}`}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="17,10 12,5 7,10" />
                          <line x1="12" y1="5" x2="12" y2="15" />
                        </svg>
                        {selectedFile ? selectedFile.name : 'Choose Excel File'}
                      </label>
                      <input
                        type="file"
                        id="employeeFile"
                        accept=".xlsx,.xls,.csv"
                        className="file-input"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <div className="selected-file-info">
                          <small>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</small>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div className="error-message">
                        {error}
                      </div>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="preview-actions" style={{ marginTop: '20px', padding: '10px', border: '1px solid red' }}>
                      <button
                        type="button"
                        onClick={() => {
                          console.log('Button clicked!');
                          handlePreview();
                        }}
                        className="btn btn-outline"
                        style={{ 
                          background: '#667eea', 
                          color: 'white', 
                          padding: '12px 24px',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          zIndex: 9999,
                          position: 'relative'
                        }}
                      >
                        📋 Preview Data
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="preview-section">
                  <div className="preview-header">
                    <h4>📊 Preview: {selectedFile.name}</h4>
                    <p>Found <strong>{previewData.totalRows} employee records</strong> ready to import</p>
                  </div>
                  
                  <div className="preview-table-container">
                    <table className="preview-table">
                      <thead>
                        <tr>
                          {previewData.headers.map((header, index) => (
                            <th key={index}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.data.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            {previewData.headers.map((header, colIndex) => (
                              <td key={colIndex}>{row[header] || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewData.data.length > 10 && (
                      <p className="preview-note">Showing first 10 rows of {previewData.data.length} total rows</p>
                    )}
                  </div>

                  <div className="preview-actions">
                    <button
                      type="button"
                      onClick={() => setShowPreview(false)}
                      className="btn btn-secondary"
                    >
                      ← Back to Upload
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      className="btn btn-primary"
                      disabled={importing}
                    >
                      {importing ? (
                        <>
                          <div className="spinner"></div>
                          Importing...
                        </>
                      ) : (
                        `✅ Confirm & Save ${previewData.totalRows} Employees`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
