'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/navigation/Navigation';
import './users.css';

export default function UserMasterPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('convert');
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [converting, setConverting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    phone: '',
    is_active: true
  });

  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch employees and users in parallel
      const [employeesResponse, usersResponse] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/users')
      ]);

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'user',
      department: '',
      phone: '',
      is_active: true
    });
    setEditingUser(null);
    setShowAddModal(true);
  };

  const handleEditUser = (userItem) => {
    setNewUser({
      name: userItem.name,
      email: userItem.email,
      password: '',
      role: userItem.role,
      department: userItem.department,
      phone: userItem.phone || '',
      is_active: userItem.is_active
    });
    setEditingUser(userItem);
    setShowAddModal(true);
  };

  const handleSaveUser = async () => {
    try {
      if (!newUser.name || !newUser.email) {
        alert('Please fill in all required fields');
        return;
      }

      const method = editingUser ? 'PATCH' : 'POST';
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        fetchData();
        setShowAddModal(false);
        setEditingUser(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Error saving user');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  const handleImportEmployees = () => {
    setShowImportModal(true);
    setSelectedFile(null);
    setPreviewData(null);
    setShowPreview(false);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setShowPreview(false);
  };

  const handlePreviewFile = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('preview', 'true');

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setPreviewData(result.preview || []);
        setShowPreview(true);
      } else {
        alert(result.error || 'Error previewing file');
      }
    } catch (error) {
      console.error('Error previewing file:', error);
      alert('Error previewing file');
    } finally {
      setImporting(false);
    }
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/employees/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Successfully imported ${result.imported || 0} employees!`);
        setShowImportModal(false);
        setSelectedFile(null);
        setPreviewData(null);
        setShowPreview(false);
        fetchData(); // Refresh the data
      } else {
        alert(result.error || 'Error importing file');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Error importing file');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create a link to download the employee template
    const link = document.createElement('a');
    link.href = '/api/employees/template';
    link.download = 'employee_import_template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get employees who are not yet users
  const getAvailableEmployees = () => {
    const userEmails = users.map(user => user.email.toLowerCase());
    return employees.filter(emp => 
      emp.email && !userEmails.includes(emp.email.toLowerCase())
    );
  };

  // Get employees who are already users
  const getEmployeesWithAccounts = () => {
    const userEmailMap = {};
    users.forEach(user => {
      userEmailMap[user.email.toLowerCase()] = user;
    });

    return employees
      .filter(emp => emp.email && userEmailMap[emp.email.toLowerCase()])
      .map(emp => ({
        ...emp,
        userAccount: userEmailMap[emp.email.toLowerCase()]
      }));
  };

  const handleEmployeeSelect = (employeeId, isSelected) => {
    if (isSelected) {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
    }
  };

  const handleSelectAll = (isSelected) => {
    if (isSelected) {
      const availableEmployees = getFilteredAvailableEmployees();
      setSelectedEmployees(availableEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };

  // Function to generate secure random password
  const generateRandomPassword = (length = 12) => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const downloadCredentials = () => {
    let credentialsText = `User Account Credentials - Generated on ${new Date().toLocaleString()}\n\n`;
    credentialsText += "=" * 60 + "\n";
    credentialsText += "IMPORTANT: Please save these credentials securely!\n";
    credentialsText += "Users should change their passwords on first login.\n";
    credentialsText += "=" * 60 + "\n\n";
    
    generatedCredentials.forEach((cred, index) => {
      credentialsText += `${index + 1}. ${cred.name}\n`;
      credentialsText += `   Email: ${cred.email}\n`;
      credentialsText += `   Password: ${cred.password}\n`;
      credentialsText += `   Role: ${cred.role}\n`;
      credentialsText += `   Status: Active\n\n`;
    });
    
    credentialsText += "=" * 60 + "\n";
    credentialsText += "Note: These credentials are for CRM system access.\n";
    credentialsText += "For security, this file should be stored securely and deleted after distribution.\n";
    
    const blob = new Blob([credentialsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_credentials_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const convertToUsers = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee to convert');
      return;
    }

    try {
      setConverting(true);
      
      const selectedEmpData = employees.filter(emp => 
        selectedEmployees.includes(emp.id)
      );

      // Generate random passwords for each employee
      const employeeCredentials = [];

      const userPromises = selectedEmpData.map(emp => {
        const randomPassword = generateRandomPassword(12);
        
        // Store credentials for later display
        employeeCredentials.push({
          name: `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          password: randomPassword,
          role: emp.role || 'user'
        });

        return fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            password: randomPassword,
            role: emp.role || 'user',
            department: emp.department,
            phone: emp.mobile || emp.phone,
            is_active: emp.employeeStatus === 'Working',
            employee_id: emp.id
          })
        });
      });

      const responses = await Promise.all(userPromises);
      const results = await Promise.all(
        responses.map(response => response.json())
      );

      const successful = results.filter(result => !result.error).length;
      const failed = results.length - successful;

      if (successful > 0) {
        // Store successful credentials to show in modal
        const successfulCredentials = employeeCredentials.slice(0, successful);
        setGeneratedCredentials(successfulCredentials);
        setShowCredentialsModal(true);
        
        setSelectedEmployees([]);
        fetchData(); // Refresh data
      }

      if (failed > 0) {
        const errors = results.filter(result => result.error);
        console.error('Conversion errors:', errors);
        alert(`${failed} conversions failed. Check console for details.`);
      }

    } catch (error) {
      console.error('Error converting employees to users:', error);
      alert('Error converting employees to users');
    } finally {
      setConverting(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !currentStatus
        })
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        alert('Error updating user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const resetUserPassword = async (userId, employeeData) => {
    if (!confirm(`Reset password for ${employeeData.firstName} ${employeeData.lastName}?`)) {
      return;
    }

    try {
      const newPassword = employeeData.emailPassword || 'temp123';
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      });

      if (response.ok) {
        alert(`Password reset successfully for ${employeeData.firstName} ${employeeData.lastName}`);
      } else {
        alert('Error resetting password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Error resetting password');
    }
  };

  const getFilteredAvailableEmployees = () => {
    let filtered = getAvailableEmployees();

    if (searchTerm) {
      filtered = filtered.filter(emp => 
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(emp => emp.department === departmentFilter);
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(emp => emp.employeeStatus === statusFilter);
    }

    return filtered;
  };

  const getFilteredUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (departmentFilter !== 'All') {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    return filtered;
  };

  const getDepartments = () => {
    const departments = [...new Set(employees.map(emp => emp.department).filter(Boolean))];
    return departments.sort();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'convert':
        return renderConvertTab();
      case 'users':
        return renderUsersTab();
      case 'import':
        return renderImportTab();
      case 'roles':
        return renderRolesTab();
      default:
        return renderConvertTab();
    }
  };

  const renderConvertTab = () => (
    <div className="tab-content">
      {/* Bulk Actions */}
      {getFilteredAvailableEmployees().length > 0 && (
        <div className="bulk-actions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={selectedEmployees.length === getFilteredAvailableEmployees().length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Select All ({getFilteredAvailableEmployees().length})
          </label>
          
          {selectedEmployees.length > 0 && (
            <button
              className="btn-primary"
              onClick={convertToUsers}
              disabled={converting}
            >
              {converting ? 'Converting...' : `Convert ${selectedEmployees.length} to Users`}
            </button>
          )}
        </div>
      )}

      {/* Master Grid */}
      <div className="master-grid">
        {getFilteredAvailableEmployees().length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3>No employees available for conversion</h3>
            <p>All employees with email addresses already have user accounts</p>
          </div>
        ) : (
          getFilteredAvailableEmployees().map(employee => (
            <div key={employee.id} className="master-card">
              <div className="card-header">
                <div className="card-selection">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.includes(employee.id)}
                    onChange={(e) => handleEmployeeSelect(employee.id, e.target.checked)}
                  />
                </div>
                <div className="card-info">
                  <h3 className="card-title">{employee.firstName} {employee.lastName}</h3>
                  <p className="card-subtitle">{employee.email}</p>
                </div>
                <div className="card-status">
                  <span className={`status-indicator ${employee.employeeStatus.toLowerCase().replace(' ', '-')}`}></span>
                  <span className="status-text">{employee.employeeStatus}</span>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Username:</span>
                  <span className="detail-value">{employee.username}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{employee.department || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{employee.role || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{employee.mobile || employee.phone || 'Not specified'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="tab-content">
      <div className="master-grid">
        {getFilteredUsers().length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3>No user accounts found</h3>
            <p>Add users or convert employees to user accounts</p>
          </div>
        ) : (
          getFilteredUsers().map(user => (
            <div key={user.id} className="master-card">
              <div className="card-header">
                <div className="card-info">
                  <h3 className="card-title">{user.name}</h3>
                  <p className="card-subtitle">{user.email}</p>
                </div>
                <div className="card-status">
                  <span className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}></span>
                  <span className="status-text">{user.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Role:</span>
                  <span className="detail-value">{user.role}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{user.department || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{user.phone || 'Not specified'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="action-btn edit"
                  onClick={() => handleEditUser(user)}
                  title="Edit User"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  className={`action-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                  onClick={() => toggleUserStatus(user.id, user.is_active)}
                  title={user.is_active ? 'Deactivate User' : 'Activate User'}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {user.is_active ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                  </svg>
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  title="Delete User"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderImportTab = () => (
    <div className="tab-content">
      <div className="import-section">
        <div className="import-header">
          <div className="import-info">
            <h3>Import Employee Data</h3>
            <p>Upload an Excel file to bulk import employee records</p>
          </div>
          <button className="btn-secondary" onClick={downloadTemplate}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Download Template
          </button>
        </div>

        <div className="import-steps">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Download Template</h4>
              <p>Download the Excel template with required column headers</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Fill Employee Data</h4>
              <p>Add employee information following the template structure</p>
            </div>
          </div>
          
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Upload & Import</h4>
              <p>Upload the filled Excel file and preview before importing</p>
            </div>
          </div>
        </div>

        <div className="file-upload-section">
          <div className="upload-area">
            <input
              type="file"
              id="employee-file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="employee-file" className="upload-label">
              <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span>Click to select Excel file or drag and drop</span>
              <small>Supports .xlsx and .xls files</small>
            </label>
          </div>

          {selectedFile && (
            <div className="file-info">
              <div className="file-details">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{selectedFile.name}</span>
                <span className="file-size">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
              <div className="file-actions">
                <button className="btn-secondary" onClick={handlePreviewFile} disabled={importing}>
                  {importing ? 'Loading...' : 'Preview'}
                </button>
                <button className="btn-primary" onClick={handleImportConfirm} disabled={importing}>
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          )}
        </div>

        {showPreview && previewData && (
          <div className="preview-section">
            <h4>Preview Data ({previewData.length} rows)</h4>
            <div className="preview-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee Code</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      <td>{row.username || '-'}</td>
                      <td>{row.fullName || '-'}</td>
                      <td>{row.email || '-'}</td>
                      <td>{row.department || '-'}</td>
                      <td>{row.role || '-'}</td>
                      <td>{row.mobile || row.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewData.length > 5 && (
                <p className="preview-note">Showing first 5 rows of {previewData.length} total rows</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderRolesTab = () => {
    const roleStats = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const roles = Object.entries(roleStats).map(([role, count]) => ({
      name: role,
      count,
      active: users.filter(u => u.role === role && u.is_active).length
    }));

    return (
      <div className="tab-content">
        <div className="master-grid">
          {roles.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3>No roles defined</h3>
              <p>Add users to see role statistics</p>
            </div>
          ) : (
            roles.map(role => (
              <div key={role.name} className="master-card">
                <div className="card-header">
                  <div className="card-info">
                    <h3 className="card-title">{role.name.charAt(0).toUpperCase() + role.name.slice(1)}</h3>
                    <p className="card-subtitle">{role.count} total users</p>
                  </div>
                  <div className="role-stats">
                    <span className="stat-number">{role.active}</span>
                    <span className="stat-label">Active</span>
                  </div>
                </div>
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-label">Total Users:</span>
                    <span className="detail-value">{role.count}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Active Users:</span>
                    <span className="detail-value">{role.active}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Inactive Users:</span>
                    <span className="detail-value">{role.count - role.active}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    {
      key: 'convert',
      label: 'Convert Employees',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
      count: getAvailableEmployees().length
    },
    {
      key: 'users',
      label: 'Manage Users',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      count: users.length
    },
    {
      key: 'import',
      label: 'Import Employees',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
      count: employees.length
    },
    {
      key: 'roles',
      label: 'User Roles',
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      count: [...new Set(users.map(u => u.role))].length
    }
  ];

  if (!user) return null;

  if (loading) {
    return (
      <div className="user-master-page">
        <Navigation user={user} />
        <main className="user-master-main">
          <div className="user-master-container">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading user data...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="user-master-page">
      <Navigation user={user} />
      
      <main className="user-master-main">
        <div className="user-master-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>User Management Master</h1>
                <p>Convert employees to user accounts and manage system access</p>
              </div>
              <div className="header-actions">
                <button 
                  className="btn-primary"
                  onClick={handleAddUser}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New User
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                  <span className="tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          {(activeTab === 'convert' || activeTab === 'users') && (
            <div className="filters-section">
              <div className="search-box">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Departments</option>
                {getDepartments().map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {activeTab === 'convert' && (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="All">All Status</option>
                  <option value="Working">Working</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              )}
            </div>
          )}

          {/* Content */}
          <div className="content-section">
            {renderTabContent()}
          </div>
        </div>
      </main>

      {/* Add/Edit User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label>Password {editingUser ? '' : '*'}</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                  />
                  Active User
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSaveUser}>
                {editingUser ? 'Update User' : 'Add User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal */}
      {showCredentialsModal && (
        <div className="modal-overlay">
          <div className="modal-content credentials-modal">
            <div className="modal-header">
              <h3>🔐 User Account Credentials Generated</h3>
              <button className="modal-close" onClick={() => setShowCredentialsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="credentials-warning">
                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <strong>Important Security Notice:</strong>
                  <p>These credentials have been generated with secure random passwords. Please save them immediately and distribute them securely to the respective users.</p>
                </div>
              </div>

              <div className="credentials-list">
                <h4>Generated User Accounts ({generatedCredentials.length})</h4>
                <div className="credentials-table">
                  <div className="credentials-header">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Password</span>
                    <span>Role</span>
                  </div>
                  {generatedCredentials.map((cred, index) => (
                    <div key={index} className="credentials-row">
                      <span className="user-name">{cred.name}</span>
                      <span className="user-email">{cred.email}</span>
                      <span className="user-password">
                        <code>{cred.password}</code>
                        <button 
                          className="copy-btn"
                          onClick={() => navigator.clipboard.writeText(cred.password)}
                          title="Copy password"
                        >
                          📋
                        </button>
                      </span>
                      <span className="user-role">{cred.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="credentials-instructions">
                <h4>Next Steps:</h4>
                <ol>
                  <li>Download the credentials file for secure storage</li>
                  <li>Distribute credentials to users through secure channels</li>
                  <li>Instruct users to change passwords on first login</li>
                  <li>Delete this credentials file after distribution</li>
                </ol>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCredentialsModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={downloadCredentials}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
