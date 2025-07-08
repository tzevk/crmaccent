'use client';

import { cardStyles } from '../../styles/componentStyles';

export function Card({ children, className = '', hover = true, gradient = false }) {
  const cardClasses = `
    ${cardStyles.base}
    ${hover ? cardStyles.hover : ''}
    ${gradient ? cardStyles.gradient : ''}
    ${className}
  `;

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
}

export function StatsCard({ title, value, change, icon, gradient }) {
  return (
    <Card hover={true} className="group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          {change && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {change}
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
