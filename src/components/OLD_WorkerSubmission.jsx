import React, { useState } from 'react';
import { Camera, Send, MapPin, Calendar, DollarSign, User, Wrench, X, Upload } from 'lucide-react';

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

  const [aiInput, setAiInput] = useState({
    description: '',
    address: '',
    value: '',
    additional: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOtherPaymentInput, setShowOtherPaymentInput] = useState(false);

  const translatedServiceTypes = serviceTypes ? serviceTypes.map(s => s[language]) : [
    'Painting', 'Plumbing', 'Electrical', 'Carpentry',
    'Roofing', 'Flooring', 'HVAC', 'General Contractor'
  ];

  const paymentMethods = [
    { value: 'cash', label: translations[language]?.cash || 'Cash' },
    { value: 'bank_transfer', label: translations[language]?.bankTransfer || 'Bank Transfer' },
    { value: 'check', label: translations[language]?.check || 'Check' },
    { value: 'credit_card', label: translations[language]?.creditCard || 'Credit Card' },
    { value: 'other', label: translations[language]?.otherPayment || 'Other' },
  ];

  const parseStructuredInput = () => {
    const extracted = {};
    const fullText = `${aiInput.description} ${aiInput.address} ${aiInput.value} ${aiInput.additional}`;

    const locationRegex = /(?:at|@)\s*([0-9]+\s+[A-Za-z\s]+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|way|ln|lane))/i;
    const locationMatch = fullText.match(locationRegex);
    if (locationMatch) {
      extracted.location = locationMatch[1].trim();
    } else if (aiInput.address) {
      extracted.location = aiInput.address;
    }

    translatedServiceTypes.forEach(service => {
      if (fullText.toLowerCase().includes(service.toLowerCase())) {
        extracted.serviceType = service;
      }
    });

    const dateRegex = /(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/i;
    const dateMatch = fullText.match(dateRegex);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate)) {
        extracted.date = parsedDate.toISOString().split('T')[0];
      }
    }

    const amountRegex = /\$(\d+(?:\.\d{2})?)/;
    const amountMatch = fullText.match(amountRegex);
    if (amountMatch) {
      extracted.amount = amountMatch[1];
    } else if (aiInput.value) {
      extracted.amount = parseFloat(aiInput.value.replace(/[^0-9.]/g, '')) || '';
    }

    extracted.description = aiInput.description + (aiInput.additional ? `\n${aiInput.additional}` : '');

    return extracted;
  };

  const handleAiSubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const extractedData = parseStructuredInput();
      setFormData(prev => ({
        ...prev,
        ...extractedData,
        description: extractedData.description || prev.description,
        location: extractedData.location || prev.location,
        amount: extractedData.amount || prev.amount,
        serviceType: extractedData.serviceType || prev.serviceType,
        date: extractedData.date || prev.date,
      }));
      setIsProcessing(false);
      setAiInput({ description: '', address: '', value: '', additional: '' });
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, {
            file,
            url: event.target.result,
            name: file.name
          }]
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

  const handlePaymentMethodChange = (e) => {
    const selectedValue = e.target.value;
    setFormData(prev => ({ ...prev, paymentMethod: selectedValue, otherPaymentMethod: '' }));
    setShowOtherPaymentInput(selectedValue === 'other');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.workerId || !formData.serviceType || !formData.location) {
      alert(translations[language]?.fillRequiredFields || 'Please fill in all required fields');
      return;
    }
    if (formData.paymentMethod === 'other' && !formData.otherPaymentMethod.trim()) {
      alert(translations[language]?.specifyOtherPayment || 'Please specify other payment method');
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
    setShowOtherPaymentInput(false);
    alert(translations[language]?.submissionSuccess || 'Job submission successful!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {translations[language]?.workerSubmissionTitle || 'Worker Job Submission'}
          </h1>
          <p className="text-blue-100">
            {translations[language]?.workerSubmissionDescription || 'Submit job completion details'}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* AI Quick Input Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Send className="w-5 h-5 mr-2 text-blue-600" />
              {translations[language]?.quickAISubmission || 'Quick Job Details Input'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {translations[language]?.aiSubmissionDescription || 'AI will help parse and pre-fill the form'}
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.jobDescription || 'Job Description'}
                </label>
                <input
                  type="text"
                  value={aiInput.description}
                  onChange={(e) => setAiInput(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={translations[language]?.jobDescription || 'Job Description'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.jobAddress || 'Job Address'}
                </label>
                <input
                  type="text"
                  value={aiInput.address}
                  onChange={(e) => setAiInput(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g., 123 Main St, Anytown"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.jobValue || 'Job Value'}
                </label>
                <input
                  type="number"
                  value={aiInput.value}
                  onChange={(e) => setAiInput(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="e.g., 500.00"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.additionalInfo || 'Additional Info'}
                </label>
                <input
                  type="text"
                  value={aiInput.additional}
                  onChange={(e) => setAiInput(prev => ({ ...prev, additional: e.target.value }))}
                  placeholder="e.g., urgent, client feedback"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAiSubmit}
                disabled={isProcessing || (!aiInput.description && !aiInput.address && !aiInput.value && !aiInput.additional)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {translations[language]?.processing || 'Processing...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {translations[language]?.parseAndFill || 'Parse & Fill Form'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.worker || 'Worker'} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.workerId}
                    onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">{translations[language]?.selectWorker || 'Select Worker'}</option>
                    {workers.filter(w => w.active).map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.serviceType || 'Service Type'} *
                </label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">{translations[language]?.selectServiceType || 'Select Service Type'}</option>
                    {translatedServiceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations[language]?.location || 'Location'} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., 123 Main St, Anytown"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.jobDate || 'Job Date'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {translations[language]?.amount || 'Amount'}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g., 500.00"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations[language]?.description || 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="Detailed description of the work performed..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations[language]?.paymentMethod || 'Payment Method'}
              </label>
              <select
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {paymentMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
              {showOtherPaymentInput && (
                <input
                  type="text"
                  value={formData.otherPaymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherPaymentMethod: e.target.value }))}
                  placeholder={translations[language]?.specifyOtherPayment || 'Specify other payment method'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mt-3"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {translations[language]?.uploadImages || 'Upload Images'}
              </label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-semibold text-blue-600">{translations[language]?.clickToUpload || 'Click to upload'}</span>{' '}
                    {translations[language]?.orDragAndDrop || 'or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">{translations[language]?.imageFormats || 'PNG, JPG, GIF up to 10MB'}</p>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image.url} alt={image.name} className="w-full h-24 object-cover rounded-lg border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all flex items-center shadow-md font-semibold"
            >
              <Send className="w-5 h-5 mr-2" />
              {translations[language]?.submitJob || 'Submit Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkerSubmission;