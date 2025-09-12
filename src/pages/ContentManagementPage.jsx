import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Mail, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Download, 
  Upload,
  Search,
  Filter,
  Eye,
  Copy,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ContentManagementPage() {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [templates, setTemplates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContentData();
  }, []);

  const loadContentData = async () => {
    try {
      setLoading(true);
      setError('');
      const [businessTypesData, templatesData] = await Promise.all([
        adminService.getBusinessTypes(),
        adminService.getEmailTemplates()
      ]);
      
      // Ensure businessTypesData is an array
      setBusinessTypes(Array.isArray(businessTypesData) ? businessTypesData : []);
      setTemplates(templatesData || {});
    } catch (err) {
      console.error('Error loading content data:', err);
      setError(err.message || 'Failed to load content data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template);
    setEditingTemplate(template.content || '');
    setShowTemplateEditor(true);
  };

  const handleSaveTemplate = async () => {
    try {
      setSaving(true);
      // In a real implementation, you would save the template to the backend
      console.log('Saving template:', selectedTemplate, editingTemplate);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowTemplateEditor(false);
      setSelectedTemplate(null);
      setEditingTemplate('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template.content || '');
    // You could add a toast notification here
  };

  const filteredBusinessTypes = businessTypes.filter(type =>
    type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.key?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading content..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Content</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadContentData} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Manage business types, templates, and content</p>
        </div>
        <button
          onClick={loadContentData}
          className="btn btn-outline flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search business types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Business Types */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Business Types</h3>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Business Type
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinessTypes.map((type) => (
            <div key={type.key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-500">Key: {type.key}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary-600 hover:text-primary-800" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Templates */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Template
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Sample Templates */}
          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Welcome Email</h4>
                <p className="text-sm text-gray-500">New user onboarding</p>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEditTemplate({ name: 'Welcome Email', content: 'Welcome to our platform!' })}
                  className="text-primary-600 hover:text-primary-800" 
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleCopyTemplate({ content: 'Welcome to our platform!' })}
                  className="text-blue-600 hover:text-blue-800" 
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              Welcome to our platform! We're excited to have you on board...
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Analysis Complete</h4>
                <p className="text-sm text-gray-500">Analysis notification</p>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEditTemplate({ name: 'Analysis Complete', content: 'Your analysis is ready!' })}
                  className="text-primary-600 hover:text-primary-800" 
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleCopyTemplate({ content: 'Your analysis is ready!' })}
                  className="text-blue-600 hover:text-blue-800" 
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              Your website analysis has been completed successfully...
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">Password Reset</h4>
                <p className="text-sm text-gray-500">Account recovery</p>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => handleEditTemplate({ name: 'Password Reset', content: 'Reset your password here' })}
                  className="text-primary-600 hover:text-primary-800" 
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleCopyTemplate({ content: 'Reset your password here' })}
                  className="text-blue-600 hover:text-blue-800" 
                  title="Copy"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button className="text-red-600 hover:text-red-800" title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              Click the link below to reset your password...
            </p>
          </div>
        </div>
      </div>

      {/* Proposal Templates */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Proposal Templates</h3>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </button>
        </div>
        
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Proposal Templates</h4>
          <p className="text-gray-600 mb-4">Proposal template management functionality coming soon</p>
          <p className="text-sm text-gray-500">
            Manage and customize proposal templates for different business types
          </p>
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Knowledge Base</h3>
          <button className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Knowledge
          </button>
        </div>
        
        <div className="text-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Knowledge Base</h4>
          <p className="text-gray-600 mb-4">Knowledge base management functionality coming soon</p>
          <p className="text-sm text-gray-500">
            Manage industry-specific knowledge and AI training data
          </p>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Template Editor</h4>
            <p className="text-sm text-gray-600">Rich text editor for creating and editing email and proposal templates</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Content Versioning</h4>
            <p className="text-sm text-gray-600">Track changes and maintain version history for all content</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">A/B Testing</h4>
            <p className="text-sm text-gray-600">Test different versions of templates to optimize performance</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Content Analytics</h4>
            <p className="text-sm text-gray-600">Track usage and performance metrics for all content</p>
          </div>
        </div>
      </div>

      {/* Template Editor Modal */}
      {showTemplateEditor && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Edit Template: {selectedTemplate.name}
                </h3>
                <button
                  onClick={() => setShowTemplateEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Content
                  </label>
                  <textarea
                    value={editingTemplate}
                    onChange={(e) => setEditingTemplate(e.target.value)}
                    rows={15}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter template content..."
                  />
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Variables</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <code className="bg-white px-2 py-1 rounded border">{"{{user_name}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{user_email}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{company_name}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{website_url}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{analysis_date}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{reset_link}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{login_url}}"}</code>
                    <code className="bg-white px-2 py-1 rounded border">{"{{support_email}}"}</code>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowTemplateEditor(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={saving}
                  className="btn btn-primary flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Template
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
