import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Play, 
  Pause, 
  Square, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BulkOperationsPage() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalOperations, setTotalOperations] = useState(0);
  const operationsPerPage = 20;

  useEffect(() => {
    loadBulkOperations();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBulkOperations, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const loadBulkOperations = async () => {
    try {
      setLoading(true);
      const skip = currentPage * operationsPerPage;
      const data = await adminService.getBulkOperations(skip, operationsPerPage);
      setOperations(data);
      setTotalOperations(data.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOperation = async (bulkId) => {
    if (!window.confirm('Are you sure you want to cancel this operation?')) {
      return;
    }

    try {
      await adminService.cancelBulkOperation(bulkId);
      await loadBulkOperations();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <Square className="h-5 w-5 text-gray-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const calculateProgress = (operation) => {
    const total = operation.total_urls || 0;
    const completed = operation.completed || 0;
    const failed = operation.failed || 0;
    const processed = completed + failed;
    
    if (total === 0) return 0;
    return Math.round((processed / total) * 100);
  };

  if (loading && operations.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Bulk Operations</h1>
          <p className="text-gray-600">Monitor and manage bulk analysis operations</p>
        </div>
        <button
          onClick={loadBulkOperations}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Operations Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operation ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  URLs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((operation) => (
                <tr key={operation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {operation.bulk_id || operation.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      User: {operation.user_id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(operation.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(operation.status)}`}>
                        {operation.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateProgress(operation)}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {operation.completed || 0} completed, {operation.failed || 0} failed
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {operation.total_urls || 0} total
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatTimestamp(operation.created_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {operation.status === 'processing' && (
                        <button
                          onClick={() => handleCancelOperation(operation.bulk_id || operation.id)}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50"
                        >
                          <Square className="h-4 w-4" />
                          Cancel
                        </button>
                      )}
                      <button className="btn btn-outline btn-sm">
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {operations.length === 0 && !loading && (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bulk operations found</p>
          </div>
        )}

        {/* Pagination */}
        {totalOperations > operationsPerPage && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {currentPage * operationsPerPage + 1} to {Math.min((currentPage + 1) * operationsPerPage, totalOperations)} of {totalOperations} operations
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
                disabled={(currentPage + 1) * operationsPerPage >= totalOperations}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-semibold text-gray-900">
                {operations.filter(op => op.status === 'processing').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {operations.filter(op => op.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-50 text-red-600">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {operations.filter(op => op.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-50 text-gray-600">
              <Database className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {operations.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
