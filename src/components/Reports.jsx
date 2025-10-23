import React, { useState } from 'react';
import { BarChart3, Download, Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const Reports = ({ jobs, workers, language, translations }) => {
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [selectedWorker, setSelectedWorker] = useState('all');
  const [selectedService, setSelectedService] = useState('all');

  const serviceTypes = [...new Set(jobs.map(job => job.serviceType).filter(Boolean))];

  const filteredJobs = jobs.filter(job => {
    const jobDate = new Date(job.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    const withinDateRange = isWithinInterval(jobDate, { start: startDate, end: endDate });
    const matchesWorker = selectedWorker === 'all' || job.workerId === parseInt(selectedWorker);
    const matchesService = selectedService === 'all' || job.serviceType === selectedService;
    
    return withinDateRange && matchesWorker && matchesService;
  });

  const totalRevenue = filteredJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
  const paidRevenue = filteredJobs
    .filter(job => job.paymentStatus === 'paid')
    .reduce((sum, job) => sum + (job.amount || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  // Worker performance data
  const workerStats = workers.map(worker => {
    const workerJobs = filteredJobs.filter(job => job.workerId === worker.id);
    const totalAmount = workerJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    const jobCount = workerJobs.length;
    
    return {
      ...worker,
      jobCount,
      totalAmount,
      avgJobValue: jobCount > 0 ? totalAmount / jobCount : 0
    };
  }).filter(worker => worker.jobCount > 0);

  // Service type breakdown
  const serviceStats = serviceTypes.map(service => {
    const serviceJobs = filteredJobs.filter(job => job.serviceType === service);
    const totalAmount = serviceJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    
    return {
      service,
      jobCount: serviceJobs.length,
      totalAmount,
      percentage: totalRevenue > 0 ? (totalAmount / totalRevenue) * 100 : 0
    };
  }).sort((a, b) => b.totalAmount - a.totalAmount);

  // Monthly trend (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthJobs = jobs.filter(job => {
      const jobDate = new Date(job.date);
      return isWithinInterval(jobDate, { start: monthStart, end: monthEnd });
    });
    
    const monthRevenue = monthJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
    
    monthlyData.push({
      month: format(date, 'MMM'),
      revenue: monthRevenue,
      jobCount: monthJobs.length
    });
  }

  const exportToCSV = () => {
    const headers = [
      translations[language].date,
      translations[language].worker,
      translations[language].service,
      translations[language].location,
      translations[language].amount,
      translations[language].pending,
      translations[language].paymentMethod
    ];
    const csvData = filteredJobs.map(job => [
      job.date,
      job.workerName,
      job.serviceType,
      job.location,
      job.amount || 0,
      translations[language][`status${job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}`],
      job.paymentMethod // Use raw payment method for CSV
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `construction-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{translations[language].reportsTitle}</h1>
        <p className="text-gray-600">{translations[language].reportsDescription}</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].startDate}</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].endDate}</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].worker}</label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{translations[language].allWorkers}</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{translations[language].service}</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{translations[language].allServices}</option>
              {serviceTypes.map(service => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {translations[language].exportCSV}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].totalJobs}</p>
              <p className="text-3xl font-bold text-gray-900">{filteredJobs.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].totalRevenue}</p>
              <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].paidAmount}</p>
              <p className="text-3xl font-bold text-green-600">${paidRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{translations[language].pendingAmount}</p>
              <p className="text-3xl font-bold text-yellow-600">${pendingRevenue.toFixed(2)}</p>
            </div>
            <Calendar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Worker Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            {translations[language].workerPerformance}
          </h3>
          <div className="space-y-4">
            {workerStats.map((worker, index) => (
              <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{worker.name}</p>
                  <p className="text-sm text-gray-600">{worker.jobCount} {translations[language].jobsCompleted}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">Total: ${worker.totalAmount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">${worker.avgJobValue.toFixed(2)} {translations[language].avg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">{translations[language].serviceTypeBreakdown}</h3>
          <div className="space-y-4">
            {serviceStats.map((stat, index) => (
              <div key={stat.service} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{stat.service}</span>
                  <span className="text-sm text-gray-600">${stat.totalAmount.toFixed(2)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stat.jobCount} {translations[language].jobs}</span>
                  <span>{stat.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">{translations[language].monthRevenueTrend}</h3>
          <div className="space-y-4">
            <div className="flex items-end space-x-4 h-40">
              {monthlyData.map((month, index) => {
                const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-600 rounded-t" style={{ height: `${height}%` }} />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-900">{month.month}</p>
                      <p className="text-xs text-gray-600">${month.revenue.toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{month.jobCount} {translations[language].jobs}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border mt-8">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">{translations[language].recentJobs} ({filteredJobs.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].date}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].worker}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].service}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].location}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].amount}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{translations[language].pending}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredJobs.slice(0, 10).map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.date && format(new Date(job.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.workerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.serviceType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(job.amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      job.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {translations[language][`status${job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}`]}
                    </span>
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

export default Reports;