// Admin Dashboard API Service
const getApiBaseUrl = () => {
  // Use environment variable for API base URL
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (!apiBaseUrl) {
    console.warn('VITE_API_BASE_URL environment variable is not set. Please configure it in your .env file.');
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
    }
  }

  async request(endpoint, options = {}) {
    if (!this.baseURL) {
      throw new Error('API base URL is not configured. Please set VITE_API_BASE_URL environment variable.');
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
}

export const adminService = new AdminService();
export default adminService;
