"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../ui/Loading';

const ActivityTimeline = ({ 
  leadId = null, 
  projectId = null, 
  limit = 10,
  showHeader = true,
  className = ""
}) => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, [leadId, projectId, token]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = '/api/leads/activities';
      const params = new URLSearchParams();
      
      if (leadId) {
        params.append('lead_id', leadId);
      }
      
      if (limit) {
        params.append('limit', limit);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setError('Failed to fetch activities');
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'call':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'meeting':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'note':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getActivityTypeColor = (activityType) => {
    switch (activityType) {
      case 'call':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'email':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'note':
        return 'bg-yellow-100 text-yellow-600 border-yellow-200';
      case 'task':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading activities..." />;
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <div className="text-red-600 text-sm">{error}</div>
        <button
          onClick={fetchActivities}
          className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {showHeader && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
          <p className="mt-1 text-sm text-gray-500">
            Recent activities and interactions
          </p>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
          <p className="mt-1 text-sm text-gray-500">
            No activities have been recorded yet.
          </p>
        </div>
      ) : (
        <div className="flow-root">
          <ul className="space-y-6">
            {activities.map((activity, index) => (
              <li key={activity.id} className="relative">
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute top-10 left-6 w-0.5 h-6 bg-gray-200"></div>
                )}
                
                <div className="relative flex items-start space-x-4">
                  {/* Activity icon */}
                  <div className={`relative flex h-12 w-12 flex-none items-center justify-center rounded-full border-2 ${getActivityTypeColor(activity.activity_type)}`}>
                    {getActivityIcon(activity.activity_type)}
                  </div>
                  
                  {/* Activity content */}
                  <div className="min-w-0 flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {activity.subject || `${activity.activity_type} activity`}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.activity_type)}`}>
                            {activity.activity_type}
                          </span>
                        </div>
                        <time className="text-xs text-gray-500">
                          {formatDate(activity.activity_date)}
                        </time>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {activity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          {activity.lead_name && (
                            <span>Lead: {activity.lead_name}</span>
                          )}
                          {activity.created_by_name && (
                            <span>By: {activity.created_by_name}</span>
                          )}
                        </div>
                        <span>
                          {new Date(activity.activity_date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activities.length >= limit && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              // TODO: Implement load more functionality
              console.log('Load more activities');
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View more activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
