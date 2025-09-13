// Admin Dashboard API Service
const getApiBaseUrl = () => {
  // Debug: Log all environment variables
  console.log('Environment variables:', {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_USE_API_KEY: import.meta.env.VITE_USE_API_KEY,
    VITE_API_KEY: import.meta.env.VITE_API_KEY,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    hostname: window.location.hostname
  });
  
  // Use environment variable for API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    console.warn('VITE_API_BASE_URL environment variable is not set. Please configure it in your .env file.');
    // Fallback to production API URL for deployed environments
    if (window.location.hostname === 'admin.curk.in' || window.location.hostname.includes('run.app')) {
      console.log('Using fallback production API URL');
      return 'https://api.curk.in/api/v1';
    }
    return null;
  }
  
  return apiBaseUrl;
};

const API_BASE_URL = getApiBaseUrl();

class AdminService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.apiKey = import.meta.env.VITE_API_KEY || null;
    this.useApiKey = import.meta.env.VITE_USE_API_KEY === 'true' || false;
    
    // Validate configuration
    if (!this.baseURL) {
      console.error('AdminService: API base URL is not configured. Please set VITE_API_BASE_URL environment variable.');
      // Try to get the URL again with fallback
      this.baseURL = getApiBaseUrl();
    }
  }

  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      // Try to get the URL again with fallback
      this.baseURL = getApiBaseUrl();
      if (!this.baseURL) {
        throw new Error('API base URL is not configured. Please set VITE_API_BASE_URL environment variable.');
      }
    }
    
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Attach authentication header
    if (this.useApiKey && this.apiKey) {
      // Use API Key authentication
      config.headers['X-API-Key'] = this.apiKey;
    } else {
      // Use JWT token authentication (default)
      try {
        const authRaw = localStorage.getItem('auth');
        if (authRaw) {
          const { access_token } = JSON.parse(authRaw);
          if (access_token) {
            config.headers['Authorization'] = `Bearer ${access_token}`;
          }
        }
      } catch (e) {
        console.error('Auth token error:', e);
      }
    }

    try {
      console.log(`🔥 Admin API request to: ${url}`, config);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`❌ Admin API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== SYSTEM ANALYTICS ====================
  
  async getSystemOverview() {
    return this.get('/admin/analytics/overview');
  }

  async getUsageTrends(days = 30) {
    return this.get('/admin/analytics/usage-trends', { days });
  }

  // ==================== USER MANAGEMENT ====================
  
  async listAllUsers(skip = 0, limit = 100) {
    return this.get('/admin/users', { skip, limit });
  }

  async getUserDetails(userId) {
    return this.get(`/admin/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.patch(`/admin/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return this.delete(`/admin/users/${userId}`);
  }

  async createUser(userData) {
    return this.post('/auth/users', userData);
  }

  async forceLogoutUser(userId) {
    return this.post(`/auth/users/${userId}/logout`, {});
  }

  // ==================== SYSTEM MONITORING ====================
  
  async getSystemHealth() {
    return this.get('/admin/monitoring/health');
  }

  async cleanupSystem() {
    return this.post('/admin/monitoring/cleanup');
  }

  // ==================== CONTENT MANAGEMENT ====================
  
  async getBusinessTypes() {
    return this.get('/admin/content/business-types');
  }

  async getEmailTemplates() {
    return this.get('/admin/content/templates');
  }

  // ==================== SYSTEM CONFIGURATION ====================
  
  async getSystemConfig() {
    return this.get('/admin/config');
  }

  async getRecentLogs(limit = 100) {
    return this.get('/admin/logs/recent', { limit });
  }

  // ==================== DASHBOARD DATA ====================
  
  async getDashboardSummary() {
    return this.get('/dashboard/summary');
  }

  async getReportStats() {
    return this.get('/reports/stats');
  }

  // ==================== AUDIT LOGS ====================
  
  async getAuditLogs(skip = 0, limit = 100) {
    return this.get('/admin/audit/logs', { skip, limit });
  }

  // ==================== BULK OPERATIONS ====================
  
  async getBulkOperations(skip = 0, limit = 100) {
    return this.get('/admin/bulk/operations', { skip, limit });
  }

  async cancelBulkOperation(bulkId) {
    return this.post(`/admin/bulk/operations/${bulkId}/cancel`);
  }

  // ==================== ERROR LOGS ====================
  
  async getErrorLogs(skip = 0, limit = 100) {
    return this.get('/admin/logs/errors', { skip, limit });
  }

  // ==================== SYSTEM BACKUP ====================
  
  async createSystemBackup() {
    return this.post('/admin/backup/create');
  }

  async listBackups() {
    return this.get('/admin/backup/list');
  }

  // ==================== ADVANCED ANALYTICS ====================
  
  async getPerformanceMetrics(days = 7) {
    return this.get('/admin/analytics/performance', { days });
  }

  // ==================== AUTHENTICATION ====================
  
  async getMe() {
    return this.get('/auth/me');
  }

  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  // ==================== API KEY MANAGEMENT ====================
  
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  setUseApiKey(useApiKey) {
    this.useApiKey = useApiKey;
  }

  getAuthMethod() {
    return this.useApiKey && this.apiKey ? 'api-key' : 'jwt';
  }

  isAuthenticated() {
    if (this.useApiKey && this.apiKey) {
      return true;
    }
    
    try {
      const authRaw = localStorage.getItem('auth');
      if (authRaw) {
        const { access_token } = JSON.parse(authRaw);
        return !!access_token;
      }
    } catch (e) {
      console.error('Auth check error:', e);
    }
    
    return false;
  }

  // Email Monitoring Methods
  async getEmailAccounts() {
    return this.get('/email-accounts');
  }

  async addEmailAccount(accountData) {
    return this.post('/email-accounts', accountData);
  }

  async updateEmailAccount(accountId, updateData) {
    return this.put(`/email-accounts/${accountId}`, updateData);
  }

  async deleteEmailAccount(accountId) {
    return this.delete(`/email-accounts/${accountId}`);
  }

  async getEmailStatistics() {
    return this.get('/email-statistics');
  }

  async getEmailMessages(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/email-messages${queryString ? `?${queryString}` : ''}`);
  }

  async sendManualReply(messageId, replyContent) {
    return this.post(`/email-messages/${messageId}/reply`, { reply_content: replyContent });
  }

  async escalateEmail(messageId, escalationReason) {
    return this.post(`/email-messages/${messageId}/escalate`, { escalation_reason: escalationReason });
  }

  // Meeting Scheduling Methods
  async getMeetings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/meetings${queryString ? `?${queryString}` : ''}`);
  }

  async getMeetingStatistics() {
    return this.get('/meeting/statistics');
  }

  async getAvailableSlots(durationMinutes = 30, daysAhead = 7) {
    return this.get(`/meeting/available-slots?duration_minutes=${durationMinutes}&days_ahead=${daysAhead}`);
  }

  async saveCalendarConfig(configData) {
    return this.post('/meeting/calendar-config', configData);
  }

  async getCalendarConfig() {
    return this.get('/meeting/calendar-config');
  }

  async testMeetingConnection(configData) {
    return this.post('/meeting/test-connection', configData);
  }

  async updateMeeting(meetingId, updateData) {
    return this.put(`/meetings/${meetingId}`, updateData);
  }

  async cancelMeeting(meetingId) {
    return this.delete(`/meetings/${meetingId}`);
  }

  // Calendar OAuth2 Methods
  async initiateGoogleOAuth2() {
    return this.get('/calendar/oauth2/google/initiate');
  }

  async initiateMicrosoftOAuth2() {
    return this.get('/calendar/oauth2/microsoft/initiate');
  }

  async configureCalendly(configData) {
    return this.post('/calendar/calendly/configure', configData);
  }

  async getCalendarStatus() {
    return this.get('/calendar/status');
  }

  async testCalendarConnection() {
    return this.post('/calendar/test-connection');
  }

  async disconnectCalendar() {
    return this.delete('/calendar/disconnect');
  }
}

export const adminService = new AdminService();
export default adminService;
