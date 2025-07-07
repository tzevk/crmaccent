"use client";

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ActivityForm from './ActivityForm';

const QuickActivityAdd = ({ 
  leadId = null, 
  projectId = null, 
  onSuccess = null,
  buttonText = "Add Activity",
  buttonClassName = "bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors",
  size = "md"
}) => {
  const { token } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (activityData) => {
    setSaving(true);
    try {
      // Determine the API endpoint based on context
      const endpoint = leadId ? '/api/leads/activities' : '/api/activities';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });

      if (response.ok) {
        setShowModal(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create activity');
      }
    } catch (error) {
      throw error; // Let ActivityForm handle the error display
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3'
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className={`${buttonClassName} ${sizeClasses[size]} flex items-center space-x-2`}
        disabled={saving}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Activity
                  {leadId && <span className="text-sm text-gray-500 ml-2">(For Lead)</span>}
                  {projectId && <span className="text-sm text-gray-500 ml-2">(For Project)</span>}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Activity Form */}
              <ActivityForm
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                leadId={leadId}
                projectId={projectId}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActivityAdd;
