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

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  refreshToken: async () => {
    return await api.post('/auth/refresh');
  },

  // User management endpoints (matching backend routes)
  getUsers: async (params = {}) => {
    return await api.get('/auth/users', { params });
  },

  createUser: async (userData) => {
    return await api.post('/auth/users', userData);
  },

  updateUser: async (userId, userData) => {
    return await api.put(`/auth/users/${userId}`, userData);
  },

  deleteUser: async (userId) => {
    return await api.delete(`/auth/users/${userId}`);
  },

  getRoles: async () => {
    return await api.get('/auth/roles');
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

  // Order endpoints
  getOrders: async (params = {}) => {
    return await api.get('/orders', { params });
  },

  getOrderById: async (id) => {
    return await api.get(`/orders/${id}`);
  },

  createOrder: async (orderData) => {
    return await api.post('/orders', orderData);
  },

  updateOrder: async (id, orderData) => {
    return await api.put(`/orders/${id}`, orderData);
  },

  deleteOrder: async (id) => {
    return await api.delete(`/orders/${id}`);
  },

  // Branch endpoints
  getBranches: async (params = {}) => {
    return await api.get('/branches', { params });
  },

  getBranchById: async (id) => {
    return await api.get(`/branches/${id}`);
  },

  createBranch: async (branchData) => {
    return await api.post('/branches', branchData);
  },

  updateBranch: async (id, branchData) => {
    return await api.put(`/branches/${id}`, branchData);
  },

  deleteBranch: async (id) => {
    return await api.delete(`/branches/${id}`);
  },

  // Customer endpoints
  getCustomers: async (params = {}) => {
    return await api.get('/customers', { params });
  },

  getCustomerById: async (id) => {
    return await api.get(`/customers/${id}`);
  },

  createCustomer: async (customerData) => {
    return await api.post('/customers', customerData);
  },

  updateCustomer: async (id, customerData) => {
    return await api.put(`/customers/${id}`, customerData);
  },

  deleteCustomer: async (id) => {
    return await api.delete(`/customers/${id}`);
  },

  // Dashboard endpoints
  getDashboardStats: async () => {
    return await api.get('/dashboard/stats');
  },

  // Sales data endpoints
  getSalesData: async (params = {}) => {
    return await api.get('/sales', { params });
  },

  getSalesSummary: async (params = {}) => {
    return await api.get('/sales/summary', { params });
  },

  getSalesByCategory: async (params = {}) => {
    return await api.get('/sales/by-category', { params });
  },

  getDailySalesTrend: async (params = {}) => {
    return await api.get('/sales/daily-trend', { params });
  },

  // Health check
  getHealth: async () => {
    return await api.get('/health');
  },
};

export default apiService;