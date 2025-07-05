'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Import components
import Navbar from '../../components/navigation/Navbar';
import WelcomeHeader from '../../components/layout/WelcomeHeader';
import PageHeader from '../../components/layout/PageHeader';
import DashboardOverview from '../../components/dashboard/DashboardOverview';
import SubMenuPage from '../../components/layout/SubMenuPage';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { layoutStyles } from '../../styles/componentStyles';

// Import navigation configuration
import { navigationItems, getCurrentPageFromPath, handleNavigation } from '../../config/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authMode = localStorage.getItem('authMode');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Log authentication info
      console.log('Dashboard loaded - User authenticated:', parsedUser.username);
      console.log('Authentication mode:', authMode || 'unknown');
    } else {
      // If no valid authentication, redirect to login
      console.log('No valid authentication found, redirecting to signin...');
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authMode');
    
    console.log('User logged out, redirecting to signin...');
    router.push('/');
  };

  const handleNavigationClick = (href, title) => {
    handleNavigation(router, href, setCurrentPage);
  };

  // Navigation data - using shared configuration
  // const navigationItems is now imported from config/navigation.js

  // Render content based on current page
  const renderContent = () => {
    if (currentPage === 'dashboard') {
      return <DashboardOverview />;
    }
    return <SubMenuPage currentPage={currentPage} onNavigate={handleNavigationClick} />;
  };

  // Show loading spinner while user data is being loaded
  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className={layoutStyles.container}>
      {/* Navbar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout}
        navigationItems={navigationItems}
        onNavigate={handleNavigationClick}
        currentPage={currentPage}
      />

      {/* Main Content */}
      <main className={layoutStyles.main}>
        {/* Welcome Header for Dashboard */}
        {currentPage === 'dashboard' && <WelcomeHeader user={user} />}
        
        {/* Page Header for Submenu Pages */}
        {currentPage !== 'dashboard' && (
          <PageHeader currentPage={currentPage} onNavigate={handleNavigation} />
        )}

        {/* Content */}
        {renderContent()}
      </main>
    </div>
  );
}
