import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Building2, Mail, Phone, Calendar, User } from 'lucide-react';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      const data = await response.json();

      if (response.ok) {
        setEmployees(data.employees || []);
      } else {
        setError(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Employee Management</h1>
              <p className="text-white/70">Manage your team members and organizational structure</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:bg-white/20 transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 focus:bg-white/20 transition-all duration-200 appearance-none"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Total Employees</p>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Active</p>
                <p className="text-2xl font-bold text-white">{employees.filter(e => e.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Filtered</p>
                <p className="text-2xl font-bold text-white">{filteredEmployees.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 text-red-300">
            {error}
          </div>
        )}

        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white/70 mb-2">No Employees Found</h3>
            <p className="text-white/50">
              {searchTerm || departmentFilter ? 
                'Try adjusting your search or filter criteria.' : 
                'Get started by adding your first employee.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-white/80 font-semibold">Employee</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Department</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Position</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Status</th>
                  <th className="text-left p-4 text-white/80 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr key={employee.id || index} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <div className="flex items-center gap-1 text-white/60 text-sm">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white/80">{employee.department || 'N/A'}</td>
                    <td className="p-4 text-white/80">{employee.designation || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        employee.status === 'active' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {employee.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="w-8 h-8 rounded-full bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors duration-200"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this employee?')) {
                              // Delete logic here
                            }
                          }}
                          className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Placeholder for Add/Edit Modals */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Employee</h2>
            <p className="text-gray-600 mb-4">Employee addition form will be implemented here.</p>
            <button
              onClick={() => setShowAddForm(false)}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Employee</h2>
            <p className="text-gray-600 mb-4">Employee editing form will be implemented here.</p>
            <button
              onClick={() => setEditingEmployee(null)}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
