import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Trash2, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Dashboard = ({ jobs, workers, onUpdateJob, onDeleteJob, language, translations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  // Calculate statistics
  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const paidJobs = jobs.filter(job => job.paymentStatus === 'paid');
  const pendingJobs = jobs.filter(job => job.paymentStatus === 'pending');
  const paidAmount = paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const pendingAmount = pendingJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.paymentStatus === statusFilter;
    const matchesService = serviceFilter === 'all' || job.serviceType === serviceFilter;
    return matchesSearch && matchesStatus && matchesService;
  });

  const handleMarkAsPaid = (jobId) => {
    onUpdateJob(jobId, { paymentStatus: 'paid' });
  };

  const handleDeleteJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      onDeleteJob(jobId);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color, gradient }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className={`text-sm font-medium ${color}`}>{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Management Dashboard</h1>
          <p className="text-blue-100">Monitor job submissions and manage payments</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={totalJobs}
            subtitle="All time"
            icon={CheckCircle}
            color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            subtitle={`${paidJobs.length} paid`}
            icon={DollarSign}
            color="text-green-600"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <StatCard
            title="Paid Amount"
            value={`$${paidAmount.toFixed(2)}`}
            subtitle={`${paidJobs.length} jobs`}
            icon={CheckCircle}
            color="text-emerald-600"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
          />
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toFixed(2)}`}
            subtitle={`${pendingJobs.length} jobs`}
            icon={Clock}
            color="text-orange-600"
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search jobs, workers, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Service Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
              >
                <option value="all">All Services</option>
                <option value="Painting">Painting</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Roofing">Roofing</option>
                <option value="Flooring">Flooring</option>
                <option value="HVAC">HVAC</option>
                <option value="General Contractor">General Contractor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Worker</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No jobs found matching your filters</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(job.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm mr-3">
                            {job.workerName?.charAt(0) || 'W'}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{job.workerName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {job.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${parseFloat(job.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : job.paymentStatus === 'overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.paymentStatus === 'paid' ? 'Paid' : job.paymentStatus === 'overdue' ? 'Overdue' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {job.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(job.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        {filteredJobs.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{totalJobs}</span> jobs
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Worker</p>
                  <p className="text-base font-semibold text-gray-900">{selectedJob.workerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Service Type</p>
                  <p className="text-base font-semibold text-gray-900">{selectedJob.serviceType}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                  <p className="text-base font-semibold text-gray-900">{new Date(selectedJob.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Amount</p>
                  <p className="text-base font-semibold text-green-600">${parseFloat(selectedJob.amount || 0).toFixed(2)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                <p className="text-base text-gray-900">{selectedJob.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p className="text-base text-gray-700">{selectedJob.description || 'No description provided'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Payment Method</p>
                <p className="text-base text-gray-900">{selectedJob.paymentMethod || 'Not specified'}</p>
              </div>
              {selectedJob.images && selectedJob.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Images</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedJob.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Job ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;