'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { 
  Building2, 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Briefcase, 
  Edit, 
  Trash2,
  PlusCircle
} from 'lucide-react';

export default function CompanyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id;
  
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCompanyData();
    } else {
      router.push('/');
    }
  }, [router, companyId]);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch company details
      const companyResponse = await fetch(`/api/companies/${companyId}`);
      if (!companyResponse.ok) {
        throw new Error('Failed to fetch company details');
      }
      const companyData = await companyResponse.json();
      setCompany(companyData.company);
      
      // Fetch projects for this company
      const projectsResponse = await fetch(`/api/projects?clientId=${companyId}`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }
      
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/dashboard/companies');
      } else {
        throw new Error('Failed to delete company');
      }
    } catch (error) {
      alert('Error deleting company: ' + error.message);
    } finally {
      setDeleteModalOpen(false);
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">Company not found</h2>
            <p className="mt-2 text-gray-600">
              The company you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/dashboard/companies"
              className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/companies" className="p-2 hover:bg-white rounded-lg transition-colors">
              <ArrowLeft className="text-gray-600" size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600">Company Profile</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              href={`/dashboard/companies/edit/${companyId}`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit size={16} />
              Edit
            </Link>
            <button 
              onClick={handleDeleteClick}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="text-purple-600" size={24} />
                  Company Information
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Contact Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" />
                      Email Address
                    </h3>
                    {company.email ? (
                      <a 
                        href={`mailto:${company.email}`}
                        className="text-purple-600 hover:underline"
                      >
                        {company.email}
                      </a>
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" />
                      Phone Number
                    </h3>
                    {company.phone ? (
                      <span>{company.phone}</span>
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Globe size={14} className="text-gray-400" />
                      Website
                    </h3>
                    {company.website ? (
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline flex items-center gap-1"
                      >
                        {company.website}
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                      <Briefcase size={14} className="text-gray-400" />
                      Industry
                    </h3>
                    {company.industry ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                        {company.industry}
                      </span>
                    ) : (
                      <span className="text-gray-500">Not specified</span>
                    )}
                  </div>
                </div>
                
                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" />
                    Address
                  </h3>
                  
                  {company.address || company.city || company.state || company.postal_code || company.country ? (
                    <address className="not-italic">
                      {company.address && <div>{company.address}</div>}
                      {(company.city || company.state || company.postal_code) && (
                        <div>
                          {[
                            company.city, 
                            company.state, 
                            company.postal_code
                          ].filter(Boolean).join(', ')}
                        </div>
                      )}
                      {company.country && <div>{company.country}</div>}
                    </address>
                  ) : (
                    <span className="text-gray-500">No address specified</span>
                  )}
                </div>
                
                {/* Creation Date */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1">
                    <Calendar size={14} className="text-gray-400" />
                    Created On
                  </h3>
                  <span>
                    {new Date(company.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Panel: Projects */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  {projects.length}
                </span>
              </div>
              
              <div className="p-6">
                {projects.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {projects.slice(0, 5).map(project => (
                      <li key={project.id} className="py-2">
                        <Link 
                          href={`/dashboard/projects/${project.id}`}
                          className="block hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg"
                        >
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{project.status}</div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">No projects for this company</div>
                    <Link 
                      href={`/dashboard/projects/add?clientId=${companyId}`}
                      className="mt-4 inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <PlusCircle size={16} />
                      Add Project
                    </Link>
                  </div>
                )}
                
                {projects.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link 
                      href={`/dashboard/projects?clientId=${companyId}`}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      View all {projects.length} projects
                    </Link>
                  </div>
                )}
                
                {projects.length > 0 && (
                  <div className="mt-4 pt-4 border-t text-center">
                    <Link 
                      href={`/dashboard/projects/add?clientId=${companyId}`}
                      className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                    >
                      <PlusCircle size={16} />
                      Add New Project
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Company</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{company.name}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
