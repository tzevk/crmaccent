'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  UserPlus, 
  Target, 
  TrendingUp, 
  FileText,
  Plus,
  ArrowRight,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Briefcase,
  Phone,
  Mail,
  Building,
  Settings,
  Bell,
  Search
} from 'lucide-react';

// Import components
import Navbar from '../../components/navigation/Navbar.jsx';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      router.push('/');
    }

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [router]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #faf7ff 0%, #f3e8ff 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: '#F5F5F5 100%'
    }}>
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Header with Time */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: '#64126D' }}>
                Welcome back, {user.name || 'User'}!
              </h1>
              <p className="text-lg" style={{ color: '#86288F' }}>
                Here's what's happening with your business today
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-right">
              <div className="text-2xl font-bold" style={{ color: '#64126D' }}>
                {formatTime(currentTime)}
              </div>
              <div className="text-sm" style={{ color: '#86288F' }}>
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Leads */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
               style={{ borderLeftColor: '#64126D' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#86288F' }}>Total Leads</p>
                <p className="text-3xl font-bold" style={{ color: '#64126D' }}>0</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Ready for data</span>
                </div>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                <Target className="w-8 h-8" style={{ color: '#64126D' }} />
              </div>
            </div>
          </div>

          {/* Active Deals */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
               style={{ borderLeftColor: '#86288F' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#86288F' }}>Active Deals</p>
                <p className="text-3xl font-bold" style={{ color: '#64126D' }}>0</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-500">In pipeline</span>
                </div>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                <Briefcase className="w-8 h-8" style={{ color: '#86288F' }} />
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
               style={{ borderLeftColor: '#a855f7' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#86288F' }}>Monthly Revenue</p>
                <p className="text-3xl font-bold" style={{ color: '#64126D' }}>₹0</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-500">This month</span>
                </div>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl" 
               style={{ borderLeftColor: '#c084fc' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#86288F' }}>Conversion Rate</p>
                <p className="text-3xl font-bold" style={{ color: '#64126D' }}>0%</p>
                <div className="flex items-center mt-2">
                  <BarChart3 className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-sm text-purple-500">This quarter</span>
                </div>
              </div>
              <div className="p-4 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                <TrendingUp className="w-8 h-8" style={{ color: '#c084fc' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: '#64126D' }}>Quick Actions</h3>
                <Settings className="w-5 h-5" style={{ color: '#86288F' }} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/dashboard/leads/add" className="group">
                  <div className="p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-md" 
                       style={{ borderColor: '#e2d5f3' }}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                        <Plus className="w-5 h-5" style={{ color: '#64126D' }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#64126D' }}>Add New Lead</p>
                        <p className="text-sm" style={{ color: '#86288F' }}>Create a new lead entry</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/leads" className="group">
                  <div className="p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-md" 
                       style={{ borderColor: '#e2d5f3' }}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                        <Target className="w-5 h-5" style={{ color: '#64126D' }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#64126D' }}>View All Leads</p>
                        <p className="text-sm" style={{ color: '#86288F' }}>Manage your lead pipeline</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/leads/pipeline" className="group">
                  <div className="p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-md" 
                       style={{ borderColor: '#e2d5f3' }}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                        <BarChart3 className="w-5 h-5" style={{ color: '#64126D' }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#64126D' }}>Sales Pipeline</p>
                        <p className="text-sm" style={{ color: '#86288F' }}>Visual pipeline view</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/users" className="group">
                  <div className="p-4 rounded-lg border-2 border-dashed transition-all duration-300 hover:shadow-md" 
                       style={{ borderColor: '#e2d5f3' }}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full" style={{ backgroundColor: '#f3e8ff' }}>
                        <Users className="w-5 h-5" style={{ color: '#64126D' }} />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: '#64126D' }}>User Management</p>
                        <p className="text-sm" style={{ color: '#86288F' }}>Manage team access</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Today's Tasks */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#64126D' }}>Today's Tasks</h3>
              <Calendar className="w-5 h-5" style={{ color: '#86288F' }} />
            </div>
            <div className="space-y-4">
              <div className="flex items-center p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <Clock className="w-4 h-4 mr-3" style={{ color: '#86288F' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#64126D' }}>Follow up with leads</p>
                  <p className="text-xs" style={{ color: '#86288F' }}>High priority</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <CheckCircle className="w-4 h-4 mr-3" style={{ color: '#86288F' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#64126D' }}>Review pipeline</p>
                  <p className="text-xs" style={{ color: '#86288F' }}>Medium priority</p>
                </div>
              </div>
              <div className="flex items-center p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <Phone className="w-4 h-4 mr-3" style={{ color: '#86288F' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#64126D' }}>Schedule client calls</p>
                  <p className="text-xs" style={{ color: '#86288F' }}>Low priority</p>
                </div>
              </div>
              <Link href="/dashboard/daily/my-tasks" 
                    className="block w-full text-center py-2 rounded-lg transition-all duration-200 hover:shadow-md" 
                    style={{ backgroundColor: '#f3e8ff', color: '#64126D' }}>
                View All Tasks
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#64126D' }}>Recent Activity</h3>
              <Bell className="w-5 h-5" style={{ color: '#86288F' }} />
            </div>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: '#c084fc' }} />
                <p className="text-gray-500">No recent activity to display</p>
                <p className="text-sm text-gray-400 mt-1">Activity will appear as you use the system</p>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: '#64126D' }}>System Status</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium" style={{ color: '#64126D' }}>Database</span>
                </div>
                <span className="text-sm text-green-500">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium" style={{ color: '#64126D' }}>API Services</span>
                </div>
                <span className="text-sm text-green-500">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#faf7ff' }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium" style={{ color: '#64126D' }}>Integration</span>
                </div>
                <span className="text-sm text-yellow-500">Setup Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
