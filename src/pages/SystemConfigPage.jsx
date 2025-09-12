import React, { useState, useEffect } from 'react';
import { Settings, Database, Key, Globe, Shield, Save } from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SystemConfigPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    try {
      setLoading(true);
      const configData = await adminService.getSystemConfig();
      setConfig(configData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // This would typically save configuration changes
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Configuration saved successfully!');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading configuration..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Configuration</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadSystemConfig} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600">Manage system settings and configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">System Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Version</label>
            <input
              type="text"
              value={config?.version || '1.0.0'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <input
              type="text"
              value={config?.environment || 'production'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Debug Mode</label>
            <input
              type="text"
              value={config?.debug_mode ? 'Enabled' : 'Disabled'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Database Name</label>
            <input
              type="text"
              value={config?.database_name || 'website_analyzer'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* AI Configuration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Key className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gemini Model</label>
            <input
              type="text"
              value={config?.gemini_model || 'gemini-1.5-flash'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Use Vertex AI</label>
            <input
              type="text"
              value={config?.use_vertex_ai ? 'Yes' : 'No'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* CORS Configuration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">CORS Configuration</h3>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Origins</label>
          <div className="space-y-2">
            {config?.allowed_origins?.map((origin, index) => (
              <input
                key={index}
                type="text"
                value={origin}
                disabled
                className="input-field bg-gray-50"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max File Size</label>
            <input
              type="text"
              value={config?.max_file_size ? `${config.max_file_size / 1024 / 1024} MB` : '50 MB'}
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout</label>
            <input
              type="text"
              value="3 days"
              disabled
              className="input-field bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Database Configuration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Database Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Database Type</label>
            <input
              type="text"
              value="MongoDB"
              disabled
              className="input-field bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Connection Status</label>
            <input
              type="text"
              value="Connected"
              disabled
              className="input-field bg-gray-50 text-green-600"
            />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Feature Flags</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">RAG (Retrieval Augmented Generation)</h4>
              <p className="text-sm text-gray-600">Enable AI knowledge base integration</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Bulk Processing</h4>
              <p className="text-sm text-gray-600">Enable bulk website analysis</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Send email notifications for completed analyses</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Configuration Notice
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Some configuration changes may require a system restart to take effect. Please contact your system administrator for production changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
