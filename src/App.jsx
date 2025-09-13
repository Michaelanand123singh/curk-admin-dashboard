import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import SystemAnalyticsPage from './pages/SystemAnalyticsPage';
import SystemMonitoringPage from './pages/SystemMonitoringPage';
import EmailMonitoringPage from './pages/EmailMonitoringPage';
import MeetingSchedulingPage from './pages/MeetingSchedulingPage';
import AuditLogsPage from './pages/AuditLogsPage';
import BulkOperationsPage from './pages/BulkOperationsPage';
import ErrorLogsPage from './pages/ErrorLogsPage';
import SystemBackupPage from './pages/SystemBackupPage';
import ContentManagementPage from './pages/ContentManagementPage';
import SystemConfigPage from './pages/SystemConfigPage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout>
                  <UserManagementPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <SystemAnalyticsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/monitoring" element={
              <ProtectedRoute>
                <Layout>
                  <SystemMonitoringPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/email-monitoring" element={
              <ProtectedRoute>
                <Layout>
                  <EmailMonitoringPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/meeting-scheduling" element={
              <ProtectedRoute>
                <Layout>
                  <MeetingSchedulingPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute>
                <Layout>
                  <AuditLogsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/bulk-operations" element={
              <ProtectedRoute>
                <Layout>
                  <BulkOperationsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/error-logs" element={
              <ProtectedRoute>
                <Layout>
                  <ErrorLogsPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/backup" element={
              <ProtectedRoute>
                <Layout>
                  <SystemBackupPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/content" element={
              <ProtectedRoute>
                <Layout>
                  <ContentManagementPage />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/config" element={
              <ProtectedRoute>
                <Layout>
                  <SystemConfigPage />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;