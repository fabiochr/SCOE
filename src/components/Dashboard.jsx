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
        <h1 className="text-2xl font-bold">{translations[language]?.managementDashboard || 'Management Dashboard'}</h1>
        <p className="text-blue-100 text-sm">Monitor and manage job submissions</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Simple Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">{translations[language]?.totalJobs || 'Total Jobs'}</p>
            <p className="text-2xl font-bold">{totalJobs}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">{translations[language]?.totalValue || 'Total Value'}</p>
            <p className="text-2xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">{translations[language]?.paid || 'Paid'}</p>
            <p className="text-2xl font-bold text-green-600">${paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">{translations[language]?.pending || 'Pending'}</p>
            <p className="text-2xl font-bold text-orange-600">${(totalValue - paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0)).toFixed(2)}</p>
          </div>
        </div>

        {/* Simple Filters */}
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder={translations[language]?.searchJobs || "Search jobs..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="all">{translations[language]?.allStatus || 'All Status'}</option>
              <option value="pending">{translations[language]?.pending || 'Pending'}</option>
              <option value="paid">{translations[language]?.paid || 'Paid'}</option>
            </select>
          </div>
        </div>

        {/* Simple Table */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">{translations[language]?.actions || 'Actions'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.date || 'Date'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.worker || 'Worker'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.service || 'Service'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.location || 'Location'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.amount || 'Amount'}</th>
				<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">{translations[language]?.status || 'Status'}</th>				
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
                      onClick={() => setSelectedJob(job)}
                      className="text-green-600 hover:text-green-800 text-xs mr-2"
                    >
                      View Details
                    </button>
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

      {/* Job Details Modal */}
{selectedJob && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h3 className="text-xl font-bold">
          {translations[language]?.jobDetails || 'Job Details'}
        </h3>
        <button
          onClick={() => setSelectedJob(null)}
          className="text-white hover:bg-blue-700 rounded p-1"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">
              {translations[language]?.workerLabel || 'Worker'}
            </p>
            <p className="text-base text-gray-900">{selectedJob.workerName}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">
              {translations[language]?.serviceType || 'Service Type'}
            </p>
            <p className="text-base text-gray-900">{selectedJob.serviceType}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">
              {translations[language]?.dateLabel || 'Date'}
            </p>
            <p className="text-base text-gray-900">{new Date(selectedJob.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">
              {translations[language]?.amountLabel || 'Amount'}
            </p>
            <p className="text-base font-bold text-green-600">${parseFloat(selectedJob.amount || 0).toFixed(2)}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {translations[language]?.locationLabel || 'Location'}
          </p>
          <p className="text-base text-gray-900">{selectedJob.location}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {translations[language]?.descriptionLabel || 'Description'}
          </p>
          <p className="text-base text-gray-700">{selectedJob.description || translations[language]?.noDescription}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">
            {translations[language]?.paymentMethodLabel || 'Payment Method'}
          </p>
          <p className="text-base text-gray-900">{selectedJob.paymentMethod || translations[language]?.notSpecified}</p>
        </div>
        {selectedJob.images && selectedJob.images.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              {translations[language]?.photosLabel || 'Photos'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {selectedJob.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={`Job photo ${idx + 1}`}
                  className="w-full h-24 object-cover rounded border border-gray-200 cursor-pointer hover:opacity-75"
                  onClick={() => window.open(img.url, '_blank')}
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