import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  User, 
  Clock, 
  Activity, 
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const skip = currentPage * logsPerPage;
      const data = await adminService.getAuditLogs(skip, logsPerPage);
      
      // Ensure data is an array
      const logsData = Array.isArray(data) ? data : [];
      setLogs(logsData);
      setTotalLogs(logsData.length);
    } catch (err) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleRefresh = () => {
    setCurrentPage(0);
    loadAuditLogs();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterAction || log.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action) => {
    switch (action) {
      case 'user_login':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'analysis_created':
        return <Activity className="h-4 w-4 text-green-500" />;
      case 'user_created':
        return <User className="h-4 w-4 text-purple-500" />;
      case 'user_updated':
        return <User className="h-4 w-4 text-yellow-500" />;
      case 'user_deleted':
        return <User className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'user_login':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'analysis_created':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'user_created':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'user_updated':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'user_deleted':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  if (loading && logs.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Monitor system activities and user actions</p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="input"
            >
              <option value="">All Actions</option>
              <option value="user_login">User Login</option>
              <option value="analysis_created">Analysis Created</option>
              <option value="user_created">User Created</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Logs Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getActionIcon(log.action)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getActionColor(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.user_email || 'System'}</div>
                    <div className="text-sm text-gray-500">ID: {log.user_id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.details}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audit logs found</p>
          </div>
        )}

        {/* Pagination */}
        {totalLogs > logsPerPage && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {currentPage * logsPerPage + 1} to {Math.min((currentPage + 1) * logsPerPage, totalLogs)} of {totalLogs} logs
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={(currentPage + 1) * logsPerPage >= totalLogs}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
