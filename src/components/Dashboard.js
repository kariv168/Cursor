import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, FiPackage, FiBarChart, FiCalendar } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import Loading from './Loading';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin, hasPermission } = useAuth();
  const [stats, setStats] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats and recent transactions
      const [statsResponse, trendResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getDailySalesTrend({ days: 7 })
      ]);
      
      setStats(statsResponse || {});
      setRecentTransactions(statsResponse?.recentTransactions || []);
      setSalesTrend(trendResponse || []);
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBasedContent = () => {
    const role = user?.role_name?.toLowerCase();
    
    switch (role) {
      case 'administrator':
        return {
          title: 'Administrator Dashboard',
          description: 'Full system access and management capabilities',
          features: ['User Management', 'Sales Analytics', 'System Configuration', 'Data Management']
        };
      case 'backend_developer':
        return {
          title: 'Backend Developer Dashboard',
          description: 'Technical access for development and debugging',
          features: ['API Access', 'Database Management', 'System Monitoring', 'Technical Support']
        };
      case 'business_analyst':
        return {
          title: 'Business Analyst Dashboard',
          description: 'Analytics and reporting access',
          features: ['Sales Reports', 'Performance Analytics', 'Data Insights', 'Trend Analysis']
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Welcome to the supermarket management system',
          features: ['View Data', 'Basic Reports', 'System Access']
        };
    }
  };

  const roleContent = getRoleBasedContent();

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {roleContent.title}
        </h1>
        <p className="text-gray-600 mb-4">
          {roleContent.description}
        </p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>Welcome back, {user?.username}</span>
          <span>•</span>
          <span>Role: {user?.role_name?.replace('_', ' ').toUpperCase()}</span>
        </div>
      </div>

      {/* Role-based Features */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roleContent.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiBarChart size={24} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <FiDollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalSales || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <FiShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <FiUsers className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalCustomers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <FiPackage className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={salesTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Area type="monotone" dataKey="revenue" stroke="#007bff" fill="#007bff" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiShoppingCart size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.customer || 'Guest'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Order #{transaction.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {transaction.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(isAdmin() || hasPermission('view_sales')) && (
            <button
              onClick={() => window.location.href = '/sales'}
              className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiBarChart className="h-6 w-6 text-blue-600 mr-3" />
              <span className="font-medium text-blue-900">View Sales Data</span>
            </button>
          )}
          
          {isAdmin() && (
            <button
              onClick={() => window.location.href = '/users'}
              className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <FiUsers className="h-6 w-6 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Manage Users</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiTrendingUp className="h-6 w-6 text-gray-600 mr-3" />
            <span className="font-medium text-gray-900">Refresh Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;