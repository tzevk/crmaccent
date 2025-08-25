'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-gradient">
      <div className="text-center">
        <div className="animate-spin spinner mx-auto mb-4" style={{
          width: '3rem',
          height: '3rem',
          border: '2px solid white',
          borderTopColor: 'transparent'
        }}></div>
        <p className="text-white">Loading CRM Accent...</p>
      </div>
    </div>
  );
}
