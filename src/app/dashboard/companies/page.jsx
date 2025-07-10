'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/navigation/Navbar.jsx';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  ExternalLink,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

export default function CompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const deleteCompany = async (companyId) => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete company');
      }

      // Remove the company from the local state
      setCompanies(companies.filter(company => company.id !== companyId));
      setFilteredCompanies(filteredCompanies.filter(company => company.id !== companyId));
      
      alert('Company deleted successfully');
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Error deleting company. Please try again.');
    }
  };

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCompanies();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/companies');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Use the companies data directly since the API now returns all needed fields
      setCompanies(data.companies);
      setFilteredCompanies(data.companies);
    } catch (error) {
      // Handle error silently in production
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const searchLower = value.toLowerCase();
      const filtered = companies.filter(company => 
        company.name?.toLowerCase().includes(searchLower) ||
        company.email?.toLowerCase().includes(searchLower) ||
        company.phone?.toLowerCase().includes(searchLower) ||
        company.city?.toLowerCase().includes(searchLower) ||
        company.state?.toLowerCase().includes(searchLower) ||
        company.country?.toLowerCase().includes(searchLower) ||
        company.industry?.toLowerCase().includes(searchLower) ||
        company.website?.toLowerCase().includes(searchLower)
      );
      setFilteredCompanies(filtered);
    }
  };

  const handleExport = () => {
    if (filteredCompanies.length === 0) {
      alert('No companies to export');
      return;
    }

    // Generate CSV
    const headers = ["ID", "Company Name", "Phone", "Email", "Address", "City", "Website", "Industry"];
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" +
      filteredCompanies.map(company => [
        company.id,
        company.name,
        company.phone || '',
        company.email || '',
        company.address ? company.address.replace(/,/g, ' ') : '',
        company.city || '',
        company.website || '',
        company.industry || ''
      ].join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `companies_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Building2 className="text-purple-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            </div>
            <p className="text-gray-600 mt-1">Manage all company records</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href="/dashboard/companies/add"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={16} />
              Add Company
            </Link>
            
            <button 
              onClick={handleExport}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search companies by name, industry, or location..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Companies List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Building2 size={48} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold text-gray-700">No companies found</h2>
            <p className="mt-2 text-gray-600">
              {searchTerm ? 'Try a different search term' : 'Add your first company to get started'}
            </p>
            {!searchTerm && (
              <Link 
                href="/dashboard/companies/add"
                className="mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={16} />
                Add Company
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projects</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <Building2 size={18} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{company.name}</div>
                            <div className="text-xs text-gray-500">
                              Added on {new Date(company.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex flex-col">
                          {company.email && (
                            <div className="flex items-center gap-1">
                              <Mail size={12} className="text-gray-500" />
                              <a href={`mailto:${company.email}`} className="text-purple-600 hover:underline">
                                {company.email}
                              </a>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-1 mt-1">
                              <Phone size={12} className="text-gray-500" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {!company.email && !company.phone && (
                            <span className="text-sm text-gray-500">Not available</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex flex-col">
                          {(company.city || company.state || company.country) ? (
                            <div className="flex items-center gap-1">
                              <MapPin size={12} className="text-gray-500" />
                              <span>
                                {[company.city, company.state, company.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not specified</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.industry ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                            {company.industry}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">Not specified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{company.projects_count || 0} projects</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/dashboard/companies/${company.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                            title="View Company Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            href={`/dashboard/companies/${company.id}/edit`}
                            className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                            title="Edit Company"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => deleteCompany(company.id)}
                            className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
