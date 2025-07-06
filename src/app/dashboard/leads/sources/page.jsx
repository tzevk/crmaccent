'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Globe,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  Building,
  Share2,
  Calendar
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';

// TODO: Implement API integration for lead sources data
// TODO: Add real-time analytics and reporting
// TODO: Implement source performance tracking
// TODO: Add source management (add/edit/delete sources)
// TODO: Implement automated recommendations based on real data

export default function LeadSourcesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [sources, setSources] = useState([]);

  // Source configuration - this defines available source types
  const sourceTypes = [
    {
      id: 'website',
      name: 'Website',
      icon: Globe,
      color: 'blue',
      description: 'Organic traffic and direct website visits'
    },
    {
      id: 'referral',
      name: 'Referrals',
      icon: UserPlus,
      color: 'green',
      description: 'Customer and partner referrals'
    },
    {
      id: 'cold_call',
      name: 'Cold Calls',
      icon: Phone,
      color: 'red',
      description: 'Outbound calling campaigns'
    },
    {
      id: 'email_campaign',
      name: 'Email Marketing',
      icon: Mail,
      color: 'purple',
      description: 'Email marketing campaigns and newsletters'
    },
    {
      id: 'social_media',
      name: 'Social Media',
      icon: MessageSquare,
      color: 'pink',
      description: 'LinkedIn, Twitter, Facebook, Instagram'
    },
    {
      id: 'trade_show',
      name: 'Trade Shows',
      icon: Building,
      color: 'orange',
      description: 'Industry events and conferences'
    },
    {
      id: 'advertisement',
      name: 'Advertisements',
      icon: Target,
      color: 'indigo',
      description: 'Google Ads, Facebook Ads, display advertising'
    },
    {
      id: 'partner',
      name: 'Partners',
      icon: Share2,
      color: 'teal',
      description: 'Business partnerships and integrations'
    }
  ];

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // TODO: Replace with real API call to load lead sources data
      // Example: 
      // fetchLeadSourcesAnalytics(selectedPeriod)
      //   .then(data => setSources(data))
      //   .catch(error => console.error('Error loading lead sources:', error))
      //   .finally(() => setIsLoading(false));
      
      // For now, just set empty array and stop loading
      setSources([]);
      setIsLoading(false);
    } else {
      router.push('/');
    }
  }, [router, selectedPeriod]);

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-900',
        border: 'border-blue-200',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-900',
        border: 'border-green-200',
        icon: 'text-green-600'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-900',
        border: 'border-red-200',
        icon: 'text-red-600'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-900',
        border: 'border-purple-200',
        icon: 'text-purple-600'
      },
      pink: {
        bg: 'bg-pink-100',
        text: 'text-pink-900',
        border: 'border-pink-200',
        icon: 'text-pink-600'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-900',
        border: 'border-orange-200',
        icon: 'text-orange-600'
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-900',
        border: 'border-indigo-200',
        icon: 'text-indigo-600'
      },
      teal: {
        bg: 'bg-teal-100',
        text: 'text-teal-900',
        border: 'border-teal-200',
        icon: 'text-teal-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const totalLeads = sources.reduce((sum, source) => sum + (source.leads || 0), 0);
  const totalValue = sources.reduce((sum, source) => sum + (source.value || 0), 0);
  const totalConversions = sources.reduce((sum, source) => sum + (source.conversion || 0), 0);
  const avgConversionRate = totalLeads > 0 ? (totalConversions / totalLeads * 100) : 0;

  const topPerformingSource = sources.length > 0 ? 
    sources.reduce((top, source) => (source.value || 0) > (top.value || 0) ? source : top, sources[0]) : 
    null;

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
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Leads
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Sources</h1>
              <p className="text-gray-600">Analyze and optimize your lead generation channels</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <Link
                href="/dashboard/leads/add"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Lead
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-3xl font-bold text-gray-900">₹{totalValue > 0 ? (totalValue / 1000).toFixed(0) + 'K' : '0'}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversions</p>
                <p className="text-3xl font-bold text-gray-900">{totalConversions}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{avgConversionRate.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Performer Highlight */}
        {topPerformingSource ? (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">🏆 Top Performing Source</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <topPerformingSource.icon className="w-6 h-6 mr-2" />
                    <span className="text-xl font-bold">{topPerformingSource.name}</span>
                  </div>
                  <div className="text-sm opacity-90">
                    {topPerformingSource.leads || 0} leads • ₹{(topPerformingSource.value || 0).toLocaleString()} value
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Conversion Rate</div>
                <div className="text-2xl font-bold">
                  {topPerformingSource.leads > 0 ? 
                    (((topPerformingSource.conversion || 0) / topPerformingSource.leads) * 100).toFixed(1) : 
                    '0'
                  }%
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl p-6 text-white mb-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">📊 Lead Sources Analytics</h3>
              <p className="text-sm opacity-90">Start tracking leads from different sources to see performance analytics</p>
              <p className="text-xs mt-2 opacity-75">TODO: Analytics will appear once you have lead data</p>
            </div>
          </div>
        )}

        {/* Source Performance Grid */}
        {sources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {sources.map((source) => {
              const colorClasses = getColorClasses(source.color);
              const conversionRate = source.leads > 0 ? (source.conversion / source.leads) * 100 : 0;
              
              return (
                <div key={source.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                  {/* Header */}
                  <div className={`${colorClasses.bg} ${colorClasses.border} border-b p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <source.icon className={`w-6 h-6 mr-3 ${colorClasses.icon}`} />
                        <h3 className={`font-semibold ${colorClasses.text}`}>{source.name}</h3>
                      </div>
                      <div className="flex items-center">
                        {(source.growth || 0) > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${(source.growth || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {(source.growth || 0) > 0 ? '+' : ''}{(source.growth || 0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-4">{source.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Leads</span>
                        <span className="font-semibold text-gray-900">{source.leads || 0}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Value</span>
                        <span className="font-semibold text-gray-900">₹{(source.value || 0).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversions</span>
                        <span className="font-semibold text-gray-900">{source.conversion || 0}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Conversion Rate</span>
                        <span className="font-semibold text-gray-900">{conversionRate.toFixed(1)}%</span>
                      </div>

                      {/* Conversion Rate Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colorClasses.icon.replace('text-', 'bg-')}`}
                            style={{ width: `${Math.min(conversionRate, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-12 text-center mb-8">
            <div className="mb-6">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-12 h-12 text-gray-400">📊</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Lead Source Data</h3>
              <p className="text-gray-600 mb-6">Start adding leads from different sources to see analytics and performance metrics</p>
              <Link
                href="/dashboard/leads/add"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Lead
              </Link>
            </div>
            <div className="mt-8 text-sm text-gray-500">
              <p>• Track lead generation across multiple channels</p>
              <p>• Monitor conversion rates and ROI by source</p>
              <p>• Get automated recommendations for optimization</p>
            </div>
            <div className="mt-4 text-xs text-gray-400">
              TODO: Real analytics will be calculated from actual lead data
            </div>
          </div>
        )}

        {/* Detailed Analytics */}
        {sources.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Source Performance Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Source Performance Ranking</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sources
                      .sort((a, b) => (b.value || 0) - (a.value || 0))
                      .map((source, index) => {
                        const colorClasses = getColorClasses(source.color);
                        const conversionRate = source.leads > 0 ? (source.conversion / source.leads) * 100 : 0;
                        
                        return (
                          <tr key={source.id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className={`p-2 rounded-full ${colorClasses.bg} mr-3`}>
                                  <source.icon className={`w-4 h-4 ${colorClasses.icon}`} />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{source.name}</div>
                                  <div className="text-sm text-gray-500">#{index + 1} ranked</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{source.leads || 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">₹{(source.value || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{conversionRate.toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Growth Trends */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Growth Trends</h3>
              <div className="space-y-4">
                {sources
                  .sort((a, b) => (b.growth || 0) - (a.growth || 0))
                  .map((source) => {
                    const colorClasses = getColorClasses(source.color);
                    const isPositive = (source.growth || 0) > 0;
                    
                    return (
                      <div key={source.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${colorClasses.bg} mr-3`}>
                            <source.icon className={`w-4 h-4 ${colorClasses.icon}`} />
                          </div>
                          <span className="font-medium text-gray-900">{source.name}</span>
                        </div>
                        <div className="flex items-center">
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{source.growth || 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommendations</h3>
          {sources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Start Tracking</h4>
                <p className="text-sm text-blue-700">
                  Add more leads from different sources to get detailed analytics and recommendations.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Analyze Performance</h4>
                <p className="text-sm text-purple-700">
                  Monitor conversion rates and identify your most effective lead generation channels.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Optimize Budget</h4>
                <p className="text-sm text-green-700">
                  Allocate more resources to high-performing sources for better ROI.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Track All Sources</h4>
                <p className="text-sm text-gray-600">
                  Categorize leads by source to understand which channels work best for your business.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Monitor Performance</h4>
                <p className="text-sm text-gray-600">
                  Track conversion rates, deal values, and ROI for each lead generation channel.
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Get Insights</h4>
                <p className="text-sm text-gray-600">
                  Receive automated recommendations to optimize your lead generation strategy.
                </p>
              </div>
            </div>
          )}
          {sources.length === 0 && (
            <div className="mt-4 text-center text-xs text-gray-400">
              TODO: Smart recommendations will be generated based on your actual lead source performance
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
