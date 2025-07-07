'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit,
  Trash2,
  User, 
  Building, 
  Mail, 
  Phone, 
  DollarSign, 
  Tag,
  Calendar,
  Users,
  Globe,
  MessageSquare,
  MapPin,
  Star,
  Activity,
  Clock
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';
// Import API utility
import { leadsAPI, leadUtils } from '../../../../utils/leadsAPI.js';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id;
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lead, setLead] = useState(null);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadLeadDetails();
    } else {
      router.push('/');
    }
  }, [leadId, router]);

  const loadLeadDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await leadsAPI.getById(leadId);
      setLead(response.lead);
      setActivities(response.activities || []);
    } catch (error) {
      console.error('Error loading lead details:', error);
      setError('Failed to load lead details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      try {
        await leadsAPI.delete(leadId);
        router.push('/dashboard/leads');
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('Failed to delete lead. Please try again.');
      }
    }
  };

  if (!user || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        backgroundColor: '#F5F5F5'
      }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
        <Navbar />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-100 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Lead not found.'}</p>
            <Link
              href="/dashboard/leads"
              className="text-purple-600 hover:text-purple-800 underline mt-2 inline-block"
            >
              Return to Leads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      backgroundColor: '#F5F5F5'
    }}>
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center hover:text-gray-900 transition-colors"
              style={{ color: '#64126D' }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Leads
            </Link>
            
            <div className="flex gap-3">
              <Link
                href={`/dashboard/leads/edit/${leadId}`}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Lead
              </Link>
              <button
                onClick={handleDeleteLead}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold" style={{ color: '#64126D' }}>
              {lead.name}
            </h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${leadUtils.getStatusColor(lead.status)}`}>
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </span>
          </div>
          
          <p className="text-gray-600">{lead.company}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{lead.email || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{lead.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Building className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{lead.company || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    {lead.website ? (
                      <a 
                        href={lead.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-purple-600 hover:text-purple-800"
                      >
                        {lead.website}
                      </a>
                    ) : (
                      <p className="font-medium">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lead Details */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-6">
                <Activity className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Lead Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Source</p>
                  <p className="font-medium flex items-center">
                    <span className="mr-2">{leadUtils.getSourceIcon(lead.source)}</span>
                    {lead.source.replace('_', ' ').charAt(0).toUpperCase() + lead.source.replace('_', ' ').slice(1)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p className="font-medium text-green-600">
                    {leadUtils.formatCurrency(lead.value)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Lead Score</p>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{lead.lead_score}/100</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Assigned To</p>
                  <p className="font-medium">{lead.assigned_to || 'Unassigned'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-medium">{lead.industry || 'Not specified'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Next Follow-up</p>
                  <p className="font-medium">
                    {lead.next_follow_up 
                      ? new Date(lead.next_follow_up).toLocaleDateString() 
                      : 'Not scheduled'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            {(lead.address || lead.city || lead.state || lead.country) && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <MapPin className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Address</h2>
                </div>
                
                <div className="text-gray-700">
                  {lead.address && <p>{lead.address}</p>}
                  <p>
                    {[lead.city, lead.state, lead.postal_code].filter(Boolean).join(', ')}
                  </p>
                  {lead.country && <p>{lead.country}</p>}
                </div>
              </div>
            )}

            {/* Description & Notes */}
            {(lead.description || lead.notes) && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Notes & Description</h2>
                </div>
                
                {lead.description && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{lead.description}</p>
                  </div>
                )}
                
                {lead.notes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
                    <p className="text-gray-700">{lead.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(lead.updated_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="font-medium">
                    {lead.created_by_name 
                      ? `${lead.created_by_name} ${lead.created_by_lastname || ''}`.trim()
                      : 'System'
                    }
                  </p>
                </div>
                
                {lead.tags && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.split(',').map((tag, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              </div>
              
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="border-l-2 border-purple-200 pl-3">
                      <p className="font-medium text-sm">{activity.subject}</p>
                      <p className="text-gray-600 text-xs">{activity.description}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  
                  {activities.length > 5 && (
                    <p className="text-purple-600 text-sm cursor-pointer hover:text-purple-800">
                      View all activities ({activities.length})
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No activities recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
