import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiSearch, FiUser, FiShield } from 'react-icons/fi';
import Loading from './Loading';
import toast from 'react-hot-toast';

const rolePermissionMap = {
    administrator: [
      'view_sales',
      'manage_inventory',
      'create_orders',
      'view_reports',
      'manage_products',
      'process_returns',
      'view_customers',
      'manage_discounts'
    ],
    backend_developer: [
      'manage_inventory',
      'create_orders',
      'process_returns',
      'manage_products'
    ],
    business_analysis: [
      'view_sales',
      'view_reports',
      'view_customers'
    ]
  };

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    permissions: [],
    isActive: true
  });

  const availableRoles = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'backend_developer', label: 'Backend Developer' },
    { value: 'business_analysis', label: 'Business Analysis' }
  ];

  const availablePermissions = [
    { value: 'view_sales', label: 'View Sales Data' },
    { value: 'manage_inventory', label: 'Manage Inventory' },
    { value: 'create_orders', label: 'Create Orders' },
    { value: 'view_reports', label: 'View Reports' },
    { value: 'manage_products', label: 'Manage Products' },
    { value: 'process_returns', label: 'Process Returns' },
    { value: 'view_customers', label: 'View Customers' },
    { value: 'manage_discounts', label: 'Manage Discounts' }
  ];

  useEffect(() => {
    if (isAdmin()) {
      const fetchUsers = async () => {
        try {
          // Mock user data - replace with actual API call
          const mockUsers = [
            {
              id: 1,
              name: 'Alice Admin',
              email: 'admin@supermarket.com',
              role: 'administrator',
              permissions: rolePermissionMap['administrator'],
              isActive: true,
              createdAt: '2024-01-01',
              lastLogin: '2024-01-15'
            },
            {
              id: 2,
              name: 'Bob Backend',
              email: 'backend@supermarket.com',
              role: 'backend_developer',
              permissions: rolePermissionMap['backend_developer'],
              isActive: true,
              createdAt: '2024-01-02',
              lastLogin: '2024-01-14'
            },
            {
              id: 3,
              name: 'Ben Analyst',
              email: 'analyst@supermarket.com',
              role: 'business_analysis',
              permissions: rolePermissionMap['business_analysis'],
              isActive: true,
              createdAt: '2024-01-03',
              lastLogin: '2024-01-13'
            }
          ];

          setUsers(mockUsers);
        } catch (error) {
          toast.error('Failed to load users');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isAdmin]);


  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setFormData({
      name: '',
      email: '',
      role: 'user',
      permissions: [],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === user.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        // Mock delete - replace with actual API call
        setUsers(users.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      // Mock toggle - replace with actual API call
      setUsers(users.map(u => 
        u.id === userId ? { ...u, isActive: !u.isActive } : u
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        // Mock create - replace with actual API call
        const newUser = {
          id: Date.now(),
          ...formData,
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: null
        };
        setUsers([...users, newUser]);
        toast.success('User created successfully');
      } else if (modalMode === 'edit') {
        // Mock update - replace with actual API call
        setUsers(users.map(u => 
          u.id === selectedUser.id ? { ...u, ...formData } : u
        ));
        toast.success('User updated successfully');
      }
      
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        role: value,
        permissions: rolePermissionMap[value] || []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };


  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'administrator': return 'badge-danger';
      case 'backend_developer': return 'badge-warning';
      case 'business_analysis': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Loading users..." />;
  }

  if (!isAdmin()) {
    return (
      <div className="container">
        <div className="error">
          You don't have permission to access user management.
        </div>
      </div>
    );
  }

  const handlePermissionChange = (permissionValue) => {
    setFormData(prev => {
      const alreadyHas = prev.permissions.includes(permissionValue);
      return {
        ...prev,
        permissions: alreadyHas
          ? prev.permissions.filter(p => p !== permissionValue)
          : [...prev.permissions, permissionValue]
      };
    });
  };

  return (
    <div className="container">
      <div className="user-management-container">
        <div className="user-management-header">
          <h1 className="user-management-title">
            <FiUser size={24} />
            User Management
          </h1>
          <button 
            className="btn btn-primary"
            onClick={handleCreateUser}
          >
            <FiPlus size={16} />
            Add New User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="user-search-section">
          <div className="search-input">
            <FiSearch size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Permissions</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadgeColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="permissions-preview">
                      {u.permissions.length > 0 ? (
                        <>
                          <span className="permission-count">
                            {u.permissions.length} permission{u.permissions.length !== 1 ? 's' : ''}
                          </span>
                          <div className="permissions-tooltip">
                            {u.permissions.map(permission => (
                              <div key={permission} className="permission-item">
                                {availablePermissions.find(p => p.value === permission)?.label || permission}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted">No permissions</span>
                      )}
                    </div>
                  </td>
                  <td>{formatDate(u.lastLogin)}</td>
                  <td>
                    <div className="user-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleViewUser(u)}
                        title="View Details"
                      >
                        <FiUser size={14} />
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditUser(u)}
                        title="Edit User"
                      >
                        <FiEdit size={14} />
                      </button>
                      <button
                        className={`btn ${u.isActive ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => handleToggleUserStatus(u.id)}
                        title={u.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {u.isActive ? <FiX size={14} /> : <FiCheck size={14} />}
                      </button>
                      {u.id !== user.id && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          title="Delete User"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">
                  {modalMode === 'create' ? 'Add New User' : 
                   modalMode === 'edit' ? 'Edit User' : 'User Details'}
                </h3>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                    disabled={modalMode === 'view'}
                  >
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FiShield size={16} style={{ marginRight: '8px' }} />
                    Permissions
                  </label>
                  <div className="permissions-grid">
                    {availablePermissions.map(permission => (
                      <label key={permission.value} className="permission-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(permission.value)}
                          onChange={() => handlePermissionChange(permission.value)}
                          disabled={modalMode === 'view'}
                        />
                        <span className="permission-label">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="permission-checkbox">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                    />
                    <span className="permission-label">Active User</span>
                  </label>
                </div>

                {modalMode !== 'view' && (
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {modalMode === 'create' ? 'Create User' : 'Update User'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .user-search-section {
          margin-bottom: 20px;
        }
        
        .search-input {
          position: relative;
          max-width: 400px;
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
        
        .user-info {
          display: flex;
          flex-direction: column;
        }
        
        .user-name {
          font-weight: 500;
          color: #333;
        }
        
        .user-email {
          font-size: 0.9rem;
          color: #666;
        }
        
        .permissions-preview {
          position: relative;
          cursor: pointer;
        }
        
        .permission-count {
          font-size: 0.9rem;
          color: #666;
          text-decoration: underline;
          text-decoration-style: dotted;
        }
        
        .permissions-tooltip {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 200px;
          display: none;
        }
        
        .permissions-preview:hover .permissions-tooltip {
          display: block;
        }
        
        .permission-item {
          padding: 4px 0;
          font-size: 0.9rem;
          color: #333;
        }
        
        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }
        
        .permission-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        
        .permission-checkbox:hover {
          background-color: #f8f9fa;
        }
        
        .permission-checkbox input[type="checkbox"] {
          margin: 0;
        }
        
        .permission-label {
          font-size: 0.9rem;
          color: #333;
        }
        
        .text-muted {
          color: #666;
          font-style: italic;
        }
        
        @media (max-width: 768px) {
          .permissions-grid {
            grid-template-columns: 1fr;
          }
          
          .table {
            font-size: 0.9rem;
          }
          
          .user-actions {
            flex-direction: column;
            gap: 5px;
          }
          
          .user-actions button {
            padding: 4px 8px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;