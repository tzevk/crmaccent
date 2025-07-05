'use client';

import { layoutStyles, textStyles } from '../../styles/componentStyles';

export default function WelcomeHeader({ user }) {
  return (
    <div className={layoutStyles.welcomeHeader}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className={textStyles.heading}>
            Welcome back, {user.first_name}! 👋
          </h1>
          <p className={textStyles.description}>Here&apos;s what&apos;s happening with your CRM today.</p>
        </div>
        <div className="hidden lg:block">
          <div className="flex items-center space-x-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-blue-600">Tasks Today</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-green-600">Meetings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
