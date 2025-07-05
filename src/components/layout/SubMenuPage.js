'use client';

import { Card } from '../ui/Card';
import { textStyles, buttonStyles } from '../../styles/componentStyles';

export default function SubMenuPage({ currentPage, onNavigate }) {
  return (
    <Card className="p-8">
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#64126D] to-[#86288F] flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className={textStyles.pageHeading}>
          {currentPage.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Page
        </h2>
        <p className="text-gray-600 mb-6 text-lg">This page is under development.</p>
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 inline-block">
          <p className="text-sm text-gray-600">Current page: <code className="bg-white px-3 py-1 rounded-lg font-mono text-[#64126D] font-semibold">{currentPage}</code></p>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className={buttonStyles.primary}
        >
          ← Back to Dashboard
        </button>
      </div>
    </Card>
  );
}
