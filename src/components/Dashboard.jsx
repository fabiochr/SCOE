import React, { useState } from 'react';
import { Search, Eye, Check, X, DollarSign, Clock, TrendingUp, Image as ImageIcon } from 'lucide-react';

const Dashboard = ({ jobs, workers, onUpdateJob, onDeleteJob, language, translations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [imageModal, setImageModal] = useState({ open: false, images: [], currentIndex: 0 });

  const t = translations[language] || {};

  // Calculate statistics
  const stats = {
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === 'in_progress' || !j.status).length,
    completed: jobs.filter(j => j.status === 'completed').length,
    totalValue: jobs.reduce((sum, j) => sum + (parseFloat(j.amount) || 0), 0),
    paid: jobs.filter(j => j.payment_status === 'paid').reduce((sum, j) => sum + (parseFloat(j.amount) || 0), 0),
    pending: jobs.filter(j => j.payment_status === 'pending').reduce((sum, j) => sum + (parseFloat(j.amount) || 0), 0)
  };

  // Filter and search jobs
  const filteredJobs = jobs.filter(job => {
    const worker = workers.find(w => w.id === job.worker_id);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      worker?.name?.toLowerCase().includes(searchLower) ||
      job.service_type?.toLowerCase().includes(searchLower) ||
      job.location?.toLowerCase().includes(searchLower);
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'in_progress' && (job.status === 'in_progress' || !job.status)) ||
      (filterStatus === 'completed' && job.status === 'completed') ||
      job.payment_status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const openImageModal = (images, index = 0) => {
    if (images && images.length > 0) {
      setImageModal({ open: true, images, currentIndex: index });
    }
  };

  const closeImageModal = () => {
    setImageModal({ open: false, images: [], currentIndex: 0 });
  };

  const nextImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }));
  };

  const prevImage = () => {
    setImageModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount || 0);
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || 'Unknown';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">{t.dashboardHeader || 'Management Dashboard'}</h1>
        <p className="text-blue-100 text-sm">{t.monitorJobs || 'Monitor and manage job submissions'}</p>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalJobs || 'Total Jobs'}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.inProgress} {language === 'en' ? 'in progress' : 'em andamento'}
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.totalValue || 'Total Value'}</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                <p className="text-xs text-green-600 mt-1">
                  {((stats.paid / stats.totalValue) * 100 || 0).toFixed(0)}% {language === 'en' ? 'collected' : 'coletado'}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.paid || 'Paid'}</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {jobs.filter(j => j.payment_status === 'paid').length} {language === 'en' ? 'jobs' : 'trabalhos'}
                </p>
              </div>
              <Check className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.pending || 'Pending'}</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.pending)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {jobs.filter(j => j.payment_status === 'pending').length} {language === 'en' ? 'jobs' : 'trabalhos'}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.searchJobs || 'Search jobs...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t.allStatus || 'All Status'}</option>
              <option value="in_progress">{language === 'en' ? 'In Progress' : 'Em Andamento'}</option>
              <option value="completed">{language === 'en' ? 'Completed' : 'Concluído'}</option>
              <option value="paid">{t.paid || 'Paid'}</option>
              <option value="pending">{t.pending || 'Pending'}</option>
            </select>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.worker || 'Worker'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.service || 'Service'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {language === 'en' ? 'Dates' : 'Datas'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.amountLabel || 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.status || 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {language === 'en' ? 'Images' : 'Imagens'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {t.actions || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {language === 'en' ? 'No jobs found' : 'Nenhum trabalho encontrado'}
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map(job => {
                    const jobImages = Array.isArray(job.images) ? job.images : [];
                    return (
                      <tr key={job.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {getWorkerName(job.worker_id)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {t[job.service_type] || job.service_type}
                          </span>
                          {job.location && (
                            <div className="text-xs text-gray-500 mt-1">{job.location}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="text-xs">
                            <div><strong>{language === 'en' ? 'Start:' : 'Início:'}</strong> {formatDate(job.start_date || job.date)}</div>
                            {job.end_date && (
                              <div className="text-gray-500"><strong>{language === 'en' ? 'End:' : 'Fim:'}</strong> {formatDate(job.end_date)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(job.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              job.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {job.status === 'completed' 
                                ? (language === 'en' ? 'Completed' : 'Concluído')
                                : (language === 'en' ? 'In Progress' : 'Em Andamento')}
                            </span>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ml-1 ${
                              job.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {job.payment_status === 'paid' ? (t.paid || 'Paid') : (t.pending || 'Pending')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {jobImages.length > 0 ? (
                            <button
                              onClick={() => openImageModal(jobImages, 0)}
                              className="flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <ImageIcon className="w-4 h-4 mr-1" />
                              <span>{jobImages.length}</span>
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">
                              {language === 'en' ? 'No images' : 'Sem imagens'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-right space-x-2">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          {job.payment_status === 'pending' && (
                            <button
                              onClick={() => onUpdateJob(job.id, { paymentStatus: 'paid' })}
                              className="text-green-600 hover:text-green-800 font-medium"
                            >
                              <Check className="w-4 h-4 inline" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm(language === 'en' ? 'Delete this job?' : 'Excluir este trabalho?')) {
                                onDeleteJob(job.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            <X className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          {imageModal.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 text-white hover:text-gray-300 z-10"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 text-white hover:text-gray-300 z-10"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          
          <div className="max-w-4xl max-h-full">
            <img
              src={imageModal.images[imageModal.currentIndex]}
              alt={`Job image ${imageModal.currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="text-white text-center mt-4">
              {imageModal.currentIndex + 1} / {imageModal.images.length}
            </p>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold">{t.jobDetails || 'Job Details'}</h3>
              <button onClick={() => setSelectedJob(null)} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">{t.workerLabel || 'Worker'}</label>
                <p className="text-lg">{getWorkerName(selectedJob.worker_id)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">{language === 'en' ? 'Start Date' : 'Data Início'}</label>
                  <p>{formatDate(selectedJob.start_date || selectedJob.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">{language === 'en' ? 'End Date' : 'Data Fim'}</label>
                  <p>{formatDate(selectedJob.end_date) || (language === 'en' ? 'Ongoing' : 'Em andamento')}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t.amountLabel || 'Amount'}</label>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedJob.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t.locationLabel || 'Location'}</label>
                <p>{selectedJob.location || (t.notSpecified || 'Not specified')}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t.descriptionLabel || 'Description'}</label>
                <p>{selectedJob.description || (t.noDescription || 'No description')}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">{t.paymentMethodLabel || 'Payment Method'}</label>
                <p className="capitalize">{selectedJob.payment_method || (t.notSpecified || 'Not specified')}</p>
              </div>
              {selectedJob.images && selectedJob.images.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">{t.photosLabel || 'Photos'}</label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedJob.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Job photo ${idx + 1}`}
                        className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                        onClick={() => openImageModal(selectedJob.images, idx)}
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