'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/navigation/Navbar.jsx';
import { 
  Users, 
  Building2, 
  FolderOpen, 
  Activity, 
  Target, 
  Settings,
  Database,
  ArrowRight,
  Hash
} from 'lucide-react';

export default function MastersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    projects: 0,
    activities: 0,
    disciplines: 0,
    leadSources: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchStats();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch counts for all master data
      const [usersRes, companiesRes, projectsRes, activitiesRes, disciplinesRes, leadSourcesRes] = await Promise.all([
        fetch('/api/users').catch(() => ({ json: () => ({ users: [] }) })),
        fetch('/api/companies').catch(() => ({ json: () => ({ companies: [] }) })),
        fetch('/api/projects').catch(() => ({ json: () => ({ projects: [] }) })),
        fetch('/api/activities').catch(() => ({ json: () => ({ activities: [] }) })),
        fetch('/api/disciplines').catch(() => ({ json: () => ({ disciplines: [] }) })),
        fetch('/api/leads/sources').catch(() => ({ json: () => ({ sources: [] }) }))
      ]);

      const [users, companies, projects, activities, disciplines, leadSources] = await Promise.all([
        usersRes.json(),
        companiesRes.json(),
        projectsRes.json(),
        activitiesRes.json(),
        disciplinesRes.json(),
        leadSourcesRes.json()
      ]);

      setStats({
        users: users.users?.length || 0,
        companies: companies.companies?.length || 0,
        projects: projects.projects?.length || 0,
        activities: activities.activities?.length || 0,
        disciplines: disciplines.disciplines?.length || 0,
        leadSources: leadSources.sources?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const masterItems = [
    {
      title: 'Users',
      description: 'Manage system users, roles and permissions',
      icon: Users,
      href: '/dashboard/masters/users',
      count: stats.users,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      title: 'Companies',
      description: 'Manage company information and details',
      icon: Building2,
      href: '/dashboard/companies',
      count: stats.companies,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      title: 'Projects',
      description: 'Manage project templates and categories',
      icon: FolderOpen,
      href: '/dashboard/masters/projects',
      count: stats.projects,
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-500'
    },
    {
      title: 'Activities',
      description: 'Manage activity types and templates',
      icon: Activity,
      href: '/dashboard/masters/activities',
      count: stats.activities,
      color: 'bg-orange-50 text-orange-600',
      bgColor: 'bg-orange-500'
    },
    {
      title: 'Disciplines',
      description: 'Manage project disciplines and categories',
      icon: Target,
      href: '/dashboard/masters/disciplines',
      count: stats.disciplines,
      color: 'bg-pink-50 text-pink-600',
      bgColor: 'bg-pink-500'
    },
    {
      title: 'Lead Sources',
      description: 'Manage lead sources and channels',
      icon: Hash,
      href: '/dashboard/masters/lead-sources',
      count: stats.leadSources,
      color: 'bg-indigo-50 text-indigo-600',
      bgColor: 'bg-indigo-500'
    }
  ];

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
      <Navbar user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Database className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Master Data</h1>
              <p className="text-gray-600">Manage system configuration and reference data</p>
            </div>
          </div>
        </div>

        {/* Master Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {masterItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${item.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {isLoading ? (
                          <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          item.count
                        )}
                      </div>
                      <div className="text-sm text-gray-500">Total</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      Manage {item.title}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
                
                {/* Bottom accent bar */}
                <div className={`h-1 ${item.bgColor}`}></div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/users/new"
              className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Add User</span>
            </Link>
            
            <Link 
              href="/dashboard/companies/add"
              className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <Building2 className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Add Company</span>
            </Link>
            
            <Link 
              href="/dashboard/projects/new"
              className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <FolderOpen className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">New Project</span>
            </Link>
            
            <Link 
              href="/dashboard/activities/new"
              className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <Activity className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">New Activity</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
