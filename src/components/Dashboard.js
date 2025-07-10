import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiDollarSign, FiShoppingCart, FiUsers, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Loading from './Loading';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchSalesData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getDashboardStats();
      if (response) {
        setDashboardData(response);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
      console.error('Dashboard data error:', error);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await apiService.getSalesData();
      if (response) {
        // Transform the data to match chart format
        const transformedData = response.map(item => ({
          date: item.date,
          sales: parseFloat(item.total) || 0,
          orders: parseInt(item.quantity) || 0
        }));
        setSalesData(transformedData);
      }
    } catch (error) {
      toast.error('Failed to load sales data');
      console.error('Sales data error:', error);
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
      day: 'numeric'
    });
  };

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Welcome back, {user?.username || 'User'}!
      </h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FiDollarSign size={24} className="text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Total Sales</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(dashboardData?.totalSales || 0)}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Today's total sales
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FiShoppingCart size={24} className="text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Total Orders</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(dashboardData?.totalOrders || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Orders today
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FiUsers size={24} className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">Total Customers</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(dashboardData?.totalCustomers || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Customers today
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <FiShoppingCart size={24} className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">Total Products</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(dashboardData?.totalProducts || 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Products in system
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Sales Overview</h3>
          <div className="flex items-center space-x-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="7">Last 7 Days</option>
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} />
            <YAxis />
            <Tooltip 
              labelFormatter={(label) => `Date: ${formatDate(label)}`}
              formatter={(value, name) => [
                name === 'sales' ? formatCurrency(value) : value,
                name === 'sales' ? 'Sales' : 'Orders'
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#007bff" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="#28a745" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData?.recentTransactions?.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) && (
          <div className="px-6 py-8 text-center text-gray-500">
            No recent transactions found
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;