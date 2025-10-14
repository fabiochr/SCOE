import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import InvoiceGenerator from './InvoiceGenerator';

const Dashboard = ({ jobs, workers, onUpdateJob, onDeleteJob, language, translations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const serviceTypes = [...new Set(jobs.map(job => job.serviceType).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.paymentStatus === statusFilter;
    const matchesService = serviceFilter === 'all' || job.serviceType === serviceFilter;
    
    return matchesSearch && matchesStatus && matchesService;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const updatePaymentStatus = (jobId, newStatus, paymentDate = null) => {
    onUpdateJob(jobId, { 
      paymentStatus: newStatus,
      paymentDate: paymentDate || (newStatus === 'paid' ? new Date().toISOString() : null)
    });
  };

  const handleEditJob = (job) => {
    setEditingJob({ ...job });
  };

  const saveEditedJob = () => {
    onUpdateJob(editingJob.id, editingJob);
    setEditingJob(null);
  };

  const totalAmount = filteredJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
  const paidAmount = filteredJobs
    .filter(job => job.paymentStatus === 'paid')
    .reduce((sum, job) => sum + (job.amount || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{translations[language].dashboardTitle}</h1>
        <p className="text-gray-600">{translations[language].dashboardDescription}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].totalJobs}</p>
              <p className="text-2xl font-bold text-gray-900">{filteredJobs.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].totalValue}</p>
              <p className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].paid}</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].pending}</p>
              <p className="text-2xl font-bold text-yellow-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={translations[language].searchJobsPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{translations[language].allStatus}</option>
            <option value="pending">{translations[language].statusPending}</option>
            <option value="paid">{translations[language].statusPaid}</option>
            <option value="overdue">{translations[language].statusOverdue}</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">{translations[language].allServices}</option>
            {serviceTypes.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          <button
            onClick={() => setShowInvoice(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            {translations[language].generateInvoice}
          </button>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].jobDetails}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].worker}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].serviceType}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].pending}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{translations[language].actions}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.location}</div>
                      <div className="text-sm text-gray-500">
                        {job.date && format(new Date(job.date), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{job.workerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{job.serviceType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${job.amount?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-gray-500">{job.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.paymentStatus)}`}>
                      {getStatusIcon(job.paymentStatus)}
                      <span className="ml-1">{translations[language][`status${job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}`]}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="text-blue-600 hover:text-blue-900"
                        title={translations[language].jobDetails}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditJob(job)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title={translations[language].edit}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteJob(job.id)}
                        className="text-red-600 hover:text-red-900"
                        title={translations[language].delete}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {job.paymentStatus === 'pending' && (
                      <div className="mt-2">
                        <button
                          onClick={() => updatePaymentStatus(job.id, 'paid')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          {translations[language].markPaid}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{translations[language].noJobsFound}</p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{translations[language].jobDetails}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].worker}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedJob.workerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].serviceType}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedJob.serviceType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].location}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedJob.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].date}</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedJob.date && format(new Date(selectedJob.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].amount}</label>
                  <p className="mt-1 text-sm text-gray-900">${selectedJob.amount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">{translations[language].paymentMethod}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedJob.paymentMethod}</p>
                </div>
              </div>
              {selectedJob.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">{translations[language].description}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.images && selectedJob.images.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{translations[language].images}</label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedJob.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url}
                        alt={`Job photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {translations[language].close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">{translations[language].editJob}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].location}</label>
                  <input
                    type="text"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].serviceType}</label>
                  <input
                    type="text"
                    value={editingJob.serviceType}
                    onChange={(e) => setEditingJob(prev => ({ ...prev, serviceType: e.target.value }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].amount}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingJob.amount}
                    onChange={(e) => setEditingJob(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].pending}</label>
                  <select
                    value={editingJob.paymentStatus}
                    onChange={(e) => setEditingJob(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">{translations[language].statusPending}</option>
                    <option value="paid">{translations[language].statusPaid}</option>
                    <option value="overdue">{translations[language].statusOverdue}</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].description}</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) => setEditingJob(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  {translations[language].cancel}
                </button>
                <button
                  onClick={saveEditedJob}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {translations[language].saveChanges}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generator Modal */}
      {showInvoice && (
        <InvoiceGenerator
          jobs={filteredJobs}
          workers={workers}
          onClose={() => setShowInvoice(false)}
          language={language}
          translations={translations}
        />
      )}
    </div>
  );
};

export default Dashboard;