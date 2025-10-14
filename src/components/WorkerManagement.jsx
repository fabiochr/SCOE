import React, { useState } from 'react';
import { Plus, Edit, Trash2, Phone, User, Wrench, X } from 'lucide-react';

const WorkerManagement = ({ workers, setWorkers, language, translations }) => {
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    active: true
  });

  const specialties = [
    'Painting', 'Plumbing', 'Electrical', 'Carpentry', 
    'Roofing', 'Flooring', 'HVAC', 'General Contractor',
    'Masonry', 'Landscaping', 'Drywall', 'Insulation'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      specialty: '',
      active: true
    });
    setIsAddingWorker(false);
    setEditingWorker(null);
  };

  const handleAddWorker = () => {
    if (!formData.name || !formData.specialty) {
      alert(translations[language].fillNameSpecialty);
      return;
    }

    const newWorker = {
      id: Date.now(),
      ...formData
    };

    setWorkers(prev => [...prev, newWorker]);
    resetForm();
  };

  const handleEditWorker = (worker) => {
    setFormData(worker);
    setEditingWorker(worker.id);
    setIsAddingWorker(true);
  };

  const handleUpdateWorker = () => {
    if (!formData.name || !formData.specialty) {
      alert(translations[language].fillNameSpecialty);
      return;
    }

    setWorkers(prev => prev.map(worker => 
      worker.id === editingWorker ? { ...formData, id: editingWorker } : worker
    ));
    resetForm();
  };

  const handleDeleteWorker = (workerId) => {
    if (window.confirm(translations[language].confirmDeleteWorker)) {
      setWorkers(prev => prev.filter(worker => worker.id !== workerId));
    }
  };

  const toggleWorkerStatus = (workerId) => {
    setWorkers(prev => prev.map(worker => 
      worker.id === workerId ? { ...worker, active: !worker.active } : worker
    ));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{translations[language].workerManagementTitle}</h1>
            <p className="text-gray-600">{translations[language].workerManagementDescription}</p>
          </div>
          <button
            onClick={() => setIsAddingWorker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {translations[language].addWorker}
          </button>
        </div>
      </div>

      {/* Workers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {workers.map((worker) => (
          <div key={worker.id} className={`bg-white rounded-lg shadow-sm border p-6 ${!worker.active ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Wrench className="w-4 h-4 mr-1" />
                    {worker.specialty}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                worker.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {worker.active ? translations[language].active : translations[language].inactive}
              </span>
            </div>

            {worker.phone && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {worker.phone}
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleEditWorker(worker)}
                className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                {translations[language].edit}
              </button>
              <button
                onClick={() => toggleWorkerStatus(worker.id)}
                className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                  worker.active
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {worker.active ? translations[language].deactivate : translations[language].activate}
              </button>
              <button
                onClick={() => handleDeleteWorker(worker.id)}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Worker Modal */}
      {isAddingWorker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingWorker ? translations[language].editWorker : translations[language].addNewWorker}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].fullName} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].phoneNumber}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1-555-0123"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].specialty} *
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{translations[language].selectSpecialty}</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="active" className="text-sm text-gray-700">
                    {translations[language].activeWorkerDescription}
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {translations[language].cancel}
                </button>
                <button
                  onClick={editingWorker ? handleUpdateWorker : handleAddWorker}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingWorker ? translations[language].updateWorker : translations[language].addWorker}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {workers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{translations[language].noWorkersYet}</h3>
          <p className="text-gray-600 mb-4">{translations[language].getStartedAddWorker}</p>
          <button
            onClick={() => setIsAddingWorker(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {translations[language].addYourFirstWorker}
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;