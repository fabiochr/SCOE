import React, { useState } from 'react';

const Reports = ({ jobs, workers, language, translations }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredJobs = jobs.filter(job => {
    const jobDate = new Date(job.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const afterStart = !start || jobDate >= start;
    const beforeEnd = !end || jobDate <= end;
    return afterStart && beforeEnd;
  });

  const totalRevenue = filteredJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const paidJobs = filteredJobs.filter(job => job.paymentStatus === 'paid');
  const paidAmount = paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const pendingAmount = totalRevenue - paidAmount;

  const workerStats = workers.map(worker => {
    const workerJobs = filteredJobs.filter(job => job.workerId === worker.id);
    const revenue = workerJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
    return {
      ...worker,
      jobsCompleted: workerJobs.length,
      revenue: revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const serviceStats = {};
  filteredJobs.forEach(job => {
    if (!serviceStats[job.serviceType]) {
      serviceStats[job.serviceType] = { count: 0, revenue: 0 };
    }
    serviceStats[job.serviceType].count++;
    serviceStats[job.serviceType].revenue += parseFloat(job.amount || 0);
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Worker', 'Service', 'Location', 'Amount', 'Status'];
    const rows = filteredJobs.map(job => [
      new Date(job.date).toLocaleDateString(),
      job.workerName,
      job.serviceType,
      job.location,
      job.amount,
      job.paymentStatus
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-blue-100 text-sm">Business insights and performance metrics</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{filteredJobs.length} jobs</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{paidJobs.length} paid</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Pending Amount</p>
            <p className="text-2xl font-bold text-orange-600">${pendingAmount.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{filteredJobs.length - paidJobs.length} pending</p>
          </div>
        </div>

        {/* Worker Performance */}
        <div className="bg-white rounded shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-bold text-gray-900">Worker Performance</h3>
          </div>
          <div className="p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-sm font-semibold">Worker</th>
                  <th className="text-left py-2 text-sm font-semibold">Specialty</th>
                  <th className="text-right py-2 text-sm font-semibold">Jobs</th>
                  <th className="text-right py-2 text-sm font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {workerStats.slice(0, 5).map((worker) => (
                  <tr key={worker.id} className="border-b">
                    <td className="py-2 text-sm">{worker.name}</td>
                    <td className="py-2 text-sm">{worker.specialty}</td>
                    <td className="py-2 text-sm text-right">{worker.jobsCompleted}</td>
                    <td className="py-2 text-sm text-right font-semibold text-green-600">
                      ${worker.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-bold text-gray-900">Service Type Breakdown</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(serviceStats).map(([service, stats]) => (
                <div key={service} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-sm">{service}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {stats.count} jobs
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600">${stats.revenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">Avg: ${(stats.revenue / stats.count).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;