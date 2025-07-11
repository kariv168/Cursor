import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await apiService.getCurrentUser();
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        
        // Map role_name to role for frontend compatibility
        const userWithRole = {
          ...user,
          role: user.role_name,
          role_name: user.role_name // Keep both for compatibility
        };
        
        setUser(userWithRole);
        return { success: true };
      }
      
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      setError(error.message || 'Login failed');
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  // Check if user is administrator
  const isAdmin = () => {
    return user && (user.role === 'administrator' || user.role_name === 'administrator');
  };

  // Check if user is admin or backend developer (adjust if business_analysis should have manager-like role)
  const isManager = () => {
    return user && (user.role === 'administrator' || user.role === 'backend_developer' || 
                   user.role_name === 'administrator' || user.role_name === 'backend_developer');
  };

  // Permission check:
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Administrator has all permissions
    if (user.role === 'administrator' || user.role_name === 'administrator') return true;
    
    // Backend developer has most permissions
    if (user.role === 'backend_developer' || user.role_name === 'backend_developer') {
      return ['view_sales', 'view_products', 'view_inventory', 'view_orders'].includes(permission);
    }
    
    // Business analyst has view permissions
    if (user.role === 'business_analyst' || user.role_name === 'business_analyst') {
      return ['view_sales', 'view_products', 'view_inventory', 'view_orders'].includes(permission);
    }
    
    // Other roles permissions check
    return user.permissions && user.permissions.includes(permission);
  };

  const value = {
    user,
    login,
    logout,
    loading,
    error,
    isAdmin,
    isManager,
    hasPermission,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
