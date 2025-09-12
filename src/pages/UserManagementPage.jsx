import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  LogOut, 
  Shield, 
  User,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Create user form
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  // Edit user form
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'user',
    is_active: true,
    is_verified: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.listAllUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminService.createUser(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await adminService.updateUser(selectedUser.id, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await adminService.deleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceLogout = async (userId) => {
    try {
      setActionLoading(true);
      await adminService.forceLogoutUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      is_verified: user.is_verified
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    const matchesStatus = !filterStatus || 
                         (filterStatus === 'active' && user.is_active) ||
                         (filterStatus === 'inactive' && !user.is_active) ||
                         (filterStatus === 'verified' && user.is_verified) ||
                         (filterStatus === 'unverified' && !user.is_verified);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="input"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? (
                        <>
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 mr-1" />
                          User
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {user.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Activity className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-primary-600 hover:text-primary-900"
                        disabled={actionLoading}
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleForceLogout(user.id)}
                        className="text-yellow-600 hover:text-yellow-900"
                        disabled={actionLoading}
                        title="Force Logout"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={actionLoading}
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value})}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editForm.is_verified}
                    onChange={(e) => setEditForm({...editForm, is_verified: e.target.checked})}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Verified</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="btn-primary"
                >
                  {actionLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2" />
                      {selectedUser.name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="mt-1 flex items-center text-sm text-gray-900">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedUser.email}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.role === 'admin' ? (
                          <>
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 mr-1" />
                            User
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {selectedUser.is_verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Activity Info */}
                <div className="border-t pt-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Activity Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created At</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2" />
                        {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Login</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <Activity className="h-4 w-4 mr-2" />
                        {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Seen</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <Activity className="h-4 w-4 mr-2" />
                        {selectedUser.last_seen_at ? new Date(selectedUser.last_seen_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">User ID</label>
                      <div className="mt-1 text-sm text-gray-900 font-mono">
                        {selectedUser.id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowUserDetailsModal(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowUserDetailsModal(false);
                    openEditModal(selectedUser);
                  }}
                  className="btn btn-primary"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
