import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BarChart3, Activity } from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SystemAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [overviewData, trendsData, performanceData] = await Promise.all([
        adminService.getSystemOverview(),
        adminService.getUsageTrends(timeRange),
        adminService.getPerformanceMetrics(timeRange)
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
      setPerformance(performanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (dailyData) => {
    if (!dailyData) return [];
    
    return dailyData.map(item => ({
      date: `${item._id.month}/${item._id.day}`,
      analyses: item.count,
      completed: item.completed,
      failed: item.failed,
      users: item.new_users || 0
    }));
  };

  const analysisStatusData = overview ? [
    { name: 'Completed', value: overview.analyses.completed, color: '#10b981' },
    { name: 'Failed', value: overview.analyses.failed, color: '#ef4444' },
    { name: 'Processing', value: overview.analyses.processing, color: '#f59e0b' }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadAnalyticsData} className="btn-primary">
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
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600">Usage trends and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="input-field w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-50 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.users?.total || 0}</p>
              <p className="text-xs text-green-600">+{overview?.users?.recent_24h || 0} today</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-50 text-green-600">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Analyses</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.analyses?.total || 0}</p>
              <p className="text-xs text-green-600">+{overview?.analyses?.recent_24h || 0} today</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.analyses?.success_rate || 0}%</p>
              <p className="text-xs text-gray-500">Overall</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
              <Activity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{overview?.users?.active || 0}</p>
              <p className="text-xs text-gray-500">Currently active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Analyses Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Analyses</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formatChartData(trends?.daily_analyses)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="analyses" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Analysis Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysisStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analysisStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatChartData(trends?.daily_users)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Users</span>
              <span className="font-medium">{overview?.users?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Users</span>
              <span className="font-medium text-green-600">{overview?.users?.active || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admin Users</span>
              <span className="font-medium text-primary-600">{overview?.users?.admins || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Users (24h)</span>
              <span className="font-medium text-blue-600">{overview?.users?.recent_24h || 0}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Analyses</span>
              <span className="font-medium">{overview?.analyses?.total || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-medium text-green-600">{overview?.analyses?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failed</span>
              <span className="font-medium text-red-600">{overview?.analyses?.failed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Processing</span>
              <span className="font-medium text-yellow-600">{overview?.analyses?.processing || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {performance && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {performance.performance?.avg_processing_time ? 
                  `${Math.round(performance.performance.avg_processing_time)}s` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Avg Processing Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {performance.performance?.success_rate ? 
                  `${Math.round(performance.performance.success_rate * 100)}%` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {performance.user_engagement?.active_users || 0}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {performance.user_engagement?.avg_sessions_per_user ? 
                  Math.round(performance.user_engagement.avg_sessions_per_user) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Avg Sessions/User</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
