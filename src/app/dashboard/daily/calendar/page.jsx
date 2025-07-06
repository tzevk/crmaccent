'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../../components/navigation/Navbar.jsx';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

export default function CalendarView() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Check authentication status
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      router.push('/');
    }
  }, [router]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Calendar View</h1>
          </div>
          <p className="text-gray-600">View and manage your schedule</p>
        </div>

        {/* Calendar Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
              <Plus size={16} />
              Add Event
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {daysOfWeek.map(day => (
              <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded-md">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 border border-gray-200 rounded-md ${
                  day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
                } transition-colors`}
              >
                {day && (
                  <div>
                    <div className={`text-sm font-medium mb-1 ${
                      day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() && 
                      currentDate.getFullYear() === new Date().getFullYear()
                        ? 'text-purple-600 bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center'
                        : 'text-gray-900'
                    }`}>
                      {day}
                    </div>
                    {/* Placeholder for events */}
                    <div className="space-y-1">
                      {/* Events will be displayed here */}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-center py-12">
            <Clock className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Calendar Integration</h3>
            <p className="text-gray-600 mb-6">Calendar functionality will be implemented here</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Event scheduling</p>
              <p>• Meeting management</p>
              <p>• Deadline tracking</p>
              <p>• Team coordination</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
