import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SystemMonitoringPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cleanupLoading, setCleanupLoading] = useState(false);

  useEffect(() => {
    loadSystemHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemHealth = async () => {
    try {
      setLoading(true);
      const healthData = await adminService.getSystemHealth();
      setHealth(healthData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to run system cleanup? This will clean up stale processing jobs and old data.')) {
      return;
    }

    try {
      setCleanupLoading(true);
      const result = await adminService.cleanupSystem();
      alert(`Cleanup completed: ${result.stale_jobs_cleaned} stale jobs cleaned, ${result.rate_limits_cleaned} rate limits cleaned`);
      await loadSystemHealth();
    } catch (err) {
      setError(err.message);
    } finally {
      setCleanupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading system health..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading System Health</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadSystemHealth} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const StatusIcon = getStatusIcon(health?.system?.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
          <p className="text-gray-600">Real-time system health and performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadSystemHealth}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={handleCleanup}
            disabled={cleanupLoading}
            className="btn-danger flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {cleanupLoading ? 'Cleaning...' : 'Cleanup'}
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${getStatusColor(health?.system?.status)}`}>
              <StatusIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">System Status</h3>
              <p className="text-sm text-gray-600">Overall system health</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health?.system?.status)}`}>
              {health?.system?.status || 'Unknown'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Database className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Database Collections</p>
              <p className="text-2xl font-semibold text-gray-900">{health?.database?.collections || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users (24h)</p>
              <p className="text-2xl font-semibold text-gray-900">{health?.system?.active_users_24h || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Errors (24h)</p>
              <p className="text-2xl font-semibold text-gray-900">{health?.system?.recent_errors_24h || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stale Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">{health?.system?.stale_processing_jobs || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Database Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {health?.database?.collections || 0}
            </div>
            <div className="text-sm text-gray-600">Collections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {health?.database?.data_size ? `${(health.database.data_size / 1024 / 1024).toFixed(2)} MB` : '0 MB'}
            </div>
            <div className="text-sm text-gray-600">Data Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {health?.database?.indexes || 0}
            </div>
            <div className="text-sm text-gray-600">Indexes</div>
          </div>
        </div>
      </div>

      {/* System Health Details */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health Details</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Recent Errors (24h)</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              (health?.system?.recent_errors_24h || 0) > 10 
                ? 'bg-red-100 text-red-800' 
                : (health?.system?.recent_errors_24h || 0) > 5 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {health?.system?.recent_errors_24h || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Stale Processing Jobs</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              (health?.system?.stale_processing_jobs || 0) > 5 
                ? 'bg-red-100 text-red-800' 
                : (health?.system?.stale_processing_jobs || 0) > 2 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {health?.system?.stale_processing_jobs || 0}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Active Users (24h)</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {health?.system?.active_users_24h || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="text-center text-sm text-gray-500">
        <p>This page auto-refreshes every 30 seconds</p>
      </div>
    </div>
  );
}
