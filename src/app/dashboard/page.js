'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/navigation/Navbar.jsx';
import {  
  Users, Building2, Target, Activity, ArrowRight, BarChart3, 
  Layers, Calendar, IndianRupee, Briefcase, TrendingUp, 
  Wrench, Zap, Building, Award
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    leads: { total: 0, new: 0, inProgress: 0, closed: 0 },
    companies: { total: 0, active: 0 },
    projects: { total: 0, active: 0, completed: 0, totalValue: 0 },
    users: { total: 0, active: 0 },
    activities: { total: 0, today: 0 },
    disciplines: []
  });
  const [recentData, setRecentData] = useState({
    leads: [],
    companies: [],
    projects: [],
    activities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchDashboardData();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all data
      const [leadsRes, companiesRes, projectsRes, usersRes, activitiesRes, disciplinesRes] = await Promise.all([
        fetch('/api/leads').catch(() => null),
        fetch('/api/companies').catch(() => null),
        fetch('/api/projects').catch(() => null),
        fetch('/api/users').catch(() => null),
        fetch('/api/activities').catch(() => null),
        fetch('/api/disciplines').catch(() => null)
      ]);

      // Parse responses
      const leads = leadsRes ? await leadsRes.json().catch(() => ({ leads: [] })) : { leads: [] };
      const companies = companiesRes ? await companiesRes.json().catch(() => ({ companies: [] })) : { companies: [] };
      const projects = projectsRes ? await projectsRes.json().catch(() => ({ projects: [] })) : { projects: [] };
      const users = usersRes ? await usersRes.json().catch(() => ({ users: [] })) : { users: [] };
      const activities = activitiesRes ? await activitiesRes.json().catch(() => ({ activities: [] })) : { activities: [] };
      const disciplines = disciplinesRes ? await disciplinesRes.json().catch(() => ({ disciplines: [] })) : { disciplines: [] };

      const leadsData = leads.leads || [];
      const companiesData = companies.companies || [];
      const projectsData = projects.projects || [];
      const usersData = users.users || [];
      const activitiesData = activities.activities || [];
      const disciplinesData = disciplines.disciplines || [];

      // Calculate stats from real data
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalProjectValue = projectsData.reduce((sum, project) => {
        const value = parseFloat(project.budget || project.estimated_value || 0);
        return sum + value;
      }, 0);

      setStats({
        leads: {
          total: leadsData.length,
          new: leadsData.filter(l => l.enquiry_status === 'New' || l.status === 'new').length,
          inProgress: leadsData.filter(l => l.enquiry_status === 'In Progress' || l.status === 'in_progress').length,
          closed: leadsData.filter(l => l.enquiry_status === 'Closed' || l.status === 'closed').length
        },
        companies: {
          total: companiesData.length,
          active: companiesData.filter(c => c.is_active !== false).length
        },
        projects: {
          total: projectsData.length,
          active: projectsData.filter(p => 
            p.status === 'active' || p.status === 'in_progress' || p.status === 'Active' || p.status === 'In Progress'
          ).length,
          completed: projectsData.filter(p => 
            p.status === 'completed' || p.status === 'Completed'
          ).length,
          totalValue: totalProjectValue
        },
        users: {
          total: usersData.length,
          active: usersData.filter(u => u.status === 'active' || u.is_active !== false).length
        },
        activities: {
          total: activitiesData.length,
          today: activitiesData.filter(a => {
            const activityDate = new Date(a.created_at || a.date);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === today.getTime();
          }).length
        },
        disciplines: disciplinesData.filter(d => d.is_active !== false)
      });

      setRecentData({
        leads: leadsData.slice(0, 5),
        companies: companiesData.slice(0, 5),
        projects: projectsData.slice(0, 5),
        activities: activitiesData.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };  const StatCard = ({ title, value, icon: Icon, color = "blue", onClick }) => (
    <div 
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-100 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const PieChart = ({ data, colors }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      return <div className="text-center text-gray-500 py-8">No data available</div>;
    }
    
    let currentAngle = 0;
    return (
      <div className="flex items-center space-x-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              if (item.value === 0) return null;
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const radius = 40;
              const x1 = 50 + radius * Math.cos((currentAngle * Math.PI) / 180);
              const y1 = 50 + radius * Math.sin((currentAngle * Math.PI) / 180);
              const x2 = 50 + radius * Math.cos(((currentAngle + angle) * Math.PI) / 180);
              const y2 = 50 + radius * Math.sin(((currentAngle + angle) * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              const result = (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index]}
                  stroke="white"
                  strokeWidth="1"
                />
              );
              
              currentAngle += angle;
              return result;
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors[index] }}></div>
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-medium text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChart = ({ data, colors }) => {
    const maxValue = Math.max(...data.map(item => item.value));
    if (maxValue === 0) {
      return <div className="text-center text-gray-500 py-8">No data available</div>;
    }
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-gray-600 text-right">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div 
                className="h-6 rounded-full flex items-center justify-end pr-2"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: colors[index]
                }}
              >
                <span className="text-xs font-medium text-white">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };  const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">EPC Solutions Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.name || 'User'}! Here&apos;s your business overview.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Leads"
            value={stats.leads.total}
            icon={Target}
            color="blue"
            onClick={() => router.push('/dashboard/leads')}
          />
          <StatCard
            title="Active Projects"
            value={stats.projects.active}
            icon={Briefcase}
            color="green"
            onClick={() => router.push('/dashboard/projects')}
          />
          <StatCard
            title="Companies"
            value={stats.companies.total}
            icon={Building2}
            color="purple"
            onClick={() => router.push('/dashboard/companies')}
          />
          <StatCard
            title="Today&apos;s Activities"
            value={stats.activities.today}
            icon={Activity}
            color="orange"
            onClick={() => router.push('/dashboard/activities')}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Lead Status Distribution">
            <PieChart
              data={[
                { label: 'New', value: stats.leads.new },
                { label: 'In Progress', value: stats.leads.inProgress },
                { label: 'Closed', value: stats.leads.closed }
              ]}
              colors={['#3B82F6', '#F59E0B', '#10B981']}
            />
          </ChartCard>
          
          <ChartCard title="Project Status Overview">
            <BarChart
              data={[
                { label: 'Active', value: stats.projects.active },
                { label: 'Completed', value: stats.projects.completed }
              ]}
              colors={['#8B5CF6', '#10B981']}
            />
          </ChartCard>
        </div>

        {/* EPC Specific Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Engineering Disciplines</h3>
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-2">
              {stats.disciplines.length > 0 ? stats.disciplines.slice(0, 4).map((discipline, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{discipline.discipline_name}</span>
                  <span className="text-sm font-medium text-blue-600">Active</span>
                </div>
              )) : (
                <div className="text-sm text-gray-500">No disciplines configured</div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Value</h3>
              <IndianRupee className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Portfolio</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.projects.totalValue > 0 ? formatCurrency(stats.projects.totalValue) : '₹0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-lg font-semibold text-gray-900">{stats.projects.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              <Zap className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/dashboard/leads/add')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Add New Lead
              </button>
              <button 
                onClick={() => router.push('/dashboard/companies/add')}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                Add Company
              </button>
              <button 
                onClick={() => router.push('/dashboard/outreach/new')}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                New Outreach
              </button>
            </div>
          </div>
        </div>        {/* Recent Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
                <Link href="/dashboard/leads" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All <ArrowRight className="inline h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentData.leads.length > 0 ? recentData.leads.map((lead, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.company_name || lead.client_name || 'Unknown Company'}</p>
                      <p className="text-sm text-gray-600">{lead.enquiry_details || lead.description || 'No details'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      (lead.enquiry_status === 'New' || lead.status === 'new') ? 'bg-blue-100 text-blue-800' :
                      (lead.enquiry_status === 'In Progress' || lead.status === 'in_progress') ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {lead.enquiry_status || lead.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-gray-500">No recent leads</div>
              )}
            </div>
          </div>

          {/* Recent Companies */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Companies</h3>
                <Link href="/dashboard/companies" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All <ArrowRight className="inline h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {recentData.companies.length > 0 ? recentData.companies.map((company, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{company.company_name || company.name}</p>
                      <p className="text-sm text-gray-600">
                        {company.industry || 'N/A'} • {company.location || company.city || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{company.project_count || 0} projects</p>
                      <p className="text-xs text-gray-500">{company.business_type || company.type || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-4 text-center text-gray-500">No recent companies</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => router.push('/dashboard/reports')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Generate Reports</h3>
                <p className="text-blue-100">Business analytics &amp; insights</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => router.push('/dashboard/masters')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Master Data</h3>
                <p className="text-green-100">Manage system settings</p>
              </div>
              <Layers className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => router.push('/dashboard/calendar')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Calendar &amp; Tasks</h3>
                <p className="text-purple-100">Schedule &amp; deadlines</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
