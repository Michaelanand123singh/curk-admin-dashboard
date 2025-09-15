// admin-dashboard/src/pages/ContactManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Filter, 
  Search, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  MessageSquare,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    new: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'New' },
    contacted: { color: 'bg-yellow-100 text-yellow-800', icon: MessageSquare, label: 'Contacted' },
    in_progress: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'In Progress' },
    resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' },
    closed: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Closed' }
  };

  const config = statusConfig[status] || statusConfig.new;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const PurposeBadge = ({ purpose }) => {
  const purposeConfig = {
    demo: { color: 'bg-purple-100 text-purple-800', label: 'Demo' },
    pricing: { color: 'bg-green-100 text-green-800', label: 'Pricing' },
    partnership: { color: 'bg-blue-100 text-blue-800', label: 'Partnership' },
    support: { color: 'bg-red-100 text-red-800', label: 'Support' },
    general: { color: 'bg-gray-100 text-gray-800', label: 'General' }
  };

  const config = purposeConfig[purpose] || purposeConfig.general;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

const ContactCard = ({ contact, onView, onEdit, onDelete, onUpdateStatus }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{contact.name}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <Mail className="w-4 h-4 mr-1" />
              {contact.email}
            </span>
            <span className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              {contact.phone}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={contact.status} />
          <PurposeBadge purpose={contact.purpose} />
        </div>
      </div>

      {contact.company && (
        <div className="mb-3">
          <span className="text-sm text-gray-600">Company: </span>
          <span className="text-sm font-medium text-gray-900">{contact.company}</span>
        </div>
      )}

      {contact.message && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span>Submitted: {formatDate(contact.created_at)}</span>
        <span>Source: {contact.source}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(contact)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(contact)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </button>
        </div>
        
        <select
          value={contact.status}
          onChange={(e) => onUpdateStatus(contact.id, e.target.value)}
          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon: Icon, color = 'primary', trend }) => {
  const colorClasses = {
    primary: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-600">{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    purpose: '',
    search: ''
  });
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadContacts();
    loadStats();
  }, [filters]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getContacts(filters);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await adminService.getContactStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await adminService.deleteContact(contactId);
        loadContacts();
        loadStats();
      } catch (error) {
        console.error('Error deleting contact:', error);
        setError('Failed to delete contact');
      }
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      await adminService.updateContact(contactId, { status: newStatus });
      loadContacts();
      loadStats();
    } catch (error) {
      console.error('Error updating contact status:', error);
      setError('Failed to update contact status');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
          <p className="text-gray-600">Manage contact form submissions and leads</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadContacts}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Contacts"
            value={stats.total_contacts}
            icon={Users}
            color="primary"
          />
          <StatsCard
            title="New Contacts"
            value={stats.new_contacts}
            icon={Clock}
            color="blue"
          />
          <StatsCard
            title="In Progress"
            value={stats.in_progress_contacts}
            icon={AlertCircle}
            color="yellow"
          />
          <StatsCard
            title="Resolved"
            value={stats.resolved_contacts}
            icon={CheckCircle}
            color="green"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
            <select
              value={filters.purpose}
              onChange={(e) => handleFilterChange('purpose', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Purposes</option>
              <option value="demo">Demo</option>
              <option value="pricing">Pricing</option>
              <option value="partnership">Partnership</option>
              <option value="support">Support</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ status: '', purpose: '', search: '' })}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={handleUpdateStatus}
          />
        ))}
      </div>

      {contacts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
          <p className="text-gray-600">No contact forms match your current filters.</p>
        </div>
      )}
    </div>
  );
}
