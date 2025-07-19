import React, { useState, useRef, useEffect } from 'react';
import { Building2, Plus, X, Sparkles } from 'lucide-react';

const QuickAddCompany = ({ onCompanyAdded, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus on input when modal opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: companyName.trim(),
          // Set default empty values for other fields
          email: '',
          phone: '',
          city: '',
          website: '',
          industry: 'Other'
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onCompanyAdded(data.company);
          onClose();
        }, 800); // Brief success animation
      } else {
        setError(data.message || 'Failed to add company');
      }
    } catch (error) {
      console.error('Error adding company:', error);
      setError('Failed to add company');
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal */}
      <div className={`
        relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl
        rounded-2xl shadow-2xl border border-white/20
        w-full max-w-md transform transition-all duration-300
        ${success ? 'scale-105' : 'scale-100'}
      `}>
        
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-2xl"></div>
        
        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                {success && (
                  <div className="absolute -top-1 -right-1">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Quick Add Company
                </h2>
                <p className="text-sm text-gray-500">Add details later in company management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <p className="text-green-700 font-medium">Company added successfully!</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Company Name
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`
                    w-full px-4 py-3 bg-white/50 border-2 rounded-xl
                    focus:outline-none focus:border-purple-500 focus:bg-white/80
                    transition-all duration-200 placeholder-gray-400
                    ${error ? 'border-red-300' : 'border-gray-200'}
                  `}
                  placeholder="Enter company name..."
                  disabled={loading || success}
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors duration-200"
                disabled={loading || success}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !companyName.trim() || success}
                className={`
                  flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                  ${success 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : success ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Company
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pro tip */}
          <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
            <p className="text-xs text-gray-600 text-center">
              💡 <strong>Pro tip:</strong> You can add detailed company information later in the Company Management section
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddCompany;