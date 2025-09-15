import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Activity, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Send,
  MessageSquare
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, subtitle }) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    blue: 'bg-blue-50 text-blue-600'
  };

  return (
    <div className="card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [overview, setOverview] = useState(null);
  const [health, setHealth] = useState(null);
  const [emailStats, setEmailStats] = useState(null);
  const [meetingStats, setMeetingStats] = useState(null);
  const [contactStats, setContactStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewData, healthData, emailStatsData, meetingStatsData, contactStatsData] = await Promise.all([
        adminService.getSystemOverview(),
        adminService.getSystemHealth(),
        adminService.getEmailStatistics().catch(() => ({ success: false, data: {} })),
        adminService.getMeetingStatistics().catch(() => ({ success: false, data: {} })),
        adminService.getContactStats().catch(() => ({ success: false, data: {} }))
      ]);
      setOverview(overviewData);
      setHealth(healthData);
      setEmailStats(emailStatsData.success ? emailStatsData.data : {});
      setMeetingStats(meetingStatsData.success ? meetingStatsData.data : {});
      setContactStats(contactStatsData.success ? contactStatsData.data : {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadDashboardData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and key metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={overview?.users?.total || 0}
          icon={Users}
          color="primary"
          subtitle={`${overview?.users?.active || 0} active`}
        />
        <StatCard
          title="Total Analyses"
          value={overview?.analyses?.total || 0}
          icon={BarChart3}
          color="blue"
          subtitle={`${overview?.analyses?.success_rate || 0}% success rate`}
        />
        <StatCard
          title="Recent Activity"
          value={overview?.analyses?.recent_24h || 0}
          icon={Activity}
          color="green"
          subtitle="Last 24 hours"
        />
        <StatCard
          title="System Status"
          value={health?.system?.status === 'healthy' ? 'Healthy' : 'Warning'}
          icon={health?.system?.status === 'healthy' ? CheckCircle : AlertTriangle}
          color={health?.system?.status === 'healthy' ? 'green' : 'yellow'}
          subtitle={`${health?.system?.recent_errors_24h || 0} errors today`}
        />
      </div>

      {/* Email & Meeting Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Email Accounts"
          value={emailStats?.total_accounts || 0}
          icon={Mail}
          color="blue"
          subtitle={`${emailStats?.active_accounts || 0} active`}
        />
        <StatCard
          title="Emails Processed"
          value={emailStats?.total_emails_processed || 0}
          icon={Send}
          color="green"
          subtitle={`${emailStats?.total_replies_sent || 0} auto-replies`}
        />
        <StatCard
          title="Meetings Scheduled"
          value={meetingStats?.total_meetings_scheduled || 0}
          icon={Calendar}
          color="purple"
          subtitle={`${meetingStats?.meetings_this_week || 0} this week`}
        />
        <StatCard
          title="Conversion Rate"
          value={meetingStats?.conversion_rate ? `${(meetingStats.conversion_rate * 100).toFixed(1)}%` : 'N/A'}
          icon={MessageSquare}
          color="yellow"
          subtitle="Email to meeting"
        />
      </div>

      {/* Contact Stats Grid */}
      {contactStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Contacts"
            value={contactStats?.total_contacts || 0}
            icon={Users}
            color="primary"
            subtitle="All time"
          />
          <StatCard
            title="New Contacts"
            value={contactStats?.new_contacts || 0}
            icon={Clock}
            color="blue"
            subtitle="Awaiting response"
          />
          <StatCard
            title="In Progress"
            value={contactStats?.in_progress_contacts || 0}
            icon={AlertCircle}
            color="yellow"
            subtitle="Being handled"
          />
          <StatCard
            title="Resolved"
            value={contactStats?.resolved_contacts || 0}
            icon={CheckCircle}
            color="green"
            subtitle="Successfully closed"
          />
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Statistics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Users</span>
              <span className="font-medium">{overview?.users?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-medium text-green-600">{overview?.users?.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admin Users</span>
              <span className="font-medium text-primary-600">{overview?.users?.admins || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users (24h)</span>
              <span className="font-medium text-blue-600">{overview?.users?.recent_24h || 0}</span>
            </div>
          </div>
        </div>

        {/* Analysis Statistics */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Analyses</span>
              <span className="font-medium">{overview?.analyses?.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completed</span>
              <span className="font-medium text-green-600">{overview?.analyses?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="font-medium text-red-600">{overview?.analyses?.failed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing</span>
              <span className="font-medium text-yellow-600">{overview?.analyses?.processing || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="font-medium text-primary-600">{overview?.analyses?.success_rate || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{health?.database?.collections || 0}</div>
            <div className="text-sm text-gray-600">Database Collections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{health?.system?.active_users_24h || 0}</div>
            <div className="text-sm text-gray-600">Active Users (24h)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{health?.system?.stale_processing_jobs || 0}</div>
            <div className="text-sm text-gray-600">Stale Jobs</div>
          </div>
        </div>
      </div>
    </div>
  );
}
