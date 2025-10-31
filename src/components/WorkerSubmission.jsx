import React, { useState, useEffect } from 'react';
import { Upload, X, Calendar } from 'lucide-react';
import { supabase } from '../supabaseClient';

const WorkerSubmission = ({ onSubmit, workers, language, translations, serviceTypes }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    workerId: '',
    serviceType: '',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: '',
    amount: '',
    paymentMethod: '',
    otherPaymentMethod: '',
    images: []
  });
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);

  // Get current logged-in user and auto-select if worker
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setCurrentUser({ ...user, role: profile?.role });
        
        // Auto-select worker if user is a worker
        if (profile?.role === 'worker') {
          // Find worker entry for this user
          const workerEntry = workers.find(w => 
            w.email === user.email || 
            w.name === user.user_metadata?.full_name
          );
          
          if (workerEntry) {
            setFormData(prev => ({ ...prev, workerId: workerEntry.id }));
          } else {
            // Create worker entry automatically if doesn't exist
            const newWorker = {
              name: user.user_metadata?.full_name || user.email,
              email: user.email,
              specialty: 'General',
              active: true
            };
            
            const { data, error } = await supabase
              .from('workers')
              .insert([newWorker])
              .select()
              .single();
            
            if (!error && data) {
              setFormData(prev => ({ ...prev, workerId: data.id }));
            }
          }
        }
      }
    };
    
    getCurrentUser();
  }, [workers]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.slice(0, 5 - formData.images.length);
    
    newImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.workerId || !formData.serviceType || !formData.startDate) {
      setError(translations[language]?.fillRequiredFields || 'Please fill in all required fields');
      return;
    }

    // Validate end date is after start date
    if (formData.endDate && formData.endDate < formData.startDate) {
      setError(language === 'en' 
        ? 'End date must be after start date' 
        : 'Data de término deve ser após data de início');
      return;
    }

    try {
      await onSubmit(formData);
      
      // Reset form but keep workerId if worker
      setFormData({
        workerId: currentUser?.role === 'worker' ? formData.workerId : '',
        serviceType: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: '',
        amount: '',
        paymentMethod: '',
        otherPaymentMethod: '',
        images: []
      });
      setImagePreviews([]);
    } catch (err) {
      setError('Error submitting job: ' + err.message);
    }
  };

  const t = translations[language] || {};
  const isWorkerRole = currentUser?.role === 'worker';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">{t.workerSubmission || 'Worker Submission'}</h1>
        <p className="text-blue-100 text-sm">
          {language === 'en' 
            ? 'Submit your completed or ongoing work' 
            : 'Envie seu trabalho concluído ou em andamento'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Worker Selection - Hidden/Readonly for worker role */}
          {!isWorkerRole && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.selectWorker || 'Select Worker'} *
              </label>
              <select
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">{t.selectWorker || 'Select Worker'}</option>
                {workers.filter(w => w.active).map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          {isWorkerRole && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">
                  {language === 'en' ? 'Submitting as:' : 'Enviando como:'}
                </span>{' '}
                {currentUser?.user_metadata?.full_name || currentUser?.email}
              </p>
            </div>
          )}

          {/* Service Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.serviceType || 'Service Type'} *
            </label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">{t.selectServiceType || 'Select Service Type'}</option>
              {serviceTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type[language] || type.en}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.location || 'Location'}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={language === 'en' ? 'Job site address or location' : 'Endereço do local de trabalho'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {language === 'en' ? 'Start Date' : 'Data de Início'} *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {language === 'en' ? 'End Date (Expected)' : 'Data de Término (Prevista)'}
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'en' 
                  ? 'Leave empty if ongoing or unknown' 
                  : 'Deixe vazio se em andamento ou desconhecido'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.description || 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder={language === 'en' 
                ? 'Describe the work performed or in progress...' 
                : 'Descreva o trabalho realizado ou em andamento...'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.amount || 'Amount'} ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.paymentMethod || 'Payment Method'}
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select payment method</option>
              <option value="cash">{t.cash || 'Cash'}</option>
              <option value="bank_transfer">{t.bankTransfer || 'Bank Transfer'}</option>
              <option value="check">{t.check || 'Check'}</option>
              <option value="credit_card">{t.creditCard || 'Credit Card'}</option>
              <option value="other">{t.otherPayment || 'Other'}</option>
            </select>
            
            {formData.paymentMethod === 'other' && (
              <input
                type="text"
                value={formData.otherPaymentMethod}
                onChange={(e) => setFormData({ ...formData, otherPaymentMethod: e.target.value })}
                placeholder={t.specifyOtherPayment || 'Specify payment method'}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.uploadImages || 'Upload Images'} (Max 5)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={formData.images.length >= 5}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {language === 'en' 
                    ? 'Click to upload or drag and drop' 
                    : 'Clique para carregar ou arraste e solte'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.images.length}/5 {language === 'en' ? 'images' : 'imagens'}
                </p>
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            {t.submitJob || 'Submit Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorkerSubmission;