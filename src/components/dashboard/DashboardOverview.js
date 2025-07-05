'use client';

import DashboardStats from './DashboardStats';
import RecentLeads from './RecentLeads';
import RecentProjects from './RecentProjects';

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      {/* Dashboard Overview Cards */}
      <DashboardStats />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentLeads />
        <RecentProjects />
      </div>
    </div>
  );
}
