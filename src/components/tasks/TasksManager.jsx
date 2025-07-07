'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Calendar, Clock, CheckSquare, 
  Edit3, Trash2, Star, AlertCircle, MoreVertical, User
} from 'lucide-react';

// Add CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #8b5cf6;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function TasksManager() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentTask, setCurrentTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    category: 'personal',
    assignedTo: '',
    tags: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to close modal
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
      // Ctrl/Cmd + K to open create modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' && !showModal) {
        e.preventDefault();
        openModal('create');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (formData.assignedTo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.assignedTo)) {
      errors.assignedTo = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormTouched(prev => ({ ...prev, [field]: true }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const openModal = (mode, task = null) => {
    setModalMode(mode);
    setCurrentTask(task);
    setFormErrors({});
    setFormTouched({});
    setIsSubmitting(false);
    setShowSuccessMessage(false);
    
    if (mode === 'edit' && task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || '',
        dueTime: task.dueTime || '',
        category: task.category || 'personal',
        assignedTo: task.assignedTo || '',
        tags: Array.isArray(task.tags) ? task.tags.join(', ') : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        dueDate: '',
        dueTime: '',
        category: 'personal',
        assignedTo: '',
        tags: ''
      });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentTask(null);
    setFormErrors({});
    setFormTouched({});
    setIsSubmitting(false);
    setShowSuccessMessage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const taskData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (modalMode === 'edit') {
        taskData.id = currentTask.id;
      }

      const response = await fetch('/api/tasks', {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        setShowSuccessMessage(true);
        await fetchTasks();
        
        // Auto-close modal after success
        setTimeout(() => {
          closeModal();
        }, 1500);
      } else {
        const errorData = await response.json();
        setFormErrors({ 
          submit: errorData.message || 'Failed to save task. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error saving task:', error);
      setFormErrors({ 
        submit: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({ id: taskId })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-100 border-red-300';
      case 'medium': return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'low': return 'text-green-700 bg-green-100 border-green-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-300';
      case 'in-progress': return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'pending': return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'overdue': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <>
        <style jsx global>{styles}</style>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your tasks...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{styles}</style>
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <button
              onClick={() => openModal('create')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              title="Create new task (Ctrl+K)"
            >
              <Plus size={18} />
              Add Task
              <span className="hidden lg:block text-xs bg-purple-800 bg-opacity-50 px-2 py-1 rounded ml-2">
                ⌘K
              </span>
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="bg-purple-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="text-purple-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {tasks.length === 0 
                  ? "Create your first task to get started with task management" 
                  : "Try adjusting your search or filter criteria to find tasks"
                }
              </p>
              {tasks.length === 0 && (
                <button
                  onClick={() => openModal('create')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  Create Your First Task
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:border-purple-200 group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.3s ease-out forwards'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={task.status === 'completed'}
                          onChange={(e) => updateTaskStatus(task.id, e.target.checked ? 'completed' : 'pending')}
                          className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-2 border-gray-300 transition-colors duration-200"
                        />
                        {task.status === 'completed' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                      <h3 className={`text-lg font-semibold transition-all duration-200 ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900 group-hover:text-purple-700'
                      }`}>
                        {task.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusColor(task.status)}`}>
                          {task.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 mb-4 leading-relaxed">{task.description}</p>
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <Calendar size={16} className="text-purple-500" />
                          <span className="font-medium">{new Date(task.dueDate).toLocaleDateString()}</span>
                          {task.dueTime && <span className="text-purple-600 font-medium">{task.dueTime}</span>}
                        </div>
                      )}
                      {task.category && (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-xs font-medium">
                          {task.category.replace('-', ' ').toUpperCase()}
                        </span>
                      )}
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                          <User size={16} className="text-blue-500" />
                          <span className="text-blue-700 font-medium">{task.assignedTo}</span>
                        </div>
                      )}
                    </div>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {task.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => openModal('edit', task)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Edit task"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                      title="Delete task"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Keyboard shortcuts info */}
        {tasks.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="font-medium">Keyboard Shortcuts:</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-2">
                  <kbd className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono">⌘</kbd>
                  <kbd className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono">K</kbd>
                  <span>Create Task</span>
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="bg-white border border-gray-300 rounded px-2 py-1 text-xs font-mono">ESC</kbd>
                  <span>Close Modal</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl transform scale-100 transition-all duration-300"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 rounded-full p-2">
                    <CheckSquare className="text-purple-600" size={24} />
                  </div>
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                    {modalMode === 'edit' ? 'Edit Task' : 'Create New Task'}
                  </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {showSuccessMessage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                      <CheckSquare className="text-green-600" size={20} />
                      <span className="text-green-800 font-medium">
                        Task {modalMode === 'edit' ? 'updated' : 'created'} successfully!
                      </span>
                    </div>
                  )}

                  {/* Submit Error */}
                  {formErrors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                      <AlertCircle className="text-red-600" size={20} />
                      <span className="text-red-800 font-medium">{formErrors.submit}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => handleFormChange('title', e.target.value)}
                      placeholder="Enter a descriptive task title"
                      autoFocus
                      className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                        formErrors.title && formTouched.title
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.title && formTouched.title && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {formErrors.title}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      placeholder="Add task details and context"
                      rows={3}
                      maxLength={500}
                      className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-none ${
                        formErrors.description && formTouched.description
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-purple-500'
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {formErrors.description && formTouched.description && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle size={14} />
                          {formErrors.description}
                        </p>
                      )}
                      <p className="text-gray-500 text-sm ml-auto">
                        {formData.description.length}/500
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFormChange('status', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                          formErrors.dueDate && formTouched.dueDate
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:border-purple-500'
                        }`}
                      />
                      {formErrors.dueDate && formTouched.dueDate && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {formErrors.dueDate}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Time
                      </label>
                      <input
                        type="time"
                        value={formData.dueTime}
                        onChange={(e) => handleFormChange('dueTime', e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white"
                    >
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="project">Project</option>
                      <option value="meeting">Meeting</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="email"
                      value={formData.assignedTo}
                      onChange={(e) => handleFormChange('assignedTo', e.target.value)}
                      placeholder="Enter assignee email address"
                      className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${
                        formErrors.assignedTo && formTouched.assignedTo
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-purple-500'
                      }`}
                    />
                    {formErrors.assignedTo && formTouched.assignedTo && (
                      <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {formErrors.assignedTo}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleFormChange('tags', e.target.value)}
                      placeholder="Enter tags separated by commas"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    />
                    <p className="text-xs text-gray-500 mt-1">Example: urgent, client-work, review-needed</p>
                  </div>
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || showSuccessMessage}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                        isSubmitting || showSuccessMessage
                          ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 hover:shadow-lg transform hover:scale-105'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {modalMode === 'edit' ? 'Updating...' : 'Creating...'}
                        </>
                      ) : showSuccessMessage ? (
                        <>
                          <CheckSquare size={18} />
                          {modalMode === 'edit' ? 'Updated!' : 'Created!'}
                        </>
                      ) : (
                        modalMode === 'edit' ? 'Update Task' : 'Create Task'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                        isSubmitting
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
