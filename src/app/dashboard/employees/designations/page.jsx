'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar';
import EmployeeNavigation from '../../../../components/employees/EmployeeNavigation';
import { 
  Award, Plus, Edit, Trash, Building, ArrowLeft,
  Search, Save, X, TrendingUp
} from 'lucide-react';

export default function DesignationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department_id: '',
    level: '',
    description: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      setUser(JSON.parse(userData));
      fetchDesignations();
      fetchDepartments();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees/designations');
      const data = await response.json();
      
      if (response.ok) {
        setDesignations(data.designations || []);
      } else {
        setError(data.message || 'Failed to fetch designations');
      }
    } catch (err) {
      setError('Error fetching designations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/employees/departments');
      const data = await response.json();
      
      if (response.ok) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  const handleAddNew = () => {
    setEditingDesignation(null);
    setFormData({ title: '', department_id: '', level: '', description: '' });
    setShowModal(true);
  };

  const handleEdit = (designation) => {
    setEditingDesignation(designation);
    setFormData({
      title: designation.title || '',
      department_id: designation.department_id || '',
      level: designation.level || '',
      description: designation.description || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const url = editingDesignation 
        ? `/api/employees/designations/${editingDesignation.id}`
        : '/api/employees/designations';
      
      const method = editingDesignation ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || `Designation ${editingDesignation ? 'updated' : 'created'} successfully`);
        setShowModal(false);
        fetchDesignations();
      } else {
        setError(data.message || `Failed to ${editingDesignation ? 'update' : 'create'} designation`);
      }
    } catch (err) {
      setError(`Error ${editingDesignation ? 'updating' : 'creating'} designation`);
      console.error(err);
    }
  };

  const handleDelete = async (designationId) => {
    if (!confirm('Are you sure you want to delete this designation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/designations/${designationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Designation deleted successfully');
        fetchDesignations();
      } else {
        setError(data.message || 'Failed to delete designation');
      }
    } catch (err) {
      setError('Error deleting designation');
      console.error(err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDesignation(null);
    setFormData({ title: '', department_id: '', level: '', description: '' });
  };

  const getLevelBadge = (level) => {
    const levelInt = parseInt(level) || 0;
    
    if (levelInt >= 8) return { color: 'bg-purple-100 text-purple-800', label: 'Executive' };
    if (levelInt >= 6) return { color: 'bg-red-100 text-red-800', label: 'Senior' };
    if (levelInt >= 4) return { color: 'bg-yellow-100 text-yellow-800', label: 'Mid-Level' };
    if (levelInt >= 2) return { color: 'bg-blue-100 text-blue-800', label: 'Associate' };
    return { color: 'bg-green-100 text-green-800', label: 'Entry' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <EmployeeNavigation />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold flex items-center">
              <Award className="mr-2" /> Designations
            </h1>
            <p className="text-gray-600">Manage job titles and designations</p>
          </div>
          
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
          >
            <Plus size={16} className="mr-1" /> Add Designation
          </button>
        </div>
        
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Designations Grid */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p>Loading designations...</p>
            </div>
          ) : designations.length === 0 ? (
            <div className="p-8 text-center">
              <Award size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No designations found</p>
              <button
                onClick={handleAddNew}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Your First Designation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {designations.map((designation) => {
                    const levelBadge = getLevelBadge(designation.level);
                    
                    return (
                      <tr key={designation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Award size={20} className="text-purple-600 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {designation.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {designation.department_name ? (
                            <div className="flex items-center">
                              <Building size={16} className="mr-1 text-blue-600" />
                              {designation.department_name}
                            </div>
                          ) : (
                            <span className="text-gray-400">No Department</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelBadge.color}`}>
                            <TrendingUp size={12} className="mr-1" />
                            {levelBadge.label} ({designation.level || 0})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {designation.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {designation.employee_count || 0} employees
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end items-center space-x-2">
                            <button
                              onClick={() => handleEdit(designation)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(designation.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit Designation */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-4">
              {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Software Engineer, Marketing Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seniority Level (1-10)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1 = Entry Level, 10 = Executive Level"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1-2: Entry, 3-4: Associate, 5-6: Mid-Level, 7-8: Senior, 9-10: Executive
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Role description and responsibilities..."
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  <X size={16} className="inline mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Save size={16} className="inline mr-1" />
                  {editingDesignation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
