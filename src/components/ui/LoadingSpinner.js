'use client';

import { layoutStyles } from '../../styles/componentStyles';

export default function LoadingSpinner() {
  return (
    <div className={`${layoutStyles.container} flex items-center justify-center`}>
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#64126D] to-[#86288F] flex items-center justify-center animate-pulse">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    </div>
  );
}
