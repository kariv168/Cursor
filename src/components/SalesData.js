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
    if (hasPermission('view_sales') || user?.role === 'admin') {
      fetchSalesData();
    }
  }, [user, hasPermission]);

  const fetchSalesData = async () => {
    try {
      // Mock sales data - replace with actual API call
      const mockSalesData = [
        { id: 1, product: 'Milk', category: 'Dairy', quantity: 150, unitPrice: 3.50, total: 525.00, date: '2024-01-15', customer: 'John Doe' },
        { id: 2, product: 'Bread', category: 'Bakery', quantity: 200, unitPrice: 2.50, total: 500.00, date: '2024-01-15', customer: 'Jane Smith' },
        { id: 3, product: 'Apples', category: 'Fruits', quantity: 300, unitPrice: 1.20, total: 360.00, date: '2024-01-14', customer: 'Bob Johnson' },
        { id: 4, product: 'Cheese', category: 'Dairy', quantity: 80, unitPrice: 6.00, total: 480.00, date: '2024-01-14', customer: 'Alice Wilson' },
        { id: 5, product: 'Bananas', category: 'Fruits', quantity: 250, unitPrice: 0.80, total: 200.00, date: '2024-01-13', customer: 'Charlie Brown' },
        { id: 6, product: 'Chicken', category: 'Meat', quantity: 50, unitPrice: 8.50, total: 425.00, date: '2024-01-13', customer: 'Diana Prince' },
        { id: 7, product: 'Yogurt', category: 'Dairy', quantity: 120, unitPrice: 4.00, total: 480.00, date: '2024-01-12', customer: 'Frank Castle' },
        { id: 8, product: 'Pasta', category: 'Pantry', quantity: 180, unitPrice: 2.00, total: 360.00, date: '2024-01-12', customer: 'Grace Kelly' },
        { id: 9, product: 'Beef', category: 'Meat', quantity: 30, unitPrice: 12.00, total: 360.00, date: '2024-01-11', customer: 'Henry Ford' },
        { id: 10, product: 'Tomatoes', category: 'Vegetables', quantity: 200, unitPrice: 1.50, total: 300.00, date: '2024-01-11', customer: 'Ivy League' },
      ];

      setSalesData(mockSalesData);

      // Process data for charts
      const chartData = mockSalesData.reduce((acc, item) => {
        const date = item.date;
        const existing = acc.find(d => d.date === date);
        if (existing) {
          existing.sales += item.total;
          existing.quantity += item.quantity;
        } else {
          acc.push({ date, sales: item.total, quantity: item.quantity });
        }
        return acc;
      }, []);

      setChartData(chartData);

      // Process data for category pie chart
      const categoryData = mockSalesData.reduce((acc, item) => {
        const existing = acc.find(d => d.category === item.category);
        if (existing) {
          existing.value += item.total;
        } else {
          acc.push({ category: item.category, value: item.total });
        }
        return acc;
      }, []);

      setCategoryData(categoryData);
    } catch (error) {
      toast.error('Failed to load sales data');
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
      item.product.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.customer.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategory = !filters.category || item.category === filters.category;
    
    const matchesDate = (!filters.startDate || item.date >= filters.startDate) &&
                       (!filters.endDate || item.date <= filters.endDate);
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalSales = filteredData.reduce((sum, item) => sum + item.total, 0);
  const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <Loading message="Loading sales data..." />;
  }

  if (!hasPermission('view_sales') && user?.role !== 'admin') {
    return (
      <div className="container">
        <div className="error">
          You don't have permission to view sales data.
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="sales-data-header">
        <h1>Sales Data</h1>
        <div className="sales-data-actions">
          <button 
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button 
            className={`btn ${viewMode === 'charts' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('charts')}
          >
            Charts View
          </button>
          <button className="btn btn-success" onClick={handleExport}>
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <FiFilter size={20} />
            Filters
          </h3>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label className="form-label">Search</label>
            <div className="search-input">
              <FiSearch size={16} />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="form-control"
                placeholder="Search products or customers..."
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="form-select"
            >
              <option value="">All Categories</option>
              <option value="Dairy">Dairy</option>
              <option value="Bakery">Bakery</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Meat">Meat</option>
              <option value="Pantry">Pantry</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="sales-summary">
        <div className="summary-card">
          <h4>Total Sales</h4>
          <p className="summary-value">{formatCurrency(totalSales)}</p>
        </div>
        <div className="summary-card">
          <h4>Total Items Sold</h4>
          <p className="summary-value">{totalQuantity.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h4>Total Transactions</h4>
          <p className="summary-value">{filteredData.length}</p>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Sales Transactions</h3>
          </div>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Customer</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.product}</td>
                    <td>
                      <span className="badge badge-info">{item.category}</span>
                    </td>
                    <td>{item.customer}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitPrice)}</td>
                    <td className="font-weight-bold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="charts-container">
          <div className="chart-card">
            <h3>Sales by Date</h3>
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
                <Bar dataKey="sales" fill="#007bff" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Sales by Category</h3>
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
        </div>
      )}

      <style jsx>{`
        .sales-data-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .sales-data-actions {
          display: flex;
          gap: 10px;
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          padding: 20px;
        }
        
        .search-input {
          position: relative;
        }
        
        .search-input svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }
        
        .search-input input {
          padding-left: 40px;
        }
        
        .sales-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 20px 0;
        }
        
        .summary-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        
        .summary-card h4 {
          margin-bottom: 10px;
          color: #666;
          font-size: 1rem;
        }
        
        .summary-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: #007bff;
          margin: 0;
        }
        
        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }
        
        .chart-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .chart-card h3 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .font-weight-bold {
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .sales-data-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .sales-summary {
            grid-template-columns: 1fr;
          }
          
          .charts-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SalesData;