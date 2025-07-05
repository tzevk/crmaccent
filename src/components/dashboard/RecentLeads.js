'use client';

import { Card } from '../ui/Card';
import { textStyles, buttonStyles } from '../../styles/componentStyles';

function LeadItem({ initials, name, company, status, statusColor, bgColor }) {
  return (
    <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 bg-gradient-to-br ${bgColor} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{name}</p>
          <p className="text-sm text-gray-600">{company}</p>
        </div>
      </div>
      <span className={`${statusColor} text-xs font-semibold px-3 py-1 rounded-full`}>
        {status}
      </span>
    </div>
  );
}

export default function RecentLeads() {
  const leadsData = [
    {
      initials: 'JS',
      name: 'John Smith',
      company: 'Tech Corp',
      status: 'Qualified',
      statusColor: 'bg-green-100 text-green-800',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      initials: 'SJ',
      name: 'Sarah Johnson',
      company: 'Design Studio',
      status: 'Follow-up',
      statusColor: 'bg-yellow-100 text-yellow-800',
      bgColor: 'from-pink-500 to-pink-600'
    },
    {
      initials: 'MD',
      name: 'Mike Davis',
      company: 'StartupXYZ',
      status: 'New',
      statusColor: 'bg-blue-100 text-blue-800',
      bgColor: 'from-green-500 to-green-600'
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className={textStyles.subheading}>Recent Leads</h3>
        <button className={buttonStyles.secondary}>View all</button>
      </div>
      <div className="space-y-4">
        {leadsData.map((lead, index) => (
          <LeadItem key={index} {...lead} />
        ))}
      </div>
    </Card>
  );
}
