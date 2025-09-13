import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Plus,
  Settings,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { adminService } from '../services/adminService';

const MeetingSchedulingPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [meetingStats, setMeetingStats] = useState({});
  const [calendarConfig, setCalendarConfig] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCalendarConfig, setShowCalendarConfig] = useState(false);
  const [calendarProvider, setCalendarProvider] = useState('google');
  const [calendarCredentials, setCalendarCredentials] = useState({});

  const loadMeetingData = useCallback(async () => {
    try {
      setLoading(true);
      const [meetingsResponse, statsResponse, configResponse, slotsResponse] = await Promise.all([
        adminService.get('/meetings?limit=50'),
        adminService.get('/meeting/statistics'),
        adminService.get('/meeting/calendar-config'),
        adminService.get('/meeting/available-slots')
      ]);

      if (meetingsResponse.success) {
        setMeetings(meetingsResponse.data.meetings || []);
      }

      if (statsResponse.success) {
        setMeetingStats(statsResponse.data || {});
      }

      if (configResponse.success) {
        setCalendarConfig(configResponse.data);
      }

      if (slotsResponse.success) {
        setAvailableSlots(slotsResponse.data.slots || []);
      }
    } catch (err) {
      setError('Failed to load meeting data');
      console.error('Error loading meeting data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetingData();
  }, [loadMeetingData]);

  const handleConnectGoogleCalendar = async () => {
    try {
      const response = await adminService.get('/calendar/oauth2/google/initiate');
      if (response.success) {
        window.location.href = response.data.auth_url;
      }
    } catch (err) {
      setError('Failed to initiate Google Calendar connection');
    }
  };

  const handleConnectMicrosoftTeams = async () => {
    try {
      const response = await adminService.get('/calendar/oauth2/microsoft/initiate');
      if (response.success) {
        window.location.href = response.data.auth_url;
      }
    } catch (err) {
      setError('Failed to initiate Microsoft Teams connection');
    }
  };

  const handleConfigureCalendly = async (e) => {
    e.preventDefault();
    try {
      const response = await adminService.post('/calendar/calendly/configure', calendarCredentials);
      if (response.success) {
        setShowCalendarConfig(false);
        setCalendarCredentials({});
        loadMeetingData();
      }
    } catch (err) {
      setError('Failed to configure Calendly');
    }
  };

  const handleTestConnection = async () => {
    try {
      const response = await adminService.post('/calendar/test-connection');
      if (response.success) {
        alert('Calendar connection test successful!');
      } else {
        alert('Calendar connection test failed: ' + response.message);
      }
    } catch (err) {
      setError('Failed to test calendar connection');
    }
  };

  const handleDisconnectCalendar = async () => {
    if (window.confirm('Are you sure you want to disconnect your calendar?')) {
      try {
        const response = await adminService.delete('/calendar/disconnect');
        if (response.success) {
          loadMeetingData();
        }
      } catch (err) {
        setError('Failed to disconnect calendar');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getMeetingTypeColor = (type) => {
    switch (type) {
      case 'discovery_call':
        return 'bg-blue-100 text-blue-800';
      case 'demo':
        return 'bg-green-100 text-green-800';
      case 'proposal_review':
        return 'bg-purple-100 text-purple-800';
      case 'follow_up':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatMeetingTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return {
      date: start.toLocaleDateString(),
      time: `${start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
    };
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
          <h1 className="text-2xl font-bold text-gray-900">Meeting Scheduling</h1>
          <p className="text-gray-600">Manage calendar integration and scheduled meetings</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleTestConnection}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Test Connection
          </button>
          <button
            onClick={() => setShowCalendarConfig(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Connect Calendar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Meetings</p>
              <p className="text-2xl font-bold text-gray-900">{meetingStats.total_meetings_scheduled || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">{meetingStats.meetings_this_week || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {((meetingStats.conversion_rate || 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{meetingStats.average_response_time || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Calendar Integration</h3>
            <p className="text-sm text-gray-600">
              {calendarConfig && calendarConfig.provider 
                ? `Connected to ${calendarConfig.provider.charAt(0).toUpperCase() + calendarConfig.provider.slice(1)} Calendar`
                : 'No calendar connected'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {calendarConfig && calendarConfig.provider ? (
              <>
                <span className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Connected
                </span>
                <button
                  onClick={handleDisconnectCalendar}
                  className="text-red-600 hover:text-red-800"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <span className="flex items-center text-gray-500">
                <XCircle className="w-5 h-5 mr-2" />
                Not Connected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: Eye },
              { id: 'meetings', name: 'Scheduled Meetings', icon: Calendar },
              { id: 'slots', name: 'Available Slots', icon: Clock }
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Meetings</h3>
                  <div className="space-y-3">
                    {meetings.slice(0, 5).map((meeting) => {
                      const timeInfo = formatMeetingTime(meeting.start_time, meeting.end_time);
                      return (
                        <div key={meeting.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                              <p className="text-xs text-gray-500">{timeInfo.date} at {timeInfo.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${getMeetingTypeColor(meeting.meeting_type)}`}>
                              {meeting.meeting_type.replace('_', ' ')}
                            </span>
                            {getStatusIcon(meeting.status)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Meeting Analytics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Most Common Type</span>
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {meetingStats.most_common_meeting_type?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Scheduled</span>
                      <span className="text-sm font-medium text-gray-900">
                        {meetingStats.total_meetings_scheduled || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="text-sm font-medium text-gray-900">
                        {meetingStats.meetings_this_week || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((meetingStats.conversion_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              {meetings.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No meetings scheduled</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meeting
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendees
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {meetings.map((meeting) => {
                        const timeInfo = formatMeetingTime(meeting.start_time, meeting.end_time);
                        return (
                          <tr key={meeting.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                                <div className="text-sm text-gray-500">{meeting.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900">{timeInfo.date}</div>
                                <div className="text-sm text-gray-500">{timeInfo.time}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {meeting.attendee_emails.join(', ')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${getMeetingTypeColor(meeting.meeting_type)}`}>
                                {meeting.meeting_type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(meeting.status)}
                                <span className="ml-2 text-sm text-gray-900 capitalize">{meeting.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {meeting.meeting_link && (
                                  <a
                                    href={meeting.meeting_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                )}
                                <button className="text-gray-600 hover:text-gray-900">
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Available Slots Tab */}
          {activeTab === 'slots' && (
            <div className="space-y-4">
              {availableSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available slots found</p>
                  <p className="text-sm text-gray-400 mt-2">Connect your calendar to see available time slots</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableSlots.map((slot, index) => {
                    const startTime = new Date(slot.start_time);
                    const endTime = new Date(slot.end_time);
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {startTime.toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                              {endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Available
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendar Configuration Modal */}
      {showCalendarConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connect Calendar</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calendar Provider</label>
                <select
                  value={calendarProvider}
                  onChange={(e) => setCalendarProvider(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="google">Google Calendar</option>
                  <option value="microsoft">Microsoft Teams</option>
                  <option value="calendly">Calendly</option>
                </select>
              </div>

              {calendarProvider === 'google' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Connect your Google Calendar to enable automatic meeting scheduling.
                  </p>
                  <button
                    onClick={handleConnectGoogleCalendar}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Google Calendar
                  </button>
                </div>
              )}

              {calendarProvider === 'microsoft' && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Connect your Microsoft Teams calendar to enable automatic meeting scheduling.
                  </p>
                  <button
                    onClick={handleConnectMicrosoftTeams}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Connect Microsoft Teams
                  </button>
                </div>
              )}

              {calendarProvider === 'calendly' && (
                <form onSubmit={handleConfigureCalendly} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Calendly API Key</label>
                    <input
                      type="text"
                      value={calendarCredentials.api_key || ''}
                      onChange={(e) => setCalendarCredentials({...calendarCredentials, api_key: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your Calendly API key"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User URI</label>
                    <input
                      type="text"
                      value={calendarCredentials.user_uri || ''}
                      onChange={(e) => setCalendarCredentials({...calendarCredentials, user_uri: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://api.calendly.com/users/ABC123"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCalendarConfig(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Connect Calendly
                    </button>
                  </div>
                </form>
              )}
            </div>
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

export default MeetingSchedulingPage;
