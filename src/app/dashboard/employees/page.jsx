'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  User,
  Building,
  MapPin,
  Briefcase,
  // DollarSign removed — using rupee symbol in UI
  Star,
  RefreshCw,
  Hash,
  Filter,
  Upload,
  Download,
  FileSpreadsheet
} from 'lucide-react';

// Import components
import Navbar from '../../../components/navigation/Navbar';

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employeesPerPage, setEmployeesPerPage] = useState(10);
  
  // Dynamic stats state
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    departments: 0,
    newHires: 0,
    onLeave: 0,
    totalSalary: 0,
    avgSalary: 0,
    recentHires: 0
  });
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // No sample data - clean slate for real employee data

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadEmployees(1); // Start at page 1
      loadStats(); // Load comprehensive stats
    } else {
      router.push('/');
    }
  }, [router, refreshKey]);
  
  // Reload employees when filters change
  useEffect(() => {
    if (user) {
      loadEmployees(1); // Reset to page 1 when filters change
    }
  }, [searchTerm, departmentFilter, statusFilter, user]);

  // Reload stats when data changes
  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [employees, user]);

  const loadEmployees = async (page = 1) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call to fetch employees
      // For now, return empty data for clean state
      setTimeout(() => {
        setEmployees([]);
        setTotalEmployees(0);
        setTotalPages(1);
        setCurrentPage(1);
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
      setTotalEmployees(0);
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // TODO: Replace with actual API call to fetch employee statistics
      // Clean state with zero values
      setStats({
        total: 0,
        active: 0,
        departments: 0,
        newHires: 0,
        onLeave: 0,
        totalSalary: 0,
        avgSalary: 0,
        recentHires: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Action handlers
  const handleViewEmployee = (employeeId) => {
    if (!employeeId) {
      console.error('Employee ID is undefined');
      return;
    }
    router.push(`/dashboard/employees/${employeeId}`);
  };

  const handleEditEmployee = (employeeId) => {
    if (!employeeId) {
      console.error('Employee ID is undefined');
      return;
    }
    router.push(`/dashboard/employees/${employeeId}/edit`);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!employeeId) {
      console.error('Employee ID is undefined');
      return;
    }
    
    if (confirm(`Are you sure you want to delete this employee?`)) {
      try {
        setIsLoading(true);
        // API call to delete employee would go here
        console.log('Deleting employee:', employeeId);
        // Refresh the employees list
        loadEmployees(currentPage);
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    loadEmployees(currentPage);
    loadStats();
  };

  // Excel import handlers
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel')) {
      setImportFile(file);
    } else {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      event.target.value = '';
    }
  };

  const handleImportEmployees = async () => {
    if (!importFile) {
      alert('Please select a file to import');
      return;
    }

    setIsImporting(true);
    try {
      // TODO: Implement actual Excel parsing and API call
      // For now, simulate the import process
      console.log('Importing employees from file:', importFile.name);
      
      // Simulate API call
      setTimeout(() => {
        setIsImporting(false);
        setShowImportModal(false);
        setImportFile(null);
        alert('Employees imported successfully!');
        refreshData();
      }, 2000);
      
    } catch (error) {
      console.error('Error importing employees:', error);
      alert('Failed to import employees. Please try again.');
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create a sample Excel template for employee import
    const templateData = [
      ['Employee ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Designation', 'Join Date', 'Salary', 'Location', 'Manager', 'Employment Type', 'Status', 'Address', 'Date of Birth', 'Emergency Contact Name', 'Emergency Contact Phone'],
      ['EMP001', 'John', 'Doe', 'john.doe@company.com', '+1-234-567-8900', 'Engineering', 'Software Engineer', '2024-01-15', '75000', 'New York, NY', 'Jane Smith', 'full-time', 'active', '123 Main St', '1990-05-15', 'Jane Doe', '+1-234-567-8901'],
      ['EMP002', 'Jane', 'Smith', 'jane.smith@company.com', '+1-234-567-8902', 'Product', 'Product Manager', '2024-01-20', '95000', 'San Francisco, CA', 'Bob Johnson', 'full-time', 'active', '456 Oak Ave', '1988-08-22', 'John Smith', '+1-234-567-8903']
    ];
    
    // Convert to CSV format for simplicity (can be enhanced to actual Excel)
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employee_import_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatSalary = (salary) => {
    // Format salary using Indian Rupee symbol (₹)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(salary || 0);
  };

  const departments = []; // Will be populated from API call

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />
      
  <div className="max-w-7xl mx-auto p-6 form-scrollable">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h1>
            <p className="text-gray-600">Manage your team and track employee information</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={downloadTemplate}
              className="flex items-center px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </button>
            <button
              onClick={refreshData}
              className="flex items-center px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-white transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
            <Link 
              href="/dashboard/employees/add"
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-lg font-semibold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-lg font-semibold text-gray-900">{stats.departments}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">New Hires</p>
                <p className="text-lg font-semibold text-gray-900">{stats.newHires}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-lg font-semibold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <RefreshCw className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recent</p>
                <p className="text-lg font-semibold text-gray-900">{stats.recentHires}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 font-semibold">₹</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Salary</p>
                <p className="text-lg font-semibold text-gray-900">{formatSalary(stats.avgSalary)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-indigo-600 font-semibold">₹</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Payroll</p>
                <p className="text-lg font-semibold text-gray-900">{formatSalary(stats.totalSalary)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, designation, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none min-w-[150px]"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm appearance-none min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {employees.length} of {totalEmployees} employees
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={employeesPerPage}
                onChange={(e) => setEmployeesPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white/70 backdrop-blur-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading employees...</span>
            </div>
          ) : employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/70 backdrop-blur-sm border-b border-gray-200">
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4" />
                        <span>Employee</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Role & Department</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>Contact</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Employment</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 inline-block">₹</span>
                        <span>Compensation</span>
                      </div>
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-gray-900">Status</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.employee_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{employee.designation}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building className="w-4 h-4 mr-1" />
                            {employee.department}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {employee.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {employee.phone}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(employee.join_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {employee.location}
                          </div>
                          {employee.employment_type && (
                            <div className="text-xs text-gray-500 capitalize">
                              {employee.employment_type.replace('-', ' ')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">
                            {formatSalary(employee.salary)}
                          </div>
                          {employee.manager && (
                            <div className="text-sm text-gray-500">
                              Reports to: {employee.manager}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(employee.status)}`}>
                          {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1).replace('-', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewEmployee(employee.id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee.id)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Employee"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || departmentFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first employee'
                }
              </p>
              {!searchTerm && departmentFilter === 'all' && statusFilter === 'all' && (
                <Link 
                  href="/dashboard/employees/add"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Employee
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages} ({totalEmployees} total employees)
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadEmployees(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => loadEmployees(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }).slice(0, Math.min(5, totalPages))}
                
                <button
                  onClick={() => loadEmployees(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Excel Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-green-600" />
              Import Employees from Excel
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: .xlsx, .xls
                </p>
              </div>
              
              {importFile && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected file:</strong> {importFile.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Size: {(importFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Important:</strong>
                </p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Download the template first to see the required format</li>
                  <li>• Make sure all required fields are filled</li>
                  <li>• Employee IDs should be unique</li>
                  <li>• Dates should be in YYYY-MM-DD format</li>
                </ul>
              </div>
              
              <div className="flex justify-between space-x-3">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center px-4 py-2 text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportEmployees}
                    disabled={!importFile || isImporting}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
