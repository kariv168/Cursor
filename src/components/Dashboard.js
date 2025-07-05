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
      // Mock data for demonstration - replace with actual API call
      const mockData = {
        totalSales: 125000,
        totalOrders: 1250,
        totalCustomers: 450,
        totalProducts: 850,
        salesChange: 12.5,
        ordersChange: -2.3,
        customersChange: 8.7,
        productsChange: 3.2,
        recentTransactions: [
          { id: 1, customer: 'John Doe', amount: 45.50, date: '2024-01-15', status: 'completed' },
          { id: 2, customer: 'Jane Smith', amount: 78.20, date: '2024-01-15', status: 'completed' },
          { id: 3, customer: 'Bob Johnson', amount: 23.99, date: '2024-01-14', status: 'completed' },
          { id: 4, customer: 'Alice Wilson', amount: 156.75, date: '2024-01-14', status: 'pending' },
        ]
      };
      
      setDashboardData(mockData);
    } catch (error) {
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    }
  };

  const fetchSalesData = async () => {
    try {
      // Mock sales data for chart - replace with actual API call
      const mockSalesData = [
        { date: '2024-01-01', sales: 4000, orders: 240 },
        { date: '2024-01-02', sales: 3000, orders: 180 },
        { date: '2024-01-03', sales: 2000, orders: 120 },
        { date: '2024-01-04', sales: 2780, orders: 167 },
        { date: '2024-01-05', sales: 1890, orders: 113 },
        { date: '2024-01-06', sales: 2390, orders: 143 },
        { date: '2024-01-07', sales: 3490, orders: 209 },
        { date: '2024-01-08', sales: 4100, orders: 246 },
        { date: '2024-01-09', sales: 3200, orders: 192 },
        { date: '2024-01-10', sales: 2800, orders: 168 },
        { date: '2024-01-11', sales: 3800, orders: 228 },
        { date: '2024-01-12', sales: 4200, orders: 252 },
        { date: '2024-01-13', sales: 3600, orders: 216 },
        { date: '2024-01-14', sales: 4500, orders: 270 },
        { date: '2024-01-15', sales: 5000, orders: 300 },
      ];
      
      setSalesData(mockSalesData);
    } catch (error) {
      toast.error('Failed to load sales data');
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
    return <div className="error">{error}</div>;
  }

  return (
    <div className="container">
      <h1 className="dashboard-title">
        Welcome back, {user?.name || user?.email}!
      </h1>
      
      {/* Key Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiDollarSign size={24} color="#28a745" />
            <h3 className="dashboard-card-title">Total Sales</h3>
          </div>
          <div className="dashboard-card-value">
            {formatCurrency(dashboardData?.totalSales)}
          </div>
          <div className={`dashboard-card-change ${dashboardData?.salesChange > 0 ? 'positive' : 'negative'}`}>
            {dashboardData?.salesChange > 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
            {Math.abs(dashboardData?.salesChange)}% from last month
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiShoppingCart size={24} color="#007bff" />
            <h3 className="dashboard-card-title">Total Orders</h3>
          </div>
          <div className="dashboard-card-value">
            {dashboardData?.totalOrders?.toLocaleString()}
          </div>
          <div className={`dashboard-card-change ${dashboardData?.ordersChange > 0 ? 'positive' : 'negative'}`}>
            {dashboardData?.ordersChange > 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
            {Math.abs(dashboardData?.ordersChange)}% from last month
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiUsers size={24} color="#ffc107" />
            <h3 className="dashboard-card-title">Total Customers</h3>
          </div>
          <div className="dashboard-card-value">
            {dashboardData?.totalCustomers?.toLocaleString()}
          </div>
          <div className={`dashboard-card-change ${dashboardData?.customersChange > 0 ? 'positive' : 'negative'}`}>
            {dashboardData?.customersChange > 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
            {Math.abs(dashboardData?.customersChange)}% from last month
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <FiShoppingCart size={24} color="#dc3545" />
            <h3 className="dashboard-card-title">Total Products</h3>
          </div>
          <div className="dashboard-card-value">
            {dashboardData?.totalProducts?.toLocaleString()}
          </div>
          <div className={`dashboard-card-change ${dashboardData?.productsChange > 0 ? 'positive' : 'negative'}`}>
            {dashboardData?.productsChange > 0 ? <FiTrendingUp size={16} /> : <FiTrendingDown size={16} />}
            {Math.abs(dashboardData?.productsChange)}% from last month
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="sales-chart-container">
        <div className="sales-chart-header">
          <h3 className="sales-chart-title">Sales Overview</h3>
          <div className="sales-filter">
            <select className="form-select">
              <option value="15">Last 15 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
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
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Transactions</h3>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.recentTransactions?.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.customer}</td>
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span className={`badge ${transaction.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;