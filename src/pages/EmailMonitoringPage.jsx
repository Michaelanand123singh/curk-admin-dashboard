import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Plus,
  Settings,
  Eye,
  Send,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';

const EmailMonitoringPage = () => {
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [emailStats, setEmailStats] = useState({});
  const [emailMessages, setEmailMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    account_name: '',
    email: '',
    imap_server: '',
    imap_port: 993,
    imap_use_ssl: true,
    smtp_server: '',
    smtp_port: 587,
    smtp_use_tls: true,
    monitoring_enabled: true,
    auto_reply_enabled: true,
    check_interval: 30
  });

  const loadEmailData = useCallback(async () => {
    try {
      setLoading(true);
      const [accountsResponse, statsResponse, messagesResponse] = await Promise.all([
        adminService.get('/email-accounts'),
        adminService.get('/email-statistics'),
        adminService.get('/email-messages?limit=50')
      ]);

      if (accountsResponse.success) {
        setEmailAccounts(accountsResponse.data.accounts || []);
      }

      if (statsResponse.success) {
        setEmailStats(statsResponse.data.global_stats || {});
      }

      if (messagesResponse.success) {
        setEmailMessages(messagesResponse.data.messages || []);
      }
    } catch (err) {
      setError('Failed to load email data');
      console.error('Error loading email data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmailData();
  }, [loadEmailData]);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.post('/email-accounts', newAccount);
      if (response.success) {
        setShowAddAccount(false);
        setNewAccount({
          account_name: '',
          email: '',
          imap_server: '',
          imap_port: 993,
          imap_use_ssl: true,
          smtp_server: '',
          smtp_port: 587,
          smtp_use_tls: true,
          monitoring_enabled: true,
          auto_reply_enabled: true,
          check_interval: 30
        });
        loadEmailData();
      }
    } catch (err) {
      setError('Failed to add email account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this email account?')) {
      try {
        const response = await adminService.delete(`/email-accounts/${accountId}`);
        if (response.success) {
          loadEmailData();
        }
      } catch (err) {
        setError('Failed to delete email account');
      }
    }
  };

  const handleToggleMonitoring = async (accountId, enabled) => {
    try {
      const response = await adminService.put(`/email-accounts/${accountId}`, {
        monitoring_enabled: enabled
      });
      if (response.success) {
        loadEmailData();
      }
    } catch (err) {
      setError('Failed to update monitoring status');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getIntentColor = (intent) => {
    switch (intent) {
      case 'meeting_request':
        return 'bg-blue-100 text-blue-800';
      case 'inquiry':
        return 'bg-green-100 text-green-800';
      case 'objection':
        return 'bg-red-100 text-red-800';
      case 'pricing_request':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Monitoring</h1>
          <p className="text-gray-600">Manage email accounts and monitor auto-reply system</p>
        </div>
        <button
          onClick={() => setShowAddAccount(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Email Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{emailStats.total_accounts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Accounts</p>
              <p className="text-2xl font-bold text-gray-900">{emailStats.active_accounts || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Send className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Processed</p>
              <p className="text-2xl font-bold text-gray-900">{emailStats.total_emails_processed || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Auto Replies Sent</p>
              <p className="text-2xl font-bold text-gray-900">{emailStats.total_replies_sent || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'accounts', name: 'Email Accounts', icon: Users },
              { id: 'messages', name: 'Recent Messages', icon: Mail }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {emailMessages.slice(0, 5).map((message) => (
                      <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{message.from_email}</p>
                            <p className="text-xs text-gray-500">{message.subject}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getIntentColor(message.intent)}`}>
                          {message.intent}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Email Processing</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Auto Reply</span>
                      <span className="text-sm font-medium text-green-600">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Meeting Scheduling</span>
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium text-green-600">0.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              {emailAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No email accounts configured</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Monitoring
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Auto Reply
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stats
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emailAccounts.map((account) => (
                        <tr key={account.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{account.account_name}</div>
                              <div className="text-sm text-gray-500">{account.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(account.status)}
                              <span className="ml-2 text-sm text-gray-900 capitalize">{account.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleMonitoring(account.id, !account.monitoring_enabled)}
                              className={`px-3 py-1 text-xs rounded-full ${
                                account.monitoring_enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {account.monitoring_enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              account.auto_reply_enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {account.auto_reply_enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div>Processed: {account.total_emails_processed}</div>
                              <div>Replies: {account.total_replies_sent}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Settings className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteAccount(account.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Recent Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              {emailMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No email messages found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {emailMessages.map((message) => (
                    <div key={message.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium text-gray-900">{message.from_name || message.from_email}</div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getIntentColor(message.intent)}`}>
                              {message.intent}
                            </span>
                            <span className="text-xs text-gray-500">
                              Priority: {message.priority}/10
                            </span>
                          </div>
                          <div className="mt-1">
                            <div className="text-sm font-medium text-gray-900">{message.subject}</div>
                            <div className="text-sm text-gray-500 mt-1">{message.body}</div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            {message.auto_reply_sent && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Replied
                              </span>
                            )}
                            {message.meeting_scheduled && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Meeting Scheduled
                              </span>
                            )}
                            {message.escalation_required && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                Escalated
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(message.received_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Email Account</h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={newAccount.account_name}
                  onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">IMAP Server</label>
                  <input
                    type="text"
                    value={newAccount.imap_server}
                    onChange={(e) => setNewAccount({...newAccount, imap_server: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IMAP Port</label>
                  <input
                    type="number"
                    value={newAccount.imap_port}
                    onChange={(e) => setNewAccount({...newAccount, imap_port: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                  <input
                    type="text"
                    value={newAccount.smtp_server}
                    onChange={(e) => setNewAccount({...newAccount, smtp_server: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Port</label>
                  <input
                    type="number"
                    value={newAccount.smtp_port}
                    onChange={(e) => setNewAccount({...newAccount, smtp_port: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAccount.monitoring_enabled}
                    onChange={(e) => setNewAccount({...newAccount, monitoring_enabled: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Monitoring</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newAccount.auto_reply_enabled}
                    onChange={(e) => setNewAccount({...newAccount, auto_reply_enabled: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Auto Reply</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default EmailMonitoringPage;
