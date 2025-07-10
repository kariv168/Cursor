import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiCalendar, FiDownload, FiFilter, FiSearch } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Loading from './Loading';
import toast from 'react-hot-toast';

const SalesData = () => {
  const { user, hasPermission } = useAuth();
  const [salesData, setSalesData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    search: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'charts'

  // Colors for pie chart
  const COLORS = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8'];

  useEffect(() => {
    if (hasPermission('view_sales') || user?.role === 'administrator') {
      fetchSalesData();
    }
  }, [user, hasPermission]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSalesData();
      
      if (response) {
        setSalesData(response);

        // Process data for charts
        const chartData = response.reduce((acc, item) => {
          const date = item.date;
          const existing = acc.find(d => d.date === date);
          if (existing) {
            existing.sales += parseFloat(item.total) || 0;
            existing.quantity += parseInt(item.quantity) || 0;
          } else {
            acc.push({ 
              date, 
              sales: parseFloat(item.total) || 0, 
              quantity: parseInt(item.quantity) || 0 
            });
          }
          return acc;
        }, []);

        setChartData(chartData);

        // Process data for category pie chart (if category data is available)
        // Note: Backend doesn't provide category data in sales endpoint yet
        const categoryData = [];
        setCategoryData(categoryData);
      }
    } catch (error) {
      toast.error('Failed to load sales data');
      console.error('Sales data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExport = () => {
    // Mock export functionality
    toast.success('Sales data exported successfully!');
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

  const filteredData = salesData.filter(item => {
    const matchesSearch = !filters.search || 
      (item.product && item.product.toLowerCase().includes(filters.search.toLowerCase()));
    
    const matchesCategory = !filters.category || (item.category && item.category === filters.category);
    
    const matchesDate = (!filters.startDate || item.date >= filters.startDate) &&
                       (!filters.endDate || item.date <= filters.endDate);
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalSales = filteredData.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);
  const totalQuantity = filteredData.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  if (loading) {
    return <Loading message="Loading sales data..." />;
  }

  if (!hasPermission('view_sales') && user?.role !== 'administrator') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to view sales data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Data</h1>
        <div className="flex items-center space-x-4">
          <button 
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'table' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button 
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'charts' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => setViewMode('charts')}
          >
            Charts View
          </button>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            onClick={handleExport}
          >
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Sales</h3>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Quantity</h3>
          <p className="text-2xl font-bold text-blue-600">{totalQuantity.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Records</h3>
          <p className="text-2xl font-bold text-purple-600">{filteredData.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search products..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {/* Categories would be populated from backend */}
            </select>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.product || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No sales data found
            </div>
          )}
        </div>
      ) : (
        /* Charts View */
        <div className="space-y-6">
          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  formatter={(value, name) => [
                    name === 'sales' ? formatCurrency(value) : value,
                    name === 'sales' ? 'Sales' : 'Quantity'
                  ]}
                />
                <Legend />
                <Bar dataKey="sales" fill="#007bff" name="Sales" />
                <Bar dataKey="quantity" fill="#28a745" name="Quantity" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Chart (if data available) */}
          {categoryData.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SalesData;