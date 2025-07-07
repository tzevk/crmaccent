'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, RefreshCw, Key } from 'lucide-react';

export default function ProductionPermissionsFixer() {
  const [status, setStatus] = useState('checking');
  const [authToken, setAuthToken] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const [projectsData, setProjectsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Try to get existing token from localStorage
    if (typeof window !== 'undefined') {
      const existingToken = localStorage.getItem('authToken');
      if (existingToken) {
        setAuthToken(existingToken);
        checkPermissions(existingToken);
      }
    }
  }, []);

  const generateProductionToken = async () => {
    try {
      setStatus('generating');
      setError(null);

      const response = await fetch('/api/auth/production-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setAuthToken(data.token);
        // Store in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userId', data.user.id.toString());
        }
        setStatus('token-generated');
        
        // Automatically check permissions with new token
        await checkPermissions(data.token);
      } else {
        throw new Error(data.message || 'Failed to generate token');
      }
    } catch (error) {
      console.error('Token generation error:', error);
      setError(error.message);
      setStatus('error');
    }
  };

  const checkPermissions = async (token = authToken) => {
    try {
      setStatus('checking-permissions');
      setError(null);

      // Check production permissions
      const permResponse = await fetch('/api/debug/permissions-production', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const permData = await permResponse.json();
      setDebugInfo(permData);

      if (permData.success) {
        // Try to fetch projects
        await fetchProjects(token);
        setStatus('success');
      } else {
        throw new Error(permData.message || 'Permission check failed');
      }
    } catch (error) {
      console.error('Permission check error:', error);
      setError(error.message);
      setStatus('error');
    }
  };

  const fetchProjects = async (token = authToken) => {
    try {
      // Try production projects API first
      let response = await fetch('/api/projects/production', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Fallback to regular projects API
        response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      const data = await response.json();
      setProjectsData(data);
    } catch (error) {
      console.error('Projects fetch error:', error);
      setProjectsData({ error: error.message });
    }
  };

  const testProjectsPage = () => {
    if (typeof window !== 'undefined') {
      window.open('/dashboard/projects', '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Production Permissions Fixer</h1>
        </div>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {status === 'checking' && <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />}
              {status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {status === 'generating' && <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />}
              {status === 'token-generated' && <Key className="w-5 h-5 text-green-600" />}
              
              <span className="font-medium text-gray-900">
                {status === 'checking' && 'Checking permissions...'}
                {status === 'success' && 'Permissions working correctly!'}
                {status === 'error' && 'Error detected'}
                {status === 'generating' && 'Generating production token...'}
                {status === 'token-generated' && 'Token generated successfully'}
                {status === 'checking-permissions' && 'Verifying permissions...'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={generateProductionToken}
              disabled={status === 'generating'}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Key className="w-4 h-4" />
              Generate Production Token
            </button>

            <button
              onClick={() => checkPermissions()}
              disabled={!authToken || status === 'checking-permissions'}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Check Permissions
            </button>

            <button
              onClick={testProjectsPage}
              disabled={status !== 'success'}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Shield className="w-4 h-4" />
              Test Projects Page
            </button>
          </div>

          {/* Current Token */}
          {authToken && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Current Auth Token:</h3>
              <code className="text-xs text-blue-800 break-all block bg-blue-100 p-2 rounded">
                {authToken}
              </code>
            </div>
          )}

          {/* Debug Info */}
          {debugInfo && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Debug Information:</h3>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Projects Data */}
          {projectsData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Projects API Response:</h3>
              <pre className="text-xs text-green-800 overflow-auto max-h-40">
                {JSON.stringify(projectsData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="font-medium text-yellow-900 mb-3">Instructions for Vercel:</h2>
        <ol className="list-decimal list-inside space-y-2 text-yellow-800 text-sm">
          <li>First, click "Generate Production Token" to create a valid JWT token</li>
          <li>Then click "Check Permissions" to verify the authentication is working</li>
          <li>If successful, click "Test Projects Page" to open the projects page</li>
          <li>If you see projects, the fix worked! If not, check the debug information above</li>
          <li>Make sure your Vercel environment variables are set correctly:
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
              <li>JWT_SECRET</li>
              <li>DB_HOST, DB_NAME, DB_USER, DB_PASSWORD (if using database)</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
}
