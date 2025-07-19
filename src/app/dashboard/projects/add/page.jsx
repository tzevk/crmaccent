'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import projectsAPI from '../../../../utils/projectsAPI.js';
import { Briefcase, ArrowLeft, Plus, FileText, ClipboardList, Calendar, Users, Tag, Trash } from 'lucide-react';

export default function AddProject() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]); // Will hold companies data
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  
  // New states for enhanced team assignment
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'team_member',
    department: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    project_number: '',
    type: 'PROPOSAL',
    client_id: '',
    contact_phone: '', // Added for Indian phone number
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    value: '', // Will be stored as decimal
    description: '',
    status: 'planning',
    assigned_to: [],
    role_assignments: {}, // Map of userId to role
    has_quotation: false,
    quotation_number: '',
    quotation_date: '',
    quotation_amount: '', // Added amount field
    has_po: false,
    po_number: '',
    po_date: '',
    po_amount: '', // Added amount field
    has_invoice: false,
    invoice_number: '',
    invoice_date: '',
    invoice_amount: '', // Added amount field
    client_name: '', // For document client name
    custom_containers: [], // For custom containers
    activities: [{ title: '', description: '', assigned_to: '', due_date: '', status: 'pending' }]
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('basic');
  const [lastSavedTime, setLastSavedTime] = useState(null);

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchClients();
      fetchEmployees(); // Add fetch for employees
      generateProjectNumber();
      
      // Load previously saved form data if it exists
      const savedFormData = localStorage.getItem('projectFormData');
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          setFormData(prevData => ({...prevData, ...parsedData}));
          setLastSavedTime(new Date());
        } catch (error) {
          console.error('Failed to parse saved form data:', error);
        }
      }
    } else {
      router.push('/');
    }
    
    // Add event listener for page unload to save data
    window.addEventListener('beforeunload', saveFormData);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('beforeunload', saveFormData);
    };
  }, [router]);

  // Function to save form data to localStorage
  const saveFormData = () => {
    localStorage.setItem('projectFormData', JSON.stringify(formData));
    setLastSavedTime(new Date());
  };
  
  // Auto-save form data periodically (every 30 seconds)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveFormData();
    }, 30000); // 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  const generateProjectNumber = async () => {
    try {
      // Fetch the project number from the API
      const response = await fetch('/api/projects/generate-number');
      if (!response.ok) {
        throw new Error('Failed to get project number');
      }
      
      const data = await response.json();
      const generatedNumber = data.project_number;
      
      setProjectNumber(generatedNumber);
      setFormData(prev => ({
        ...prev,
        project_number: generatedNumber
      }));
    } catch (error) {
      console.error('Failed to generate project number:', error);
      // Fallback to client-side generation if API fails
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const baseNumber = 519;
      const fallbackNumber = `${baseNumber}-${month}-${year}-001`;
      
      setProjectNumber(fallbackNumber);
      setFormData(prev => ({
        ...prev,
        project_number: fallbackNumber
      }));
    }
  };

  // Function to fetch employees with error handling
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // First try to fetch departments for filtering
      try {
        const deptResponse = await fetch('/api/departments');
        if (deptResponse.ok) {
          const deptData = await deptResponse.json();
          setDepartments(deptData.departments || []);
        }
      } catch (deptError) {
        console.log('Departments not yet available:', deptError);
        // We'll handle this gracefully with a try/catch when accessing departments
      }

      // Now fetch employees
      const response = await fetch('/api/employees');
      if (!response.ok) {
        if (response.status === 500) {
          // If 500 error, the employee tables might not exist yet
          console.warn('Employees API returned 500, tables might need initialization');
          // Try to get users as fallback
          await fetchUsers();
        }
        throw new Error(`Failed to fetch employees: ${response.status}`);
      }
      const data = await response.json();
      setEmployees(data.employees || []);
      
      // For backward compatibility, if we have employees but no users
      if (data.employees?.length > 0) {
        // Convert employees to user format for backward compatibility
        const employeesToUsers = data.employees.map(emp => ({
          id: `emp-${emp.id}`, // Prefix with emp- to distinguish from users
          name: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          department: emp.department,
          designation: emp.designation,
          isEmployee: true,
          employeeId: emp.id
        }));
        
        setUsers(prev => {
          // Combine with existing users, preferring employees
          const existingUserEmails = new Set(employeesToUsers.map(e => e.email));
          const filteredUsers = prev?.filter(u => !existingUserEmails.has(u.email)) || [];
          return [...employeesToUsers, ...filteredUsers];
        });
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      // Don't show error to user as this is not critical
      // We'll continue with empty employees list and fetch users instead as fallback
      setEmployees([]);
      // Attempt to fetch users as fallback
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch users as fallback for backward compatibility
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      
      // Format users for team assignment
      const formattedUsers = (data.users || []).map(user => ({
        id: user.id,
        name: user.name || user.username,
        email: user.email,
        department: user.department,
        isUser: true // Mark as user (not employee)
      }));
      
      setUsers(prev => [...(prev || []), ...formattedUsers]);
    } catch (error) {
      console.error('Failed to fetch users as fallback:', error);
      setUsers([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/companies');
      const data = await response.json();
      setClients(data.companies || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle the project number specifically to append the project name
    if (name === 'name' && formData.project_number) {
      // Extract sequence number (e.g., from 519-07-2025-001)
      const parts = formData.project_number.split('-');
      const sequencePart = parts.length >= 4 ? `-${parts[3]}` : '';
      
      // Get base number and date parts (519-07-2025)
      const baseProjectNumber = parts.slice(0, 3).join('-');
      
      // Add project name at the end
      const slug = value.trim().replace(/\s+/g, '-').toLowerCase();
      const newProjectNumber = `${baseProjectNumber}${sequencePart}-${slug}`;
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        project_number: newProjectNumber
      }));
      return;
    }
    
    // Format Indian phone number
    if (name === 'contact_phone') {
      // Format as +91 XXXXX XXXXX
      let formattedPhone = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedPhone.length > 0) {
        if (formattedPhone.length <= 5) {
          formattedPhone = `+91 ${formattedPhone}`;
        } else {
          formattedPhone = `+91 ${formattedPhone.substring(0, 5)} ${formattedPhone.substring(5, 10)}`;
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedPhone
      }));
      return;
    }
    
    // Handle decimal values for amounts
    if (name === 'value' || name.includes('amount')) {
      // Allow decimal values
      const regex = /^\d*\.?\d*$/;
      if (value === '' || regex.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-save on important field changes
    if (['name', 'client_id', 'type', 'status'].includes(name)) {
      setTimeout(saveFormData, 500);
    }
  };

  const handleUserSelect = (userId, isChecked) => {
    setFormData(prev => {
      if (isChecked) {
        return {
          ...prev,
          assigned_to: [...prev.assigned_to.filter(id => id !== userId), userId],
          role_assignments: {
            ...prev.role_assignments,
            [userId]: prev.role_assignments[userId] || 'team_member'
          }
        };
      } else {
        // Remove user from assignments
        const updatedRoleAssignments = {...prev.role_assignments};
        delete updatedRoleAssignments[userId];
        
        return {
          ...prev,
          assigned_to: prev.assigned_to.filter(id => id !== userId),
          role_assignments: updatedRoleAssignments
        };
      }
    });
  };
  
  const handleRoleChange = (userId, role) => {
    setFormData(prev => ({
      ...prev,
      role_assignments: {
        ...prev.role_assignments,
        [userId]: role
      }
    }));
  };

  // New function to handle adding a new user directly
  const handleAddNewUser = () => {
    // Simple validation
    if (!newUser.name || !newUser.email) {
      setError('User name and email are required');
      return;
    }

    // Generate a temporary ID for the new user
    // In a real application, this would come from the backend after saving to the database
    const tempId = `temp-${Date.now()}`;
    
    // Create a new user object
    const userToAdd = {
      id: tempId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      isTemporary: true
    };
    
    // Add to users list
    setUsers(prev => [...prev, userToAdd]);
    
    // Auto-select the newly added user
    handleUserSelect(tempId, true);
    
    // Reset the form
    setNewUser({ name: '', email: '', role: 'team_member', department: '' });
    setShowAddUserForm(false);
    setSuccess('User added to the project team');
    
    // In a real application, you might want to save this user to the database
    // and get a proper ID back
  };
  
  // Computed filtered users for team assignment
  const filteredUsers = users.filter(user => {
    const searchTerm = userSearch.toLowerCase();
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.department?.toLowerCase().includes(searchTerm);
    
    const matchesDepartment = !selectedDepartment || user.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  // Available departments for filtering
  const availableDepartments = [
    ...new Set([
      ...departments.map(d => d.name || d),
      ...users.map(u => u.department).filter(Boolean)
    ])
  ].sort();

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const activities = [...prev.activities];
      activities[index] = {
        ...activities[index],
        [name]: value
      };
      return {
        ...prev,
        activities
      };
    });
  };

  const addActivity = () => {
    setFormData(prev => ({
      ...prev,
      activities: [
        ...prev.activities,
        { title: '', description: '', assigned_to: '', due_date: '', status: 'pending' }
      ]
    }));
  };

  const removeActivity = (index) => {
    setFormData(prev => {
      const activities = [...prev.activities];
      activities.splice(index, 1);
      return {
        ...prev,
        activities
      };
    });
  };

  const addCustomContainer = () => {
    setFormData(prev => ({
      ...prev,
      custom_containers: [
        ...prev.custom_containers,
        { title: 'Custom Section', fields: [] }
      ]
    }));
  };

  const updateCustomContainer = (index, updatedContainer) => {
    setFormData(prev => {
      const containers = [...prev.custom_containers];
      containers[index] = updatedContainer;
      return {
        ...prev,
        custom_containers: containers
      };
    });
  };

  const removeCustomContainer = (index) => {
    setFormData(prev => {
      const containers = [...prev.custom_containers];
      containers.splice(index, 1);
      return {
        ...prev,
        custom_containers: containers
      };
    });
  };

  const addFieldToContainer = (containerIndex, field) => {
    setFormData(prev => {
      const containers = [...prev.custom_containers];
      containers[containerIndex] = {
        ...containers[containerIndex],
        fields: [
          ...containers[containerIndex].fields,
          field
        ]
      };
      return {
        ...prev,
        custom_containers: containers
      };
    });
  };

  const updateCustomContainerField = (containerIndex, fieldIndex, newValue) => {
    setFormData(prev => {
      const containers = [...prev.custom_containers];
      const fields = [...containers[containerIndex].fields];
      fields[fieldIndex] = newValue;
      containers[containerIndex] = {
        ...containers[containerIndex],
        fields: fields
      };
      return {
        ...prev,
        custom_containers: containers
      };
    });
  };

  const removeCustomContainerField = (containerIndex, fieldIndex) => {
    setFormData(prev => {
      const containers = [...prev.custom_containers];
      const fields = [...containers[containerIndex].fields];
      fields.splice(fieldIndex, 1);
      containers[containerIndex] = {
        ...containers[containerIndex],
        fields: fields
      };
      return {
        ...prev,
        custom_containers: containers
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Ensure we have a valid project number
      if (!formData.project_number) {
        await generateProjectNumber();
      }
      
      // Format the data for API
      const projectData = {
        ...formData,
        // Ensure project number is included and properly formatted
        project_number: formData.project_number,
        // Ensure decimal values are properly formatted
        value: formData.value ? parseFloat(formData.value) : null,
        quotation_amount: formData.quotation_amount ? parseFloat(formData.quotation_amount) : null,
        po_amount: formData.po_amount ? parseFloat(formData.po_amount) : null,
        invoice_amount: formData.invoice_amount ? parseFloat(formData.invoice_amount) : null,
        // Convert custom containers to JSON string for storage
        custom_containers: JSON.stringify(formData.custom_containers || [])
      };
      
      const response = await projectsAPI.create(projectData);
      
      if (response.id) {
        setSuccess('Project created successfully!');
        
        // Clear the saved form data from localStorage
        localStorage.removeItem('projectFormData');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/dashboard/projects/${response.id}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // New handlers for employee selection
  const handleEmployeeSelect = (employeeId, isChecked) => {
    setFormData(prev => {
      if (isChecked) {
        // Find employee details
        const employee = employees.find(emp => emp.id === employeeId);
        
        return {
          ...prev,
          assigned_to: [...prev.assigned_to.filter(id => id !== `emp-${employeeId}`), `emp-${employeeId}`],
          role_assignments: {
            ...prev.role_assignments,
            [`emp-${employeeId}`]: prev.role_assignments[`emp-${employeeId}`] || 'team_member'
          }
        };
      } else {
        // Remove employee from assignments
        const employeeKey = `emp-${employeeId}`;
        const updatedRoleAssignments = {...prev.role_assignments};
        delete updatedRoleAssignments[employeeKey];
        
        return {
          ...prev,
          assigned_to: prev.assigned_to.filter(id => id !== employeeKey),
          role_assignments: updatedRoleAssignments
        };
      }
    });
  };

  const handleEmployeeRoleChange = (employeeId, role) => {
    const employeeKey = `emp-${employeeId}`;
    setFormData(prev => ({
      ...prev,
      role_assignments: {
        ...prev.role_assignments,
        [employeeKey]: role
      }
    }));
  };

  // Filter employees based on search and department
  const filteredEmployees = employees?.filter(employee => {
    const matchesSearch = !employeeSearch || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.email?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.department?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.designation?.toLowerCase().includes(employeeSearch.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  }) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Briefcase className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          </div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Last Saved Indicator */}
        {lastSavedTime && (
          <div className="mb-4 flex items-center justify-end">
            <p className="text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Last saved: {lastSavedTime.toLocaleTimeString()}
            </p>
            <button 
              type="button"
              onClick={saveFormData}
              className="ml-4 text-xs text-purple-600 hover:text-purple-800 underline"
            >
              Save now
            </button>
          </div>
        )}
        
        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{success}</p>
            </div>
          )}
          
          {/* Breadcrumb Navigation */}
          <div className="mb-4">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <a href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-purple-600">
                    <svg className="w-3 h-3 mr-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                    </svg>
                    Dashboard
                  </a>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <a href="/dashboard/projects" className="ml-1 text-sm font-medium text-gray-700 hover:text-purple-600 md:ml-2">Projects</a>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Add Project</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex -mb-px space-x-8 overflow-x-auto" aria-label="Project sections">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'basic'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Basic Information
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'team'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Team Assignment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'documents'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Documents
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'activities'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Activities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('custom')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'custom'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Custom Fields
              </button>
            </nav>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Tab Progress Breadcrumb */}
              <div className="px-2 py-3 bg-gray-50 rounded-lg">
                <ol className="flex items-center w-full text-sm font-medium text-center text-gray-500">
                  <li className={`flex md:w-full items-center ${activeTab === 'basic' ? 'text-purple-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center justify-center w-8 h-8 ${activeTab === 'basic' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'} rounded-full lg:h-8 lg:w-8 shrink-0 mr-2`}>1</span>
                    <span onClick={() => setActiveTab('basic')} className="hidden sm:inline-flex cursor-pointer hover:text-gray-700">Basic</span>
                  </li>
                  <li className={`flex md:w-full items-center ${activeTab === 'team' ? 'text-purple-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center justify-center w-8 h-8 ${activeTab === 'team' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'} rounded-full lg:h-8 lg:w-8 shrink-0 mr-2`}>2</span>
                    <span onClick={() => setActiveTab('team')} className="hidden sm:inline-flex cursor-pointer hover:text-gray-700">Team</span>
                  </li>
                  <li className={`flex md:w-full items-center ${activeTab === 'documents' ? 'text-purple-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center justify-center w-8 h-8 ${activeTab === 'documents' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'} rounded-full lg:h-8 lg:w-8 shrink-0 mr-2`}>3</span>
                    <span onClick={() => setActiveTab('documents')} className="hidden sm:inline-flex cursor-pointer hover:text-gray-700">Documents</span>
                  </li>
                  <li className={`flex md:w-full items-center ${activeTab === 'activities' ? 'text-purple-600' : ''} sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10`}>
                    <span className={`flex items-center justify-center w-8 h-8 ${activeTab === 'activities' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'} rounded-full lg:h-8 lg:w-8 shrink-0 mr-2`}>4</span>
                    <span onClick={() => setActiveTab('activities')} className="hidden sm:inline-flex cursor-pointer hover:text-gray-700">Activities</span>
                  </li>
                  <li className={`flex items-center ${activeTab === 'custom' ? 'text-purple-600' : ''}`}>
                    <span className={`flex items-center justify-center w-8 h-8 ${activeTab === 'custom' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100'} rounded-full lg:h-8 lg:w-8 shrink-0 mr-2`}>5</span>
                    <span onClick={() => setActiveTab('custom')} className="hidden sm:inline-flex cursor-pointer hover:text-gray-700">Custom</span>
                  </li>
                </ol>
              </div>

              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Basic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="project_number" className="block text-sm font-medium text-gray-700 mb-1">Project Number <span className="text-xs font-normal text-green-600 ml-1">(Auto-generated)</span></label>
                      <div className="relative">
                        <input
                          id="project_number"
                          name="project_number"
                          type="text"
                          value={formData.project_number}
                          className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          readOnly
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Format: 519-MM-YYYY-XXX-project-title</p>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="PROPOSAL">Proposal</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="MAINTENANCE">Maintenance</option>
                        <option value="CONSULTING">Consulting</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <select
                        id="client_id"
                        name="client_id"
                        value={formData.client_id}
                        onChange={(e) => {
                          handleChange(e);
                          // Also update client name for documents
                          const selectedCompany = clients.find(c => c.id === e.target.value);
                          if (selectedCompany) {
                            setFormData(prev => ({
                              ...prev,
                              client_name: selectedCompany.name
                            }));
                          }
                        }}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Company</option>
                        {clients.map(company => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone (Indian Format)</label>
                      <input
                        id="contact_phone"
                        name="contact_phone"
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Format: +91 XXXXX XXXXX</p>
                    </div>
                    
                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        id="start_date"
                        name="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        id="end_date"
                        name="end_date"
                        type="date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-1">Project Value (₹)</label>
                      <input
                        id="value"
                        name="value"
                        type="text"
                        placeholder="0.00"
                        value={formData.value}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Enter decimal value (e.g. 50000.00)</p>
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="planning">Planning</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    ></textarea>
                  </div>
                </div>
              )}
              
              {/* Team Assignment Tab */}
              {activeTab === 'team' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Team Assignment</h2>
                  
                  <div className="bg-gray-50 p-4 mb-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Assign team members and their roles for this project</p>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-500">Selected</span>
                      <div className="w-3 h-3 rounded-full bg-gray-300 ml-2"></div>
                      <span className="text-xs text-gray-500">Available</span>
                    </div>
                  </div>

                  {/* User Search and Add User Form */}
                  <div className="flex flex-col md:flex-row items-stretch gap-3 mb-4">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Search users by name, email, or department..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus size={16} />
                      {showAddUserForm ? 'Cancel' : 'Add New User'}
                    </button>
                  </div>
                  
                  {showAddUserForm && (
                    <div className="mb-6 p-5 bg-gradient-to-r from-purple-50 to-gray-50 rounded-lg border border-purple-100 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-md font-semibold text-gray-800">Add New Team Member</h3>
                        <button 
                          onClick={() => setShowAddUserForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="newUserName" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            id="newUserName"
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter full name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="newUserEmail" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                          <input
                            id="newUserEmail"
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter work email"
                            required
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newUserRole" className="block text-sm font-medium text-gray-700 mb-1">Project Role</label>
                          <select
                            id="newUserRole"
                            value={newUser.role}
                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="project_manager">Project Manager</option>
                            <option value="project_engineer">Project Engineer</option>
                            <option value="team_lead">Team Lead</option>
                            <option value="technical_lead">Technical Lead</option>
                            <option value="senior_engineer">Senior Engineer</option>
                            <option value="engineer">Engineer</option>
                            <option value="designer">Designer</option>
                            <option value="qa_engineer">QA Engineer</option>
                            <option value="business_analyst">Business Analyst</option>
                            <option value="team_member">Team Member</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="newUserDepartment" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select
                            id="newUserDepartment"
                            value={newUser.department}
                            onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select Department</option>
                            {availableDepartments.map(department => (
                              <option key={department} value={department}>{department}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <button
                          onClick={handleAddNewUser}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          type="button"
                        >
                          Add to Team
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Key Team Members Card */}
                  {formData.assigned_to.length > 0 && (
                    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-md font-medium text-gray-800 mb-3">Key Team Members</h3>
                      <div className="flex flex-wrap gap-2">
                        {formData.assigned_to.map(userId => {
                          const teamMember = users.find(u => u.id === userId);
                          if (!teamMember) return null;
                          
                          // Get role for display
                          const role = formData.role_assignments[userId] || 'team_member';
                          const roleDisplay = role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                          
                          return (
                            <div 
                              key={userId} 
                              className="flex items-center bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 shadow-sm"
                            >
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-2" 
                                style={{
                                  backgroundColor: role === 'project_manager' ? '#8B5CF6' : 
                                                 role === 'team_lead' ? '#3B82F6' : 
                                                 '#6366F1'
                                }}
                              >
                                {teamMember.name ? teamMember.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{teamMember.name}</p>
                                <p className="text-xs text-purple-600">{roleDisplay}</p>
                              </div>
                              <button 
                                onClick={() => handleUserSelect(userId, false)}
                                className="ml-2 text-gray-400 hover:text-red-500"
                                title="Remove from team"
                                type="button"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border-b">Select</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border-b">User Details</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border-b">Department</th>
                            <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase border-b">Project Role</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className={`hover:bg-gray-50 ${formData.assigned_to.includes(user.id) ? 'bg-purple-50' : ''}`}>
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  id={`user-${user.id}`}
                                  checked={formData.assigned_to.includes(user.id)}
                                  onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                                    formData.assigned_to.includes(user.id) ? 'bg-purple-600' : 'bg-gray-400'
                                  }`}>
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.email}</p>
                                    {user.isTemporary && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                        New
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {user.department || '-'}
                              </td>
                              <td className="p-3">
                                {formData.assigned_to.includes(user.id) ? (
                                  <select
                                    value={formData.role_assignments[user.id] || 'team_member'}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="project_manager">Project Manager</option>
                                    <option value="project_engineer">Project Engineer</option>
                                    <option value="team_lead">Team Lead</option>
                                    <option value="technical_lead">Technical Lead</option>
                                    <option value="senior_engineer">Senior Engineer</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="designer">Designer</option>
                                    <option value="qa_engineer">QA Engineer</option>
                                    <option value="business_analyst">Business Analyst</option>
                                    <option value="team_member">Team Member</option>
                                  </select>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleUserSelect(user.id, true)}
                                    className="px-3 py-1 text-xs text-purple-600 hover:text-purple-800 border border-purple-200 hover:border-purple-300 rounded-md transition-colors bg-white hover:bg-purple-50"
                                  >
                                    Assign to Team
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Empty and Filtered States */}
                    {users.length === 0 && (
                      <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mt-2 text-gray-500">No users available for assignment</p>
                        <button 
                          type="button"
                          onClick={() => setShowAddUserForm(true)}
                          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                        >
                          <Plus size={16} className="mr-1" />
                          Add New Team Member
                        </button>
                      </div>
                    )}
                    
                    {users.length > 0 && filteredUsers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No users match your search criteria</p>
                        <p className="mt-1 text-sm text-gray-400">Try a different search term</p>
                      </div>
                    )}
                  </div>
                  
                  {formData.assigned_to.length > 0 && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Team Role Distribution
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {/* Calculate role distribution */}
                        {(() => {
                          // Count roles
                          const roleCounts = {};
                          Object.values(formData.role_assignments).forEach(role => {
                            roleCounts[role] = (roleCounts[role] || 0) + 1;
                          });
                          
                          return Object.entries(roleCounts).map(([role, count]) => {
                            const formattedRole = role.split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                              
                            // Select color based on role type
                            const getBgColor = () => {
                              switch(role) {
                                case 'project_manager': return 'bg-purple-100 text-purple-800';
                                case 'team_lead': return 'bg-blue-100 text-blue-800';
                                case 'technical_lead': return 'bg-indigo-100 text-indigo-800';
                                case 'senior_engineer': return 'bg-green-100 text-green-800';
                                case 'engineer': return 'bg-emerald-100 text-emerald-800';
                                case 'qa_engineer': return 'bg-yellow-100 text-yellow-800';
                                default: return 'bg-gray-100 text-gray-800';
                              }
                            };
                            
                            return (
                              <div key={role} className="flex items-center justify-between p-2 rounded-md border border-gray-100">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBgColor()}`}>
                                  {formattedRole}
                                </span>
                                <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">
                                  {count} {count === 1 ? 'member' : 'members'}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Individual Role Assignments */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Individual Assignments</h4>
                        <div className="space-y-1">
                          {Object.entries(formData.role_assignments).map(([userId, role]) => {
                            const user = users.find(u => u.id === userId);
                            if (!user) return null;
                            
                            const formattedRole = role.split('_')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(' ');
                            
                            return (
                              <div key={userId} className="flex items-center justify-between text-sm p-1 hover:bg-gray-50 rounded">
                                <div className="flex items-center">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-medium mr-2 text-xs"
                                    style={{
                                      backgroundColor: role === 'project_manager' ? '#8B5CF6' : 
                                                     role === 'team_lead' ? '#3B82F6' : 
                                                     '#6366F1'
                                    }}
                                  >
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                  </div>
                                  <span>{user.name}</span>
                                </div>
                                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-800">
                                  {formattedRole}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Document Information Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Document Information</h2>
                  
                  {/* Client Information for Documents */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2">Client Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="client_name" className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <input
                          id="client_name"
                          name="client_name"
                          type="text"
                          value={formData.client_name}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Same as selected company"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quotation */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText size={20} className="text-blue-600" />
                        <h3 className="font-medium">Quotation</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="has_quotation"
                            name="has_quotation"
                            type="checkbox"
                            checked={formData.has_quotation}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="has_quotation" className="ml-2 block text-sm text-gray-700">
                            Has Quotation
                          </label>
                        </div>
                        
                        {formData.has_quotation && (
                          <>
                            <div>
                              <label htmlFor="quotation_number" className="block text-sm font-medium text-gray-700 mb-1">Quotation Number</label>
                              <input
                                id="quotation_number"
                                name="quotation_number"
                                type="text"
                                value={formData.quotation_number}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="quotation_date" className="block text-sm font-medium text-gray-700 mb-1">Quotation Date</label>
                              <input
                                id="quotation_date"
                                name="quotation_date"
                                type="date"
                                value={formData.quotation_date}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="quotation_amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                              <input
                                id="quotation_amount"
                                name="quotation_amount"
                                type="text"
                                placeholder="0.00"
                                value={formData.quotation_amount}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Purchase Order */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ClipboardList size={20} className="text-green-600" />
                        <h3 className="font-medium">Purchase Order</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="has_po"
                            name="has_po"
                            type="checkbox"
                            checked={formData.has_po}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="has_po" className="ml-2 block text-sm text-gray-700">
                            Has Purchase Order
                          </label>
                        </div>
                        
                        {formData.has_po && (
                          <>
                            <div>
                              <label htmlFor="po_number" className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
                              <input
                                id="po_number"
                                name="po_number"
                                type="text"
                                value={formData.po_number}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="po_date" className="block text-sm font-medium text-gray-700 mb-1">PO Date</label>
                              <input
                                id="po_date"
                                name="po_date"
                                type="date"
                                value={formData.po_date}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="po_amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                              <input
                                id="po_amount"
                                name="po_amount"
                                type="text"
                                placeholder="0.00"
                                value={formData.po_amount}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Invoice */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Tag size={20} className="text-purple-600" />
                        <h3 className="font-medium">Invoice</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <input
                            id="has_invoice"
                            name="has_invoice"
                            type="checkbox"
                            checked={formData.has_invoice}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <label htmlFor="has_invoice" className="ml-2 block text-sm text-gray-700">
                            Has Invoice
                          </label>
                        </div>
                        
                        {formData.has_invoice && (
                          <>
                            <div>
                              <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                              <input
                                id="invoice_number"
                                name="invoice_number"
                                type="text"
                                value={formData.invoice_number}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                              <input
                                id="invoice_date"
                                name="invoice_date"
                                type="date"
                                value={formData.invoice_date}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <label htmlFor="invoice_amount" className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                              <input
                                id="invoice_amount"
                                name="invoice_amount"
                                type="text"
                                placeholder="0.00"
                                value={formData.invoice_amount}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Activities Tab */}
              {activeTab === 'activities' && (
                <div>
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Project Activities</h2>
                    <button 
                      type="button" 
                      onClick={addActivity}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                    >
                      <Plus size={16} />
                      Add Activity
                    </button>
                  </div>
                  
                  {formData.activities.map((activity, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Activity #{index + 1}</h4>
                        {formData.activities.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeActivity(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor={`activity-title-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            id={`activity-title-${index}`}
                            name="title"
                            type="text"
                            value={activity.title}
                            onChange={(e) => handleActivityChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`activity-assigned-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                          <select
                            id={`activity-assigned-${index}`}
                            name="assigned_to"
                            value={activity.assigned_to}
                            onChange={(e) => handleActivityChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select User</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor={`activity-date-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                          <input
                            id={`activity-date-${index}`}
                            name="due_date"
                            type="date"
                            value={activity.due_date}
                            onChange={(e) => handleActivityChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor={`activity-status-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            id={`activity-status-${index}`}
                            name="status"
                            value={activity.status}
                            onChange={(e) => handleActivityChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="ongoing">Ongoing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        
                        <div className="md:col-span-2">
                          <label htmlFor={`activity-description-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            id={`activity-description-${index}`}
                            name="description"
                            rows="2"
                            value={activity.description}
                            onChange={(e) => handleActivityChange(index, e)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.activities.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">No activities added yet</p>
                      <button 
                        type="button" 
                        onClick={addActivity}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add First Activity
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Custom Fields Tab */}
              {activeTab === 'custom' && (
                <div>
                  <div className="flex items-center justify-between border-b pb-2 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Custom Fields</h2>
                    <button 
                      type="button" 
                      onClick={addCustomContainer}
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                    >
                      <Plus size={16} />
                      Add Container
                    </button>
                  </div>
                  
                  {formData.custom_containers.map((container, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{container.title || `Custom Section ${index + 1}`}</h4>
                        {formData.custom_containers.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeCustomContainer(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        )}
                      </div>
                      <div className="mb-3">
                        <input
                          type="text"
                          value={container.title || ''}
                          onChange={(e) => updateCustomContainer(index, { ...container, title: e.target.value })}
                          placeholder="Container Title"
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        {container.fields?.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={field}
                              onChange={(e) => updateCustomContainerField(index, fieldIndex, e.target.value)}
                              placeholder="Field name"
                              className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button 
                              type="button" 
                              onClick={() => removeCustomContainerField(index, fieldIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button" 
                          onClick={() => addFieldToContainer(index, '')}
                          className="mt-2 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                        >
                          <Plus size={16} />
                          Add Field
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {formData.custom_containers.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">No custom containers added yet</p>
                      <button 
                        type="button" 
                        onClick={addCustomContainer}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add First Container
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Submit Button */}
              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full sm:w-auto px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}