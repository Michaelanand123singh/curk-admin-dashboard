import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bug, 
  Search, 
  Filter, 
  RefreshCw,
  Download,
  Eye,
  Clock,
  User,
  Globe
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const logsPerPage = 20;

  useEffect(() => {
    loadErrorLogs();
  }, [currentPage, filterType]);

  const loadErrorLogs = async () => {
    try {
      setLoading(true);
      const skip = currentPage * logsPerPage;
      const data = await adminService.getErrorLogs(skip, logsPerPage);
      setLogs(data);
      setTotalLogs(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    loadErrorLogs();
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.url?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getErrorTypeIcon = (type) => {
    switch (type) {
      case 'analysis_failed':
        return <Bug className="h-4 w-4 text-red-500" />;
      case 'api_error':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'database_error':
        return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getErrorTypeColor = (type) => {
    switch (type) {
      case 'analysis_failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'api_error':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'database_error':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const truncateMessage = (message, maxLength = 100) => {
    if (!message) return 'No message';
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
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
          <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600">Monitor system errors and debugging information</p>
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
                placeholder="Search error messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="">All Error Types</option>
              <option value="analysis_failed">Analysis Failed</option>
              <option value="api_error">API Error</option>
              <option value="database_error">Database Error</option>
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
                  Error Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getErrorTypeIcon(log.type)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getErrorTypeColor(log.type)}`}>
                        {log.type.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {truncateMessage(log.message)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {log.url || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.user_id || 'System'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(log.timestamp)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No error logs found</p>
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

      {/* Error Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Error Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Error Type</label>
                  <div className="mt-1 flex items-center">
                    {getErrorTypeIcon(selectedLog.type)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getErrorTypeColor(selectedLog.type)}`}>
                      {selectedLog.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900">{selectedLog.message}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <Globe className="h-4 w-4 mr-1" />
                      {selectedLog.url || 'N/A'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-1" />
                      {selectedLog.user_id || 'System'}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <div className="mt-1 flex items-center text-sm text-gray-900">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimestamp(selectedLog.timestamp)}
                  </div>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Details</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
