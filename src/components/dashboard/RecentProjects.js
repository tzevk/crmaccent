'use client';

import { Card } from '../ui/Card';
import { textStyles, buttonStyles } from '../../styles/componentStyles';

function ProjectItem({ name, company, progress, progressColor, bgColor, icon }) {
  return (
    <div className="group p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            <p className="text-sm text-gray-600">{company}</p>
          </div>
        </div>
        <span className={`text-sm ${progressColor} font-bold`}>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`bg-gradient-to-r ${bgColor} h-2.5 rounded-full transition-all duration-500`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function RecentProjects() {
  const projectsData = [
    {
      name: 'Website Redesign',
      company: 'TechCorp Inc.',
      progress: 75,
      progressColor: 'text-green-600',
      bgColor: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'Mobile App',
      company: 'StartupXYZ',
      progress: 45,
      progressColor: 'text-orange-600',
      bgColor: 'from-orange-500 to-red-500',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'CRM Integration',
      company: 'Design Studio',
      progress: 30,
      progressColor: 'text-blue-600',
      bgColor: 'from-blue-500 to-purple-600',
      icon: (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className={textStyles.subheading}>Recent Projects</h3>
        <button className={buttonStyles.secondary}>View all</button>
      </div>
      <div className="space-y-4">
        {projectsData.map((project, index) => (
          <ProjectItem key={index} {...project} />
        ))}
      </div>
    </Card>
  );
}
