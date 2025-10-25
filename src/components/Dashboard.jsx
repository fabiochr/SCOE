import React, { useState } from 'react';

const Dashboard = ({ jobs, workers, onUpdateJob, onDeleteJob, language, translations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const totalJobs = jobs.length;
  const totalValue = jobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const paidJobs = jobs.filter(job => job.paymentStatus === 'paid');
  const pendingJobs = jobs.filter(job => job.paymentStatus === 'pending');

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.workerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Blue Header */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Management Dashboard</h1>
        <p className="text-blue-100 text-sm">Monitor and manage job submissions</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Simple Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold">{totalJobs}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Value</p>
            <p className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Paid</p>
            <p className="text-2xl font-bold text-green-600">${paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-orange-600">${(totalValue - paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0)).toFixed(2)}</p>
          </div>
        </div>

        {/* Simple Filters */}
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        {/* Simple Table */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Worker</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{new Date(job.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm font-medium">{job.workerName}</td>
                  <td className="px-4 py-3 text-sm">{job.serviceType}</td>
                  <td className="px-4 py-3 text-sm">{job.location}</td>
                  <td className="px-4 py-3 text-sm font-semibold">${parseFloat(job.amount || 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      job.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {job.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    {job.paymentStatus !== 'paid' && (
                      <button
                        onClick={() => onUpdateJob(job.id, { paymentStatus: 'paid' })}
                        className="text-blue-600 hover:text-blue-800 text-xs mr-2"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Delete
                    </button>
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