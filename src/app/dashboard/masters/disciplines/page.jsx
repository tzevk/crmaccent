'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { 
  Settings, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  BookOpen,
  Edit3,
  Trash2,
  Eye,
  X
} from 'lucide-react';
import { disciplinesAPI } from '../../../../utils/comprehensiveAPI.js';

export default function DisciplinesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [disciplines, setDisciplines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [formData, setFormData] = useState({
    discipline_name: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadDisciplines();
    } else {
      router.push('/');
    }
  }, [router]);

  const loadDisciplines = async () => {
    try {
      setIsLoading(true);
      const response = await disciplinesAPI.getAll();
      setDisciplines(response.disciplines || []);
    } catch (error) {
      console.error('Error loading disciplines:', error);
      setError('Failed to load disciplines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModal = (discipline = null) => {
    if (discipline) {
      setEditingDiscipline(discipline);
      setFormData({
        discipline_name: discipline.discipline_name,
        start_date: discipline.start_date ? discipline.start_date.split('T')[0] : '',
        end_date: discipline.end_date ? discipline.end_date.split('T')[0] : '',
        description: discipline.description || ''
      });
    } else {
      setEditingDiscipline(null);
      setFormData({
        discipline_name: '',
        start_date: '',
        end_date: '',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDiscipline(null);
    setFormData({
      discipline_name: '',
      start_date: '',
      end_date: '',
      description: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (editingDiscipline) {
        await disciplinesAPI.update(editingDiscipline.id, formData);
      } else {
        await disciplinesAPI.create(formData);
      }
      
      closeModal();
      loadDisciplines();
    } catch (error) {
      console.error('Error saving discipline:', error);
      setError(error.message || 'Failed to save discipline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this discipline?')) {
      try {
        await disciplinesAPI.delete(id);
        loadDisciplines();
      } catch (error) {
        console.error('Error deleting discipline:', error);
        setError('Failed to delete discipline');
      }
    }
  };

  const filteredDisciplines = disciplines.filter(discipline =>
    discipline.discipline_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (discipline.description && discipline.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8" style={{ color: '#64126D' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>Disciplines Master</h1>
          </div>
          <p style={{ color: '#86288F' }}>Manage engineering disciplines and their date ranges</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search disciplines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => openModal()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Discipline
            </button>
          </div>
        </div>

        {/* Disciplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDisciplines.map((discipline) => (
            <div key={discipline.id} className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{discipline.discipline_name}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(discipline)}
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(discipline.id)}
                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {discipline.description && (
                <p className="text-gray-600 mb-4 text-sm">{discipline.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {discipline.start_date ? new Date(discipline.start_date).toLocaleDateString() : 'No start date'}
                    {' - '}
                    {discipline.end_date ? new Date(discipline.end_date).toLocaleDateString() : 'No end date'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    discipline.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {discipline.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-gray-500">
                    Created: {new Date(discipline.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDisciplines.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Disciplines Found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No disciplines match your search criteria.' : 'Get started by adding your first discipline.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => openModal()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Discipline
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingDiscipline ? 'Edit Discipline' : 'Add New Discipline'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="discipline_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Discipline Name *
                </label>
                <input
                  type="text"
                  id="discipline_name"
                  name="discipline_name"
                  value={formData.discipline_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter discipline name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter discipline description"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : (editingDiscipline ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
