import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Calendar,
  User
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SystemBackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const data = await adminService.listBackups();
      setBackups(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!window.confirm('Are you sure you want to create a new system backup?')) {
      return;
    }

    try {
      setCreatingBackup(true);
      setError('');
      setSuccessMessage('');
      
      const result = await adminService.createSystemBackup();
      setSuccessMessage(`Backup created successfully! Backup ID: ${result.backup_id}`);
      await loadBackups();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingBackup(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getBackupTypeIcon = (type) => {
    switch (type) {
      case 'full':
        return <Database className="h-5 w-5 text-blue-500" />;
      case 'incremental':
        return <HardDrive className="h-5 w-5 text-green-500" />;
      case 'metadata_only':
        return <Database className="h-5 w-5 text-yellow-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBackupTypeColor = (type) => {
    switch (type) {
      case 'full':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'incremental':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'metadata_only':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading && backups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Backup</h1>
          <p className="text-gray-600">Create and manage system backups</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBackups}
            className="btn btn-outline flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateBackup}
            disabled={creatingBackup}
            className="btn btn-primary flex items-center gap-2"
          >
            {creatingBackup ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            Create Backup
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Database className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Backups</p>
              <p className="text-2xl font-semibold text-gray-900">{backups.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-semibold text-gray-900">
                {backups.filter(b => b.backup_type !== 'failed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Latest Backup</p>
              <p className="text-sm text-gray-900">
                {backups.length > 0 ? formatTimestamp(backups[0].timestamp) : 'None'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <HardDrive className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">
                {backups.length > 0 ? backups[0].users_count : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Backup ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {backup.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getBackupTypeIcon(backup.backup_type)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getBackupTypeColor(backup.backup_type)}`}>
                        {backup.backup_type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {backup.users_count} users, {backup.analyses_count} analyses
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-1" />
                      {backup.created_by || 'System'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatTimestamp(backup.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="btn btn-outline btn-sm">
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                      <button className="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {backups.length === 0 && !loading && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No backups found</p>
            <p className="text-sm text-gray-400 mt-2">Create your first backup to get started</p>
          </div>
        )}
      </div>

      {/* Backup Information */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Backup Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backup Types</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Full Backup:</strong> Complete system backup including all data</li>
                <li><strong>Incremental:</strong> Backup of changes since last backup</li>
                <li><strong>Metadata Only:</strong> Backup of system configuration and metadata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Backup Schedule</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>Automatic:</strong> Daily at 2:00 AM UTC</li>
                <li><strong>Retention:</strong> 30 days for full backups</li>
                <li><strong>Storage:</strong> Local and cloud storage</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
