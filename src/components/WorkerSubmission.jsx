import React, { useState } from 'react';
import { Camera, Send, MapPin, Calendar, DollarSign, User, Wrench, X } from 'lucide-react';

const WorkerSubmission = ({ onSubmit, workers, language, translations }) => {
  const [formData, setFormData] = useState({
    workerId: '',
    serviceType: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    paymentMethod: 'cash',
    otherPaymentMethod: '', // New state for custom payment method
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

  const serviceTypes = [
    'Painting', 'Plumbing', 'Electrical', 'Carpentry',
    'Roofing', 'Flooring', 'HVAC', 'General Contractor'
  ];

  const paymentMethods = [
    { value: 'cash', label: translations[language].cash },
    { value: 'bank_transfer', label: translations[language].bankTransfer },
    { value: 'check', label: translations[language].check },
    { value: 'credit_card', label: translations[language].creditCard },
    { value: 'other', label: translations[language].otherPayment },
  ];

  // AI-powered text parsing simulation (adapted for structured input)
  const parseStructuredInput = () => {
    const extracted = {};
    const fullText = `${aiInput.description} ${aiInput.address} ${aiInput.value} ${aiInput.additional}`;

    // Extract location patterns
    const locationRegex = /(?:at|@)\s*([0-9]+\s+[A-Za-z\s]+(?:st|street|ave|avenue|rd|road|dr|drive|blvd|boulevard|way|ln|lane))/i;
    const locationMatch = fullText.match(locationRegex);
    if (locationMatch) {
      extracted.location = locationMatch[1].trim();
    } else if (aiInput.address) {
      extracted.location = aiInput.address;
    }

    // Extract service type
    serviceTypes.forEach(service => {
      if (fullText.toLowerCase().includes(service.toLowerCase())) {
        extracted.serviceType = service;
      }
    });

    // Extract dates (if any in description/additional)
    const dateRegex = /(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december)\s+\d{1,2}|\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/i;
    const dateMatch = fullText.match(dateRegex);
    if (dateMatch) {
      const parsedDate = new Date(dateMatch[0]);
      if (!isNaN(parsedDate)) {
        extracted.date = parsedDate.toISOString().split('T')[0];
      }
    }

    // Extract amount
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
        // Ensure description is updated from AI input
        description: extractedData.description || prev.description,
        location: extractedData.location || prev.location,
        amount: extractedData.amount || prev.amount,
        serviceType: extractedData.serviceType || prev.serviceType,
        date: extractedData.date || prev.date,
      }));
      setIsProcessing(false);
      setAiInput({ description: '', address: '', value: '', additional: '' }); // Clear AI input fields
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      try {
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
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          alert("Failed to read image file. Please try again.");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error during image upload:", error);
        alert("An error occurred during image upload. Please try again.");
      }
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
      alert(translations[language].fillRequiredFields);
      return;
    }
    if (formData.paymentMethod === 'other' && !formData.otherPaymentMethod.trim()) {
      alert(translations[language].specifyOtherPayment);
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
    alert(translations[language].submissionSuccess);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{translations[language].workerSubmissionTitle}</h2>
          <p className="text-gray-600">{translations[language].workerSubmissionDescription}</p>
        </div>

        <div className="p-6 space-y-8">
          {/* AI Structured Input Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Send className="w-5 h-5 mr-2 text-blue-600" />
              {translations[language].quickAISubmission}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {translations[language].aiSubmissionDescription}
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="aiDescription" className="block text-sm font-medium text-gray-700 mb-1">{translations[language].jobDescription}</label>
                  <input
                    type="text"
                    id="aiDescription"
                    value={aiInput.description}
                    onChange={(e) => setAiInput(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={translations[language].jobDescription}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="aiAddress" className="block text-sm font-medium text-gray-700 mb-1">{translations[language].jobAddress}</label>
                  <input
                    type="text"
                    id="aiAddress"
                    value={aiInput.address}
                    onChange={(e) => setAiInput(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g., 123 Main St, Anytown"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="aiValue" className="block text-sm font-medium text-gray-700 mb-1">{translations[language].jobValue}</label>
                  <input
                    type="number"
                    id="aiValue"
                    value={aiInput.value}
                    onChange={(e) => setAiInput(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g., 500.00"
                    step="0.01"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="aiAdditional" className="block text-sm font-medium text-gray-700 mb-1">{translations[language].additionalInfo}</label>
                  <input
                    type="text"
                    id="aiAdditional"
                    value={aiInput.additional}
                    onChange={(e) => setAiInput(prev => ({ ...prev, additional: e.target.value }))}
                    placeholder="e.g., urgent, client feedback"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAiSubmit}
                  disabled={isProcessing || (!aiInput.description && !aiInput.address && !aiInput.value && !aiInput.additional)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {translations[language].processing}
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {translations[language].parseAndFill}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Manual Form Submission */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="workerId" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations[language].worker} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="workerId"
                    name="workerId"
                    value={formData.workerId}
                    onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{translations[language].selectWorker}</option>
                    {workers.filter(w => w.active).map(worker => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name} ({worker.specialty})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations[language].serviceType} *
                </label>
                <div className="relative">
                  <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="serviceType"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">{translations[language].selectServiceType}</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                {translations[language].location} *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., 123 Main St, Anytown"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                {translations[language].jobDate}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {translations[language].description}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                placeholder="Detailed description of the work performed..."
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations[language].amount}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g., 500.00"
                    step="0.01"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations[language].paymentMethod}
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handlePaymentMethodChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                    placeholder={translations[language].specifyOtherPayment}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mt-2"
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
                {translations[language].uploadImages}
              </label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Camera className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">{translations[language].clickToUpload}</span> {translations[language].orDragAndDrop}</p>
                    <p className="text-xs text-gray-500">{translations[language].imageFormats}</p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleImageUpload} accept="image/*" />
                </label>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img src={image.url} alt={image.name} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                      aria-label={translations[language].remove}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Send className="w-5 h-5 mr-2" />
                {translations[language].submitJob}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkerSubmission;