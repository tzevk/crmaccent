'use client';

import { layoutStyles, textStyles, buttonStyles } from '../../styles/componentStyles';

export default function PageHeader({ currentPage, onNavigate }) {
  return (
    <div className={layoutStyles.pageTitle}>
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-3">
          <li>
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-gray-500 hover:text-[#64126D] transition-colors font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
              </svg>
              Dashboard
            </button>
          </li>
          <li>
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className={textStyles.breadcrumbText}>
              {currentPage.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  );
}
