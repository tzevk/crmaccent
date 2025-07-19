'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  Building, Briefcase, Edit, Trash, FileText, 
  GraduationCap, Award, Download, Users
} from 'lucide-react';

export default function ViewEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params?.id;
  
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Delete confirmation
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    employeeName: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      setUser(JSON.parse(userData));
      if (employeeId) {
        fetchEmployee();
      }
    } else {
      router.push('/');
    }
  }, [router, employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();
      
      if (response.ok) {
        setEmployee(data.employee);
      } else {
        setError(data.message || 'Employee not found');
      }
    } catch (err) {
      setError('Error fetching employee details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (employee) {
      setDeleteConfirmation({
        show: true,
        employeeName: `${employee.first_name} ${employee.last_name}`
      });
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message || 'Employee deleted successfully');
        setTimeout(() => {
          router.push('/dashboard/employees');
        }, 2000);
      } else {
        setError(data.message || 'Failed to delete employee');
      }
    } catch (err) {
      setError('Error deleting employee');
      console.error(err);
    } finally {
      setDeleteConfirmation({ show: false, employeeName: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, employeeName: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <span className="ml-4">Loading employee details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <Link 
              href="/dashboard/employees"
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              <ArrowLeft size={16} className="inline mr-2" />
              Back to Employees
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <Link 
                href="/dashboard/employees"
                className="text-gray-600 hover:text-gray-800 mr-4"
              >
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-2xl font-bold">
                {employee ? `${employee.first_name} ${employee.last_name}` : 'Employee Details'}
              </h1>
            </div>
            <p className="text-gray-600">Employee Information</p>
          </div>
          
          {employee && (
            <div className="flex gap-3">
              <Link 
                href={`/dashboard/employees/${employeeId}/edit`}
                className="bg-yellow-600 text-white px-4 py-2 rounded flex items-center hover:bg-yellow-700"
              >
                <Edit size={16} className="mr-1" /> Edit
              </Link>
              
              <button
                onClick={handleDeleteClick}
                className="bg-red-600 text-white px-4 py-2 rounded flex items-center hover:bg-red-700"
              >
                <Trash size={16} className="mr-1" /> Delete
              </button>
            </div>
          )}
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

        {employee && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  Personal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employee ID</label>
                    <p className="text-gray-900 font-mono">{employee.employee_id || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{employee.first_name} {employee.last_name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail size={16} className="mr-2" />
                      <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                        {employee.email}
                      </a>
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone size={16} className="mr-2" />
                      {employee.phone ? (
                        <a href={`tel:${employee.phone}`} className="text-blue-600 hover:underline">
                          {employee.phone}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{employee.gender ? employee.gender.charAt(0).toUpperCase() + employee.gender.slice(1) : 'N/A'}</p>
                  </div>
                </div>
                
                {employee.address && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900 flex items-start">
                      <MapPin size={16} className="mr-2 mt-1" />
                      <span>
                        {employee.address}
                        {employee.city && `, ${employee.city}`}
                        {employee.state && `, ${employee.state}`}
                        {employee.postal_code && ` - ${employee.postal_code}`}
                        {employee.country && `, ${employee.country}`}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Employment Information */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <Briefcase className="mr-2" size={20} />
                  Employment Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-gray-900 flex items-center">
                      <Building size={16} className="mr-2" />
                      {employee.department || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Designation</label>
                    <p className="text-gray-900 flex items-center">
                      <Award size={16} className="mr-2" />
                      {employee.designation || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Join Date</label>
                    <p className="text-gray-900 flex items-center">
                      <Calendar size={16} className="mr-2" />
                      {employee.join_date ? new Date(employee.join_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employment Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      employee.employment_status === 'active' ? 'bg-green-100 text-green-800' :
                      employee.employment_status === 'on_leave' ? 'bg-yellow-100 text-yellow-800' :
                      employee.employment_status === 'terminated' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.employment_status === 'active' ? 'Active' :
                       employee.employment_status === 'on_leave' ? 'On Leave' :
                       employee.employment_status === 'terminated' ? 'Terminated' :
                       employee.employment_status === 'resigned' ? 'Resigned' : 'Unknown'}
                    </span>
                  </div>
                  
                  {employee.reporting_manager_name && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reporting Manager</label>
                      <p className="text-gray-900 flex items-center">
                        <Users size={16} className="mr-2" />
                        {employee.reporting_manager_name}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Education */}
              {employee.education && employee.education.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <GraduationCap className="mr-2" size={20} />
                    Education
                  </h2>
                  
                  <div className="space-y-4">
                    {employee.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.start_year} - {edu.end_year || 'Present'}
                        </p>
                        {edu.description && (
                          <p className="text-sm text-gray-700 mt-1">{edu.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {employee.experience && employee.experience.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <Briefcase className="mr-2" size={20} />
                    Work Experience
                  </h2>
                  
                  <div className="space-y-4">
                    {employee.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <div className="mb-4">
                  {employee.profile_image ? (
                    <img 
                      src={employee.profile_image} 
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-4xl font-bold mx-auto">
                      {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold">{employee.first_name} {employee.last_name}</h3>
                <p className="text-gray-600">{employee.designation || 'Employee'}</p>
                <p className="text-sm text-gray-500">{employee.department || 'No Department'}</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href={`/dashboard/employees/${employeeId}/edit`}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-blue-700"
                  >
                    <Edit size={16} className="mr-2" />
                    Edit Employee
                  </Link>
                  
                  {employee.linked_user_id && (
                    <Link 
                      href={`/dashboard/users/${employee.linked_user_id}`}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-green-700"
                    >
                      <User size={16} className="mr-2" />
                      View User Account
                    </Link>
                  )}
                  
                  <button
                    onClick={() => window.print()}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded flex items-center justify-center hover:bg-gray-700"
                  >
                    <Download size={16} className="mr-2" />
                    Print Profile
                  </button>
                </div>
              </div>

              {/* Documents */}
              {employee.documents && employee.documents.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="mr-2" size={20} />
                    Documents
                  </h3>
                  
                  <div className="space-y-2">
                    {employee.documents.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm">{doc.document_name}</span>
                        <a 
                          href={doc.file_path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Information</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-500">Created:</span>
                    <p className="text-gray-900">{new Date(employee.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-500">Last Updated:</span>
                    <p className="text-gray-900">{new Date(employee.updated_at).toLocaleDateString()}</p>
                  </div>
                  {employee.created_by_name && (
                    <div>
                      <span className="font-medium text-gray-500">Created By:</span>
                      <p className="text-gray-900">{employee.created_by_name}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-2">Confirm Deletion</h3>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete employee <span className="font-semibold">{deleteConfirmation.employeeName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
