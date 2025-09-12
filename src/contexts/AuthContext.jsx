import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if using API key authentication
      if (adminService.getAuthMethod() === 'api-key') {
        const userData = await adminService.getMe();
        setUser(userData);
        setLoading(false);
        return;
      }

      // Check JWT token authentication
      const authRaw = localStorage.getItem('auth');
      if (!authRaw) {
        setLoading(false);
        return;
      }

      const { access_token } = JSON.parse(authRaw);
      if (!access_token) {
        setLoading(false);
        return;
      }

      // Verify token with backend
      const userData = await adminService.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await adminService.login(email, password);
      localStorage.setItem('auth', JSON.stringify(response));
      
      // Get user details
      const userData = await adminService.getMe();
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Clear JWT token if using JWT authentication
    if (adminService.getAuthMethod() === 'jwt') {
      localStorage.removeItem('auth');
    }
    // For API key authentication, just clear the user state
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
