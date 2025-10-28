import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const WorkerManagement = ({ workers, setWorkers, loadWorkers, language, translations, serviceTypes }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    active: true
  });

  const translatedServiceTypes = serviceTypes ? serviceTypes.map(s => s[language]) : [
    'Painting', 'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Flooring', 'HVAC', 'General Contractor'
  ];

  const handleOpenModal = (worker = null) => {
    if (worker) {
      setEditingWorker(worker);
      setFormData({
        name: worker.name,
        phone: worker.phone || '',
        email: worker.email || '',
        specialty: worker.specialty,
        active: worker.active
      });
    } else {
      setEditingWorker(null);
      setFormData({ name: '', phone: '', email: '', specialty: '', active: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingWorker(null);
    setFormData({ name: '', phone: '', email: '', specialty: '', active: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.specialty) {
      alert('Please fill in name and specialty');
      return;
    }

    setLoading(true);
    try {
      if (editingWorker) {
        // Update existing worker in database
        const { error } = await supabase
          .from('workers')
          .update({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            specialty: formData.specialty,
            active: formData.active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingWorker.id);

        if (error) throw error;
        alert('Worker updated successfully!');
      } else {
        // Add new worker to database
        const { error } = await supabase
          .from('workers')
          .insert([{
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            specialty: formData.specialty,
            active: formData.active
          }]);

        if (error) throw error;
        alert('Worker added successfully!');
      }

      // Reload workers from database
      await loadWorkers();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving worker:', error);
      alert('Error saving worker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId) => {
    if (!window.confirm('Are you sure you want to delete this worker?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .delete()
        .eq('id', workerId);

      if (error) throw error;
      
      alert('Worker deleted successfully!');
      await loadWorkers();
    } catch (error) {
      console.error('Error deleting worker:', error);
      alert('Error deleting worker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (workerId, currentActive) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('workers')
        .update({ 
          active: !currentActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', workerId);

      if (error) throw error;
      
      await loadWorkers();
    } catch (error) {
      console.error('Error updating worker status:', error);
      alert('Error updating worker status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white px-6 py-4 shadow flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Worker Management</h1>
          <p className="text-blue-100 text-sm">Manage your construction team</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          disabled={loading}
          className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-blue-50 font-semibold disabled:opacity-50"
        >
          + Add Worker
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Total Workers</p>
            <p className="text-2xl font-bold">{workers.length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">{workers.filter(w => w.active).length}</p>
          </div>
          <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600">Inactive</p>
            <p className="text-2xl font-bold text-gray-600">{workers.filter(w => !w.active).length}</p>
          </div>
        </div>

        {workers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded shadow-sm border border-gray-200">
            <p className="text-gray-600 mb-4">No workers yet</p>
            <button
              onClick={() => handleOpenModal()}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Your First Worker
            </button>
          </div>
        ) : (
          <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Specialty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker) => (
                  <tr key={worker.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{worker.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {worker.phone && <div>{worker.phone}</div>}
                      {worker.email && <div className="text-gray-500 text-xs">{worker.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {worker.specialty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        worker.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {worker.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => handleOpenModal(worker)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-800 mr-3 text-xs disabled:opacity-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleActive(worker.id, worker.active)}
                        disabled={loading}
                        className="text-orange-600 hover:text-orange-800 mr-3 text-xs disabled:opacity-50"
                      >
                        {worker.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(worker.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-xs disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded max-w-md w-full">
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingWorker ? 'Edit Worker' : 'Add Worker'}</h3>
              <button onClick={handleCloseModal} className="text-white text-2xl" disabled={loading}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Specialty *</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={loading}
                  required
                >
                  <option value="">Select Specialty</option>
                  {translatedServiceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="mr-2"
                  disabled={loading}
                />
                <label htmlFor="active" className="text-sm text-gray-700">Active worker</label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingWorker ? 'Update' : 'Add')} Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerManagement;