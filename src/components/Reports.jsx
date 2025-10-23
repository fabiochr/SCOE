import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Download, Calendar } from 'lucide-react';

const Reports = ({ jobs, workers, language, translations }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('all');

  // Filter jobs by date range
  const filteredJobs = jobs.filter(job => {
    const jobDate = new Date(job.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    const afterStart = !start || jobDate >= start;
    const beforeEnd = !end || jobDate <= end;
    const matchesWorker = selectedWorker === 'all' || job.workerId === parseInt(selectedWorker);
    
    return afterStart && beforeEnd && matchesWorker;
  });

  // Calculate statistics
  const totalRevenue = filteredJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const paidJobs = filteredJobs.filter(job => job.paymentStatus === 'paid');
  const paidAmount = paidJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
  const pendingAmount = totalRevenue - paidAmount;

  // Worker performance
  const workerStats = workers.map(worker => {
    const workerJobs = filteredJobs.filter(job => job.workerId === worker.id);
    const revenue = workerJobs.reduce((sum, job) => sum + parseFloat(job.amount || 0), 0);
    return {
      ...worker,
      jobsCompleted: workerJobs.length,
      revenue: revenue,
      avgJobValue: workerJobs.length > 0 ? revenue / workerJobs.length : 0
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Service type breakdown
  const serviceStats = {};
  filteredJobs.forEach(job => {
    if (!serviceStats[job.serviceType]) {
      serviceStats[job.serviceType] = { count: 0, revenue: 0 };
    }
    serviceStats[job.serviceType].count++;
    serviceStats[job.serviceType].revenue += parseFloat(job.amount || 0);
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Worker', 'Service Type', 'Location', 'Amount', 'Status'];
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
    a.download = `construction-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, gradient, textColor }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className={`text-3xl font-bold mb-1 ${textColor}`}>{value}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-blue-100">Business insights and performance metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Worker
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white"
                >
                  <option value="all">All Workers</option>
                  {workers.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center font-semibold shadow-md"
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            subtitle={`${filteredJobs.length} jobs`}
            icon={DollarSign}
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            textColor="text-gray-900"
          />
          <StatCard
            title="Paid Amount"
            value={`$${paidAmount.toFixed(2)}`}
            subtitle={`${paidJobs.length} paid jobs`}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            textColor="text-green-600"
          />
          <StatCard
            title="Pending Amount"
            value={`$${pendingAmount.toFixed(2)}`}
            subtitle={`${filteredJobs.length - paidJobs.length} pending`}
            icon={BarChart3}
            gradient="bg-gradient-to-br from-orange-500 to-amber-600"
            textColor="text-orange-600"
          />
        </div>

        {/* Worker Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Worker Performance
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {workerStats.slice(0, 5).map((worker, index) => (
                <div key={worker.id} className="flex items-center">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold mr-4">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-500">{worker.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right mr-8">
                    <p className="text-sm text-gray-600">{worker.jobsCompleted} jobs</p>
                    <p className="text-xs text-gray-500">avg ${worker.avgJobValue.toFixed(2)}</p>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-lg font-bold text-green-600">${worker.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Service Type Breakdown
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(serviceStats).map(([service, stats]) => (
                <div key={service} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{service}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                      {stats.count} jobs
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">${stats.revenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Avg: ${(stats.revenue / stats.count).toFixed(2)} per job
                  </p>
                  <div className="mt-3 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.revenue / totalRevenue) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((stats.revenue / totalRevenue) * 100).toFixed(1)}% of total revenue
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing data for {filteredJobs.length} jobs
          {startDate && endDate && ` from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`}
        </div>
      </div>
    </div>
  );
};

export default Reports;