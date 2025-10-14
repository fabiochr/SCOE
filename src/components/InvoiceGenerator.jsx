import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Download, X, FileText } from 'lucide-react';

const InvoiceGenerator = ({ jobs, workers, onClose, language, translations }) => {
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clientName: '',
    clientAddress: '',
    notes: ''
  });

  const handleJobToggle = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectedJobsData = jobs.filter(job => selectedJobs.includes(job.id));
  const totalAmount = selectedJobsData.reduce((sum, job) => sum + (job.amount || 0), 0);

  const generatePDF = () => {
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.text(translations[language].generateInvoiceTitle.toUpperCase(), 20, 30);
    
    // Invoice details
    pdf.setFontSize(12);
    pdf.text(`${translations[language].invoiceNumber}: ${invoiceData.invoiceNumber}`, 20, 50);
    pdf.text(`${translations[language].invoiceDate}: ${format(new Date(invoiceData.date), 'MMM d, yyyy')}`, 20, 60);
    pdf.text(`${translations[language].dueDate}: ${format(new Date(invoiceData.dueDate), 'MMM d, yyyy')}`, 20, 70);
    
    // Client info
    if (invoiceData.clientName) {
      pdf.text(`${translations[language].clientName}:`, 20, 90);
      pdf.text(invoiceData.clientName, 20, 100);
      if (invoiceData.clientAddress) {
        const addressLines = invoiceData.clientAddress.split('\n');
        addressLines.forEach((line, index) => {
          pdf.text(line, 20, 110 + (index * 10));
        });
      }
    }
    
    // Company info (right side)
    pdf.text(translations[language].appTitle, 140, 50); // Using appTitle from translations
    pdf.text('Your Construction Company', 140, 60); // This could also be translated
    pdf.text('123 Business St', 140, 70); // This could also be translated
    pdf.text('City, State 12345', 140, 80); // This could also be translated
    
    // Table header
    let yPos = invoiceData.clientAddress ? 150 : 130;
    pdf.setFontSize(10);
    pdf.text(translations[language].description, 20, yPos);
    pdf.text(translations[language].worker, 90, yPos);
    pdf.text(translations[language].date, 130, yPos);
    pdf.text(translations[language].amount, 170, yPos);
    
    // Table line
    pdf.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    
    // Job items
    selectedJobsData.forEach((job, index) => {
      const description = `${job.serviceType} - ${job.location}`;
      pdf.text(description.substring(0, 35), 20, yPos);
      pdf.text(job.workerName || 'Unknown', 90, yPos);
      pdf.text(job.date ? format(new Date(job.date), 'MM/dd/yy') : '', 130, yPos);
      pdf.text(`$${(job.amount || 0).toFixed(2)}`, 170, yPos);
      yPos += 10;
    });
    
    // Total
    pdf.line(20, yPos + 5, 190, yPos + 5);
    pdf.setFontSize(12);
    pdf.text(`${translations[language].total}:`, 130, yPos + 20);
    pdf.text(`$${totalAmount.toFixed(2)}`, 170, yPos + 20);
    
    // Notes
    if (invoiceData.notes) {
      pdf.setFontSize(10);
      pdf.text(`${translations[language].notes}:`, 20, yPos + 40);
      const noteLines = invoiceData.notes.split('\n');
      noteLines.forEach((line, index) => {
        pdf.text(line, 20, yPos + 50 + (index * 10));
      });
    }
    
    // Save
    pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{translations[language].generateInvoiceTitle}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Invoice Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations[language].invoiceInformation}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].invoiceNumber}
                  </label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNumber}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].invoiceDate}
                    </label>
                    <input
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {translations[language].dueDate}
                    </label>
                    <input
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].clientName}
                  </label>
                  <input
                    type="text"
                    value={invoiceData.clientName}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder={translations[language].clientName}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].clientAddress}
                  </label>
                  <textarea
                    value={invoiceData.clientAddress}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    placeholder={translations[language].clientAddress}
                    rows={3}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {translations[language].notes}
                  </label>
                  <textarea
                    value={invoiceData.notes}
                    onChange={(e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={translations[language].notes}
                    rows={3}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations[language].selectJobsToInclude}</h3>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {selectedJobs.length} {translations[language].jobsSelected}
                    </span>
                    <span className="text-sm font-medium">
                      {translations[language].total}: ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="divide-y">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleJobToggle(job.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {job.serviceType} - {job.location}
                              </p>
                              <p className="text-sm text-gray-500">
                                {job.workerName} • {job.date && format(new Date(job.date), 'MMM d, yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                ${(job.amount || 0).toFixed(2)}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                job.paymentStatus === 'paid' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {translations[language][`status${job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}`]}
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {translations[language].cancel}
            </button>
            <button
              onClick={generatePDF}
              disabled={selectedJobs.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {translations[language].generatePdfInvoice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;