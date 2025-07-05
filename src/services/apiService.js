import axios from 'axios';

// Base URL for the API - you can change this to your backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

export const apiService = {
  // Authentication endpoints
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  refreshToken: async () => {
    return await api.post('/auth/refresh');
  },

  // User management endpoints
  getUsers: async (params = {}) => {
    return await api.get('/users', { params });
  },

  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },

  updateUser: async (id, userData) => {
    return await api.put(`/users/${id}`, userData);
  },

  deleteUser: async (id) => {
    return await api.delete(`/users/${id}`);
  },

  updateUserPermissions: async (id, permissions) => {
    return await api.patch(`/users/${id}/permissions`, { permissions });
  },

  updateUserRole: async (id, role) => {
    return await api.patch(`/users/${id}/role`, { role });
  },

  // Sales data endpoints
  getSalesData: async (params = {}) => {
    return await api.get('/sales', { params });
  },

  getSalesStats: async (params = {}) => {
    return await api.get('/sales/stats', { params });
  },

  getSalesByDate: async (startDate, endDate) => {
    return await api.get('/sales/by-date', {
      params: { startDate, endDate }
    });
  },

  getSalesByProduct: async (params = {}) => {
    return await api.get('/sales/by-product', { params });
  },

  getSalesByCategory: async (params = {}) => {
    return await api.get('/sales/by-category', { params });
  },

  // Product management endpoints
  getProducts: async (params = {}) => {
    return await api.get('/products', { params });
  },

  getProductById: async (id) => {
    return await api.get(`/products/${id}`);
  },

  createProduct: async (productData) => {
    return await api.post('/products', productData);
  },

  updateProduct: async (id, productData) => {
    return await api.put(`/products/${id}`, productData);
  },

  deleteProduct: async (id) => {
    return await api.delete(`/products/${id}`);
  },

  // Category management endpoints
  getCategories: async () => {
    return await api.get('/categories');
  },

  createCategory: async (categoryData) => {
    return await api.post('/categories', categoryData);
  },

  updateCategory: async (id, categoryData) => {
    return await api.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: async (id) => {
    return await api.delete(`/categories/${id}`);
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    return await api.get('/dashboard/stats');
  },

  getRecentTransactions: async (limit = 10) => {
    return await api.get('/dashboard/recent-transactions', {
      params: { limit }
    });
  },

  // Reports endpoints
  generateSalesReport: async (params) => {
    return await api.get('/reports/sales', { params });
  },

  generateUserReport: async (params) => {
    return await api.get('/reports/users', { params });
  },

  generateProductReport: async (params) => {
    return await api.get('/reports/products', { params });
  },

  // Inventory endpoints
  getInventory: async (params = {}) => {
    return await api.get('/inventory', { params });
  },

  updateInventory: async (id, inventoryData) => {
    return await api.put(`/inventory/${id}`, inventoryData);
  },

  getLowStockItems: async () => {
    return await api.get('/inventory/low-stock');
  },

  // Permissions endpoints
  getPermissions: async () => {
    return await api.get('/permissions');
  },

  getRoles: async () => {
    return await api.get('/roles');
  },

  // Audit trail endpoints
  getAuditLogs: async (params = {}) => {
    return await api.get('/audit-logs', { params });
  },

  // System settings endpoints
  getSystemSettings: async () => {
    return await api.get('/settings');
  },

  updateSystemSettings: async (settings) => {
    return await api.put('/settings', settings);
  },
};

export default apiService;