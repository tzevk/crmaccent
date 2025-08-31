'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../../components/navigation/Navigation';
import './settings.css';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  
  // Settings states
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'CRM Accent',
    companyEmail: 'admin@crmaccent.com',
    companyPhone: '+91 98765 43210',
    companyAddress: 'Mumbai, India',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    language: 'English'
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    emailSignature: '',
    autoEmailNotifications: true,
    emailTemplateHeader: '',
    emailTemplateFooter: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    leadNotifications: true,
    projectNotifications: true,
    proposalNotifications: true,
    employeeNotifications: false,
    reminderNotifications: true,
    systemNotifications: true,
    emailDigest: 'daily',
    reminderTime: '09:00'
  });

  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '24',
    passwordExpiry: '90',
    maxLoginAttempts: '5',
    twoFactorAuth: false,
    ipWhitelist: '',
    auditLogs: true,
    dataRetention: '365',
    backupFrequency: 'daily'
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    apiRateLimit: '1000',
    maxFileSize: '10',
    allowedFileTypes: 'pdf,doc,docx,xls,xlsx,jpg,png',
    databaseBackup: true,
    autoUpdates: false,
    errorReporting: true
  });

  const router = useRouter();

  const tabs = [
    { 
      key: 'general', 
      label: 'General', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ), 
      description: 'Company info, timezone, currency'
    },
    { 
      key: 'email', 
      label: 'Email Config', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ), 
      description: 'SMTP settings, templates'
    },
    { 
      key: 'notifications', 
      label: 'Notifications', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5-5 5-5h-5m-6 10V4h2m6 13v-3.586a1 1 0 01.293-.707l2.5-2.5a1 1 0 011.414 0l2.5 2.5a1 1 0 01.293.707V17" />
        </svg>
      ), 
      description: 'Email alerts, reminders'
    },
    { 
      key: 'security', 
      label: 'Security', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ), 
      description: 'Authentication, access control'
    },
    { 
      key: 'system', 
      label: 'System', 
      icon: (
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ), 
      description: 'System configuration, maintenance'
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      loadSettings();
    } else {
      router.push('/login');
    }
  }, [router]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // You can implement API calls to load settings from database
      // For now, using default values
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // Implement API call to save settings
      const settingsData = {
        general: generalSettings,
        email: emailSettings,
        notifications: notificationSettings,
        security: securitySettings,
        system: systemSettings
      };
      
      // Example API call (implement this endpoint)
      // const response = await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settingsData)
      // });
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getCurrentTabLabel = () => {
    return tabs.find(tab => tab.key === activeTab)?.label || '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="settings-section">
            <h3>General Settings</h3>
            <p>Configure basic company information and preferences</p>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  value={generalSettings.companyName || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="companyEmail">Company Email</label>
                <input
                  type="email"
                  id="companyEmail"
                  value={generalSettings.companyEmail || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyEmail: e.target.value }))}
                  placeholder="admin@company.com"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="companyPhone">Company Phone</label>
                <input
                  type="tel"
                  id="companyPhone"
                  value={generalSettings.companyPhone || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyPhone: e.target.value }))}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="companyAddress">Company Address</label>
                <input
                  type="text"
                  id="companyAddress"
                  value={generalSettings.companyAddress || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Enter company address"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={generalSettings.timezone || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>

              <div className="setting-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={generalSettings.currency || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="setting-group">
                <label htmlFor="dateFormat">Date Format</label>
                <select
                  id="dateFormat"
                  value={generalSettings.dateFormat || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="setting-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={generalSettings.language || ''}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी</option>
                  <option value="Marathi">मराठी</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="settings-section">
            <h3>Email Configuration</h3>
            <p>Configure SMTP settings and email templates</p>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label htmlFor="smtpServer">SMTP Server</label>
                <input
                  type="text"
                  id="smtpServer"
                  value={emailSettings.smtpServer || ''}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpServer: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="smtpPort">SMTP Port</label>
                <input
                  type="number"
                  id="smtpPort"
                  value={emailSettings.smtpPort || ''}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                  placeholder="587"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="smtpUsername">SMTP Username</label>
                <input
                  type="text"
                  id="smtpUsername"
                  value={emailSettings.smtpUsername || ''}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="smtpPassword">SMTP Password</label>
                <input
                  type="password"
                  id="smtpPassword"
                  value={emailSettings.smtpPassword || ''}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                  placeholder="Enter SMTP password"
                />
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={emailSettings.smtpSecure || false}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpSecure: e.target.checked }))}
                  />
                  Use Secure Connection (TLS/SSL)
                </label>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={emailSettings.autoEmailNotifications || false}
                    onChange={(e) => setEmailSettings(prev => ({ ...prev, autoEmailNotifications: e.target.checked }))}
                  />
                  Enable Automatic Email Notifications
                </label>
              </div>

              <div className="setting-group full-width">
                <label htmlFor="emailSignature">Email Signature</label>
                <textarea
                  id="emailSignature"
                  value={emailSettings.emailSignature || ''}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, emailSignature: e.target.value }))}
                  placeholder="Enter default email signature"
                  rows="3"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notification Settings</h3>
            <p>Configure notification preferences and alerts</p>
            
            <div className="settings-grid">
              <div className="notifications-group">
                <h4>Module Notifications</h4>
                
                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.leadNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, leadNotifications: e.target.checked }))}
                    />
                    Lead Notifications
                  </label>
                  <span className="setting-description">Get notified about new leads and updates</span>
                </div>

                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.projectNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, projectNotifications: e.target.checked }))}
                    />
                    Project Notifications
                  </label>
                  <span className="setting-description">Receive updates about project milestones</span>
                </div>

                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.proposalNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, proposalNotifications: e.target.checked }))}
                    />
                    Proposal Notifications
                  </label>
                  <span className="setting-description">Alerts for proposal status changes</span>
                </div>

                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.employeeNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, employeeNotifications: e.target.checked }))}
                    />
                    Employee Notifications
                  </label>
                  <span className="setting-description">HR and employee-related alerts</span>
                </div>
              </div>

              <div className="notifications-group">
                <h4>System Notifications</h4>
                
                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.reminderNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminderNotifications: e.target.checked }))}
                    />
                    Reminder Notifications
                  </label>
                  <span className="setting-description">Follow-up and task reminders</span>
                </div>

                <div className="setting-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemNotifications || false}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemNotifications: e.target.checked }))}
                    />
                    System Notifications
                  </label>
                  <span className="setting-description">System maintenance and updates</span>
                </div>

                <div className="setting-group">
                  <label htmlFor="emailDigest">Email Digest Frequency</label>
                  <select
                    id="emailDigest"
                    value={notificationSettings.emailDigest || ''}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailDigest: e.target.value }))}
                  >
                    <option value="never">Never</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label htmlFor="reminderTime">Default Reminder Time</label>
                  <input
                    type="time"
                    id="reminderTime"
                    value={notificationSettings.reminderTime || ''}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="settings-section">
            <h3>Security Settings</h3>
            <p>Configure authentication and security policies</p>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label htmlFor="sessionTimeout">Session Timeout (hours)</label>
                <input
                  type="number"
                  id="sessionTimeout"
                  value={securitySettings.sessionTimeout || ''}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))}
                  placeholder="24"
                  min="1"
                  max="168"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="passwordExpiry">Password Expiry (days)</label>
                <input
                  type="number"
                  id="passwordExpiry"
                  value={securitySettings.passwordExpiry || ''}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: e.target.value }))}
                  placeholder="90"
                  min="30"
                  max="365"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
                <input
                  type="number"
                  id="maxLoginAttempts"
                  value={securitySettings.maxLoginAttempts || ''}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, maxLoginAttempts: e.target.value }))}
                  placeholder="5"
                  min="3"
                  max="10"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="dataRetention">Data Retention (days)</label>
                <input
                  type="number"
                  id="dataRetention"
                  value={securitySettings.dataRetention || ''}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, dataRetention: e.target.value }))}
                  placeholder="365"
                  min="90"
                  max="2555"
                />
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorAuth || false}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                  />
                  Enable Two-Factor Authentication
                </label>
                <span className="setting-description">Require 2FA for all user accounts</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={securitySettings.auditLogs || false}
                    onChange={(e) => setSecuritySettings(prev => ({ ...prev, auditLogs: e.target.checked }))}
                  />
                  Enable Audit Logs
                </label>
                <span className="setting-description">Track user actions and system changes</span>
              </div>

              <div className="setting-group full-width">
                <label htmlFor="ipWhitelist">IP Whitelist</label>
                <textarea
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist || ''}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                  placeholder="Enter IP addresses (one per line)"
                  rows="3"
                />
                <span className="setting-description">Leave empty to allow all IPs</span>
              </div>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className="settings-section">
            <h3>System Configuration</h3>
            <p>Configure system-wide settings and maintenance options</p>
            
            <div className="settings-grid">
              <div className="setting-group">
                <label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  id="apiRateLimit"
                  value={systemSettings.apiRateLimit || ''}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, apiRateLimit: e.target.value }))}
                  placeholder="1000"
                  min="100"
                  max="10000"
                />
              </div>

              <div className="setting-group">
                <label htmlFor="maxFileSize">Max File Size (MB)</label>
                <input
                  type="number"
                  id="maxFileSize"
                  value={systemSettings.maxFileSize || ''}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                  placeholder="10"
                  min="1"
                  max="100"
                />
              </div>

              <div className="setting-group full-width">
                <label htmlFor="allowedFileTypes">Allowed File Types</label>
                <input
                  type="text"
                  id="allowedFileTypes"
                  value={systemSettings.allowedFileTypes || ''}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, allowedFileTypes: e.target.value }))}
                  placeholder="pdf,doc,docx,xls,xlsx,jpg,png"
                />
                <span className="setting-description">Comma-separated file extensions</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.maintenanceMode || false}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                  />
                  Maintenance Mode
                </label>
                <span className="setting-description">Temporarily disable system access</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.debugMode || false}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, debugMode: e.target.checked }))}
                  />
                  Debug Mode
                </label>
                <span className="setting-description">Enable detailed error logging</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.databaseBackup || false}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, databaseBackup: e.target.checked }))}
                  />
                  Automatic Database Backup
                </label>
                <span className="setting-description">Daily automated backups</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.autoUpdates || false}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, autoUpdates: e.target.checked }))}
                  />
                  Automatic Updates
                </label>
                <span className="setting-description">Install system updates automatically</span>
              </div>

              <div className="setting-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={systemSettings.errorReporting || false}
                    onChange={(e) => setSystemSettings(prev => ({ ...prev, errorReporting: e.target.checked }))}
                  />
                  Error Reporting
                </label>
                <span className="setting-description">Send error reports to development team</span>
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
    <div className="settings-page">
      <Navigation />
      
      <main className="settings-main">
        <div className="settings-container">
          {/* Header */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-info">
                <h1>System Settings</h1>
                <p>Configure system preferences, security, and integrations</p>
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
                <p>Loading settings...</p>
              </div>
            ) : (
              <>
                {renderTabContent()}
                
                {/* Save Actions */}
                <div className="settings-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Reset Changes
                  </button>
                  <button 
                    className="btn-primary"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {saving ? 'Saving Settings...' : 'Save Settings'}
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
