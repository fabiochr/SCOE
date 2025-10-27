import React, { useState } from 'react';

const WorkerSubmission = ({ onSubmit, workers, language, translations, serviceTypes }) => {
  const [formData, setFormData] = useState({
    workerId: '',
    serviceType: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    paymentMethod: 'cash',
    otherPaymentMethod: '',
    images: []
  });

  const [showOtherPayment, setShowOtherPayment] = useState(false);

  const translatedServiceTypes = serviceTypes ? serviceTypes.map(s => s[language]) : [
    'Painting', 'Plumbing', 'Electrical', 'Carpentry', 'Roofing', 'Flooring', 'HVAC', 'General Contractor'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { file, url: event.target.result, name: file.name }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.workerId || !formData.serviceType || !formData.location) {
      alert(translations[language]?.fillRequiredFields || 'Please fill in all required fields');
      return;
    }

    if (formData.paymentMethod === 'other' && !formData.otherPaymentMethod.trim()) {
      alert('Please specify the payment method');
      return;
    }

    const worker = workers.find(w => w.id === parseInt(formData.workerId));
    const jobData = {
      ...formData,
      workerName: worker?.name || 'Unknown Worker',
      workerId: parseInt(formData.workerId),
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod === 'other' ? formData.otherPaymentMethod : formData.paymentMethod,
    };

    onSubmit(jobData);
    setFormData({
      workerId: '',
      serviceType: '',
      location: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      paymentMethod: 'cash',
      otherPaymentMethod: '',
      images: []
    });
    setShowOtherPayment(false);
    alert(translations[language]?.submissionSuccess || 'Job submission successful!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Worker Job Submission</h1>
        <p className="text-blue-100 text-sm">Submit job completion details</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Worker *</label>
              <select
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Worker</option>
                {workers.filter(w => w.active).map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name} ({worker.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Service Type</option>
                {translatedServiceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location of work or service performed *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., 123 Main St, Anytown"
              className="w-full px-3 py-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Job Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 500.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Detailed description of work performed..."
              className="w-full px-3 py-2 border border-gray-300 rounded"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => {
                setFormData({ ...formData, paymentMethod: e.target.value });
                setShowOtherPayment(e.target.value === 'other');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="credit_card">Credit Card</option>
              <option value="other">Other</option>
            </select>
			{formData.paymentMethod === 'other' && (
			  <input
				type="text"
				placeholder="Specify payment method"
				value={formData.otherPaymentMethod || ''}
				onChange={(e) => setFormData({ ...formData, otherPaymentMethod: e.target.value })}
				className="w-full px-3 py-2 border border-gray-300 rounded mt-2"
				required
			  />
			)}	
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
            {formData.images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image.url} alt={image.name} className="w-full h-20 object-cover rounded border" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerSubmission;