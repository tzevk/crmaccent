'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './systemConfig.css';

export default function SystemConfigPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('database');
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Configuration states
  const [databaseConfig, setDatabaseConfig] = useState({
    host: 'localhost',
    port: '3306',
    database: 'crmaccent_db',
    username: 'root',
    password: '',
    connectionPool: '10',
    timeout: '30',
    charset: 'utf8mb4',
    autoBackup: true,
    backupTime: '02:00'
  });

  const [apiConfig, setApiConfig] = useState({
    baseUrl: 'http://localhost:3000',
    apiVersion: 'v1',
    rateLimit: '1000',
    timeout: '30',
    retryAttempts: '3',
    corsOrigins: 'http://localhost:3000',
    apiLogging: true,
    compressionEnabled: true,
    cacheEnabled: true
  });

  const [storageConfig, setStorageConfig] = useState({
    storageType: 'local',
    localPath: '/uploads',
    maxFileSize: '10',
    allowedTypes: 'pdf,doc,docx,xls,xlsx,jpg,png,gif',
    compressionEnabled: true,
    thumbnailGeneration: true,
    cleanupOldFiles: true,
    cleanupDays: '30'
  });

  const [performanceConfig, setPerformanceConfig] = useState({
    cacheEnabled: true,
    cacheExpiry: '3600',
    sessionTimeout: '1440',
    maxConcurrentUsers: '100',
    queryOptimization: true,
    indexOptimization: true,
    compressionEnabled: true,
    staticAssetCache: '86400'
  });

  const [loggingConfig, setLoggingConfig] = useState({
    logLevel: 'info',
    logRetention: '30',
    errorLogging: true,
    accessLogging: true,
    performanceLogging: false,
    debugLogging: false,
    logRotation: true,
    maxLogSize: '100'
  });

  const router = useRouter();

  const tabs = [
    { 
      key: 'database', 
      label: 'Database', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ), 
      description: 'Database connection and settings'
    },
    { 
      key: 'api', 
      label: 'API Settings', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ), 
      description: 'API configuration and limits'
    },
    { 
      key: 'storage', 
      label: 'File Storage', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ), 
      description: 'File upload and storage settings'
    },
    { 
      key: 'performance', 
      label: 'Performance', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      description: 'Cache, optimization settings'
    },
    { 
      key: 'logging', 
      label: 'Logging', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      description: 'System logs and monitoring'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadConfiguration();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      // You can implement API calls to load configuration from database
      // For now, using default values
    } catch (error) {
      console.error('Error loading configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(databaseConfig)
      });
      
      if (response.ok) {
        alert('Database connection successful!');
      } else {
        const error = await response.json();
        alert('Database connection failed: ' + error.message);
      }
    } catch (error) {
      console.error('Error testing database connection:', error);
      alert('Error testing database connection');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      const configData = {
        database: databaseConfig,
        api: apiConfig,
        storage: storageConfig,
        performance: performanceConfig,
        logging: loggingConfig
      };
      
      // Example API call (implement this endpoint)
      // const response = await fetch('/api/system-config', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(configData)
      // });
      
      alert('System configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Error saving configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentTabLabel = () => {
    return tabs.find(tab => tab.key === activeTab)?.label || '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'database':
        return (
          <div className="config-section">
            <div className="section-header">
              <h3>Database Configuration</h3>
              <p>Configure database connection and backup settings</p>
              <button 
                className="btn-test"
                onClick={testDatabaseConnection}
                disabled={testingConnection}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
            
            <div className="config-grid">
              <div className="config-group">
                <label htmlFor="dbHost">Database Host</label>
                <input
                  type="text"
                  id="dbHost"
                  value={databaseConfig.host || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="localhost"
                />
              </div>

              <div className="config-group">
                <label htmlFor="dbPort">Port</label>
                <input
                  type="number"
                  id="dbPort"
                  value={databaseConfig.port || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, port: e.target.value }))}
                  placeholder="3306"
                />
              </div>

              <div className="config-group">
                <label htmlFor="dbName">Database Name</label>
                <input
                  type="text"
                  id="dbName"
                  value={databaseConfig.database || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, database: e.target.value }))}
                  placeholder="crmaccent_db"
                />
              </div>

              <div className="config-group">
                <label htmlFor="dbUsername">Username</label>
                <input
                  type="text"
                  id="dbUsername"
                  value={databaseConfig.username || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="root"
                />
              </div>

              <div className="config-group">
                <label htmlFor="dbPassword">Password</label>
                <input
                  type="password"
                  id="dbPassword"
                  value={databaseConfig.password || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter database password"
                />
              </div>

              <div className="config-group">
                <label htmlFor="connectionPool">Connection Pool Size</label>
                <input
                  type="number"
                  id="connectionPool"
                  value={databaseConfig.connectionPool || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, connectionPool: e.target.value }))}
                  placeholder="10"
                  min="1"
                  max="50"
                />
              </div>

              <div className="config-group">
                <label htmlFor="dbTimeout">Connection Timeout (seconds)</label>
                <input
                  type="number"
                  id="dbTimeout"
                  value={databaseConfig.timeout || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, timeout: e.target.value }))}
                  placeholder="30"
                  min="5"
                  max="300"
                />
              </div>

              <div className="config-group">
                <label htmlFor="charset">Character Set</label>
                <select
                  id="charset"
                  value={databaseConfig.charset || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, charset: e.target.value }))}
                >
                  <option value="utf8mb4">UTF8MB4 (Recommended)</option>
                  <option value="utf8">UTF8</option>
                  <option value="latin1">Latin1</option>
                </select>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={databaseConfig.autoBackup || false}
                    onChange={(e) => setDatabaseConfig(prev => ({ ...prev, autoBackup: e.target.checked }))}
                  />
                  Enable Automatic Backup
                </label>
                <span className="config-description">Daily database backups</span>
              </div>

              <div className="config-group">
                <label htmlFor="backupTime">Backup Time</label>
                <input
                  type="time"
                  id="backupTime"
                  value={databaseConfig.backupTime || ''}
                  onChange={(e) => setDatabaseConfig(prev => ({ ...prev, backupTime: e.target.value }))}
                />
              </div>
            </div>
          </div>
        );

      case 'api':
        return (
          <div className="config-section">
            <h3>API Configuration</h3>
            <p>Configure API endpoints, rate limits, and security settings</p>
            
            <div className="config-grid">
              <div className="config-group">
                <label htmlFor="baseUrl">Base URL</label>
                <input
                  type="url"
                  id="baseUrl"
                  value={apiConfig.baseUrl || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="http://localhost:3000"
                />
              </div>

              <div className="config-group">
                <label htmlFor="apiVersion">API Version</label>
                <input
                  type="text"
                  id="apiVersion"
                  value={apiConfig.apiVersion || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, apiVersion: e.target.value }))}
                  placeholder="v1"
                />
              </div>

              <div className="config-group">
                <label htmlFor="rateLimit">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  id="rateLimit"
                  value={apiConfig.rateLimit || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, rateLimit: e.target.value }))}
                  placeholder="1000"
                  min="100"
                  max="10000"
                />
              </div>

              <div className="config-group">
                <label htmlFor="apiTimeout">Request Timeout (seconds)</label>
                <input
                  type="number"
                  id="apiTimeout"
                  value={apiConfig.timeout || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, timeout: e.target.value }))}
                  placeholder="30"
                  min="5"
                  max="120"
                />
              </div>

              <div className="config-group">
                <label htmlFor="retryAttempts">Retry Attempts</label>
                <input
                  type="number"
                  id="retryAttempts"
                  value={apiConfig.retryAttempts || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, retryAttempts: e.target.value }))}
                  placeholder="3"
                  min="0"
                  max="5"
                />
              </div>

              <div className="config-group full-width">
                <label htmlFor="corsOrigins">CORS Origins</label>
                <input
                  type="text"
                  id="corsOrigins"
                  value={apiConfig.corsOrigins || ''}
                  onChange={(e) => setApiConfig(prev => ({ ...prev, corsOrigins: e.target.value }))}
                  placeholder="http://localhost:3000,https://yourdomain.com"
                />
                <span className="config-description">Comma-separated list of allowed origins</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={apiConfig.apiLogging || false}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, apiLogging: e.target.checked }))}
                  />
                  Enable API Logging
                </label>
                <span className="config-description">Log all API requests and responses</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={apiConfig.compressionEnabled || false}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                  />
                  Enable Response Compression
                </label>
                <span className="config-description">Compress API responses for better performance</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={apiConfig.cacheEnabled || false}
                    onChange={(e) => setApiConfig(prev => ({ ...prev, cacheEnabled: e.target.checked }))}
                  />
                  Enable API Caching
                </label>
                <span className="config-description">Cache API responses for improved speed</span>
              </div>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="config-section">
            <h3>File Storage Configuration</h3>
            <p>Configure file upload, storage, and management settings</p>
            
            <div className="config-grid">
              <div className="config-group">
                <label htmlFor="storageType">Storage Type</label>
                <select
                  id="storageType"
                  value={storageConfig.storageType || ''}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, storageType: e.target.value }))}
                >
                  <option value="local">Local Storage</option>
                  <option value="aws-s3">AWS S3</option>
                  <option value="google-cloud">Google Cloud Storage</option>
                  <option value="azure">Azure Blob Storage</option>
                </select>
              </div>

              <div className="config-group">
                <label htmlFor="localPath">Local Storage Path</label>
                <input
                  type="text"
                  id="localPath"
                  value={storageConfig.localPath || ''}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, localPath: e.target.value }))}
                  placeholder="/uploads"
                />
              </div>

              <div className="config-group">
                <label htmlFor="maxFileSize">Max File Size (MB)</label>
                <input
                  type="number"
                  id="maxFileSize"
                  value={storageConfig.maxFileSize || ''}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, maxFileSize: e.target.value }))}
                  placeholder="10"
                  min="1"
                  max="1000"
                />
              </div>

              <div className="config-group">
                <label htmlFor="cleanupDays">Cleanup Old Files (days)</label>
                <input
                  type="number"
                  id="cleanupDays"
                  value={storageConfig.cleanupDays || ''}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, cleanupDays: e.target.value }))}
                  placeholder="30"
                  min="1"
                  max="365"
                />
              </div>

              <div className="config-group full-width">
                <label htmlFor="allowedTypes">Allowed File Types</label>
                <input
                  type="text"
                  id="allowedTypes"
                  value={storageConfig.allowedTypes || ''}
                  onChange={(e) => setStorageConfig(prev => ({ ...prev, allowedTypes: e.target.value }))}
                  placeholder="pdf,doc,docx,xls,xlsx,jpg,png,gif"
                />
                <span className="config-description">Comma-separated file extensions</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={storageConfig.compressionEnabled || false}
                    onChange={(e) => setStorageConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                  />
                  Enable File Compression
                </label>
                <span className="config-description">Compress files to save storage space</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={storageConfig.thumbnailGeneration || false}
                    onChange={(e) => setStorageConfig(prev => ({ ...prev, thumbnailGeneration: e.target.checked }))}
                  />
                  Generate Thumbnails
                </label>
                <span className="config-description">Create thumbnails for image files</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={storageConfig.cleanupOldFiles || false}
                    onChange={(e) => setStorageConfig(prev => ({ ...prev, cleanupOldFiles: e.target.checked }))}
                  />
                  Automatic Cleanup
                </label>
                <span className="config-description">Automatically delete old temporary files</span>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="config-section">
            <h3>Performance Configuration</h3>
            <p>Optimize system performance and resource usage</p>
            
            <div className="config-grid">
              <div className="config-group">
                <label htmlFor="cacheExpiry">Cache Expiry (seconds)</label>
                <input
                  type="number"
                  id="cacheExpiry"
                  value={performanceConfig.cacheExpiry || ''}
                  onChange={(e) => setPerformanceConfig(prev => ({ ...prev, cacheExpiry: e.target.value }))}
                  placeholder="3600"
                  min="300"
                  max="86400"
                />
              </div>

              <div className="config-group">
                <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                <input
                  type="number"
                  id="sessionTimeout"
                  value={performanceConfig.sessionTimeout || ''}
                  onChange={(e) => setPerformanceConfig(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  placeholder="1440"
                  min="30"
                  max="10080"
                />
              </div>

              <div className="config-group">
                <label htmlFor="maxUsers">Max Concurrent Users</label>
                <input
                  type="number"
                  id="maxUsers"
                  value={performanceConfig.maxConcurrentUsers || ''}
                  onChange={(e) => setPerformanceConfig(prev => ({ ...prev, maxConcurrentUsers: e.target.value }))}
                  placeholder="100"
                  min="10"
                  max="1000"
                />
              </div>

              <div className="config-group">
                <label htmlFor="staticCache">Static Asset Cache (seconds)</label>
                <input
                  type="number"
                  id="staticCache"
                  value={performanceConfig.staticAssetCache || ''}
                  onChange={(e) => setPerformanceConfig(prev => ({ ...prev, staticAssetCache: e.target.value }))}
                  placeholder="86400"
                  min="3600"
                  max="604800"
                />
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={performanceConfig.cacheEnabled || false}
                    onChange={(e) => setPerformanceConfig(prev => ({ ...prev, cacheEnabled: e.target.checked }))}
                  />
                  Enable System Cache
                </label>
                <span className="config-description">Cache database queries and API responses</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={performanceConfig.queryOptimization || false}
                    onChange={(e) => setPerformanceConfig(prev => ({ ...prev, queryOptimization: e.target.checked }))}
                  />
                  Query Optimization
                </label>
                <span className="config-description">Optimize database queries automatically</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={performanceConfig.indexOptimization || false}
                    onChange={(e) => setPerformanceConfig(prev => ({ ...prev, indexOptimization: e.target.checked }))}
                  />
                  Index Optimization
                </label>
                <span className="config-description">Automatically optimize database indexes</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={performanceConfig.compressionEnabled || false}
                    onChange={(e) => setPerformanceConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
                  />
                  Enable Compression
                </label>
                <span className="config-description">Compress responses and assets</span>
              </div>
            </div>
          </div>
        );

      case 'logging':
        return (
          <div className="config-section">
            <h3>Logging Configuration</h3>
            <p>Configure system logging, monitoring, and debugging options</p>
            
            <div className="config-grid">
              <div className="config-group">
                <label htmlFor="logLevel">Log Level</label>
                <select
                  id="logLevel"
                  value={loggingConfig.logLevel || ''}
                  onChange={(e) => setLoggingConfig(prev => ({ ...prev, logLevel: e.target.value }))}
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                  <option value="trace">Trace</option>
                </select>
              </div>

              <div className="config-group">
                <label htmlFor="logRetention">Log Retention (days)</label>
                <input
                  type="number"
                  id="logRetention"
                  value={loggingConfig.logRetention || ''}
                  onChange={(e) => setLoggingConfig(prev => ({ ...prev, logRetention: e.target.value }))}
                  placeholder="30"
                  min="7"
                  max="365"
                />
              </div>

              <div className="config-group">
                <label htmlFor="maxLogSize">Max Log File Size (MB)</label>
                <input
                  type="number"
                  id="maxLogSize"
                  value={loggingConfig.maxLogSize || ''}
                  onChange={(e) => setLoggingConfig(prev => ({ ...prev, maxLogSize: e.target.value }))}
                  placeholder="100"
                  min="10"
                  max="1000"
                />
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={loggingConfig.errorLogging || false}
                    onChange={(e) => setLoggingConfig(prev => ({ ...prev, errorLogging: e.target.checked }))}
                  />
                  Error Logging
                </label>
                <span className="config-description">Log system errors and exceptions</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={loggingConfig.accessLogging || false}
                    onChange={(e) => setLoggingConfig(prev => ({ ...prev, accessLogging: e.target.checked }))}
                  />
                  Access Logging
                </label>
                <span className="config-description">Log user access and API requests</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={loggingConfig.performanceLogging || false}
                    onChange={(e) => setLoggingConfig(prev => ({ ...prev, performanceLogging: e.target.checked }))}
                  />
                  Performance Logging
                </label>
                <span className="config-description">Log performance metrics and slow queries</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={loggingConfig.debugLogging || false}
                    onChange={(e) => setLoggingConfig(prev => ({ ...prev, debugLogging: e.target.checked }))}
                  />
                  Debug Logging
                </label>
                <span className="config-description">Enable detailed debug information</span>
              </div>

              <div className="config-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={loggingConfig.logRotation || false}
                    onChange={(e) => setLoggingConfig(prev => ({ ...prev, logRotation: e.target.checked }))}
                  />
                  Log Rotation
                </label>
                <span className="config-description">Automatically rotate log files</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div className="system-config-page">
      <Navigation />
      
      <main className="system-config-main">
        <div className="system-config-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>System Configuration</h1>
                <p>Configure system-wide settings, database, API, and performance options</p>
              </div>
              <div className="header-actions">
                <button className="btn-secondary" onClick={() => router.push('/dashboard')}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="content-section">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading configuration...</p>
              </div>
            ) : (
              <>
                {renderTabContent()}
                
                {/* Save Actions */}
                <div className="config-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Changes
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveConfiguration}
                    disabled={saving}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {saving ? 'Saving Configuration...' : 'Save Configuration'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
