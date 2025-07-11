import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiSearch, FiUser, FiShield } from 'react-icons/fi';
import Loading from './Loading';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: ''
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      console.log('Users response:', response); // Debug log
      if (response.success && response.data) {
        setUsers(response.data.users);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setUsers(response);
      } else {
        console.error('Unexpected users response format:', response);
        toast.error('Failed to load users - unexpected response format');
      }
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiService.getRoles();
      console.log('Roles response:', response); // Debug log
      if (response.success && response.data) {
        setRoles(response.data.roles);
      } else if (Array.isArray(response)) {
        // Handle case where response is directly an array
        setRoles(response);
      } else {
        console.error('Unexpected roles response format:', response);
        toast.error('Failed to load roles - unexpected response format');
      }
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error fetching roles:', error);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setFormData({
      username: '',
      password: '',
      role_id: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setFormData({
      username: user.username,
      password: '',
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setFormData({
      username: user.username,
      password: '',
      role_id: user.role_id
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (userId === user.user_id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      try {
        const response = await apiService.deleteUser(userId);
        if (response.success) {
          toast.success(`User "${userName}" deleted successfully`);
          fetchUsers(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete user');
        }
      } catch (error) {
        // Handle specific error for database not connected
        if (error.message && error.message.includes('Database is not connected')) {
          toast.error('User deletion is not available in demo mode. Please connect to a database to delete users.');
        } else {
          toast.error(error.message || 'Failed to delete user');
        }
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log('Submitting form data:', formData); // Debug log
      
      if (modalMode === 'create') {
        const response = await apiService.createUser(formData);
        console.log('Create user response:', response); // Debug log
        if (response.success) {
          toast.success('User created successfully');
          setShowModal(false);
          fetchUsers(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to create user');
        }
      } else if (modalMode === 'edit') {
        const response = await apiService.updateUser(selectedUser.user_id, formData);
        console.log('Update user response:', response); // Debug log
        if (response.success) {
          toast.success('User updated successfully');
          setShowModal(false);
          fetchUsers(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to update user');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error); // Debug log
      // Handle specific error for database not connected
      if (error.message && (error.message.includes('Database is not connected') || error.message.includes('503'))) {
        toast.error('User management is not available in demo mode. Please connect to a database to manage users.');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getRoleBadgeColor = (roleName) => {
    switch (roleName) {
      case 'administrator':
        return 'bg-red-100 text-red-800';
      case 'backend_developer':
        return 'bg-blue-100 text-blue-800';
      case 'business_analyst':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">You don't have permission to access user management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          onClick={handleCreateUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FiPlus size={16} />
          Add User
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users by username or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalMode === 'create' ? 'Create New User' : 
                 modalMode === 'edit' ? 'Edit User' : 'User Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {modalMode === 'edit' && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required={modalMode === 'create'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    name="role_id"
                    value={formData.role_id}
                    onChange={handleInputChange}
                    disabled={modalMode === 'view'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.role_id} value={role.role_id}>
                        {role.role_name.charAt(0).toUpperCase() + role.role_name.slice(1).replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {modalMode === 'view' && selectedUser && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">User ID:</span> {selectedUser.user_id}
                      </div>
                      <div>
                        <span className="font-medium">Role Description:</span> {selectedUser.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                {modalMode !== 'view' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Create User' : 'Update User'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">User List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.user_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role_name)}`}>
                      {user.role_name.charAt(0).toUpperCase() + user.role_name.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FiUser size={16} />
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Edit User"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.user_id, user.username)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                        disabled={user.user_id === user?.user_id}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="px-6 py-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;