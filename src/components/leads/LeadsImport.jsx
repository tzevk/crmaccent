import React, { useState, useRef } from 'react';

const LeadsImport = ({ onImportComplete, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                         'application/vnd.ms-excel', 
                         'text/csv'];
      
      if (validTypes.includes(selectedFile.type) || 
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls') || 
          selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select a valid Excel (.xlsx, .xls) or CSV file');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('created_by', '1'); // TODO: Get from auth context

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        if (onImportComplete) {
          onImportComplete(data.results);
        }
      } else {
        setError(data.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      setError('Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleTemplate = () => {
    // Create a sample CSV template
    const headers = [
      'Company Name',
      'Contact Name', 
      'Contact Email',
      'City',
      'Project Description',
      'Enquiry Type',
      'Enquiry Status',
      'Enquiry Date'
    ];
    
    const sampleData = [
      ['Acme Corp', 'John Doe', 'john@acmecorp.com', 'New York', 'Website development project', 'Email', 'New', '2025-01-15'],
      ['Tech Solutions Ltd', 'Jane Smith', 'jane@techsolutions.com', 'San Francisco', 'Mobile app development', 'Website', 'Working', '2025-01-10']
    ];

    const csvContent = [headers, ...sampleData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'leads_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Import Leads from Excel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!results ? (
          <div>
            {/* File Upload Section */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mb-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Choose file
                  </button>
                  <span className="text-gray-500 ml-1">or drag and drop</span>
                </div>
                <p className="text-sm text-gray-500">Excel (.xlsx, .xls) or CSV files only</p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                />
              </div>

              {file && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800">Selected: {file.name}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            {/* Expected Columns Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-800 mb-2">Expected Column Headers:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                <div>• Company Name (required)</div>
                <div>• Contact Name</div>
                <div>• Contact Email</div>
                <div>• City</div>
                <div>• Project Description</div>
                <div>• Enquiry Type (Email, Phone, Website, etc.)</div>
                <div>• Enquiry Status (New, Working, etc.)</div>
                <div>• Enquiry Date</div>
              </div>
              <button
                onClick={downloadSampleTemplate}
                className="mt-3 text-sm text-blue-600 hover:text-blue-500 underline"
              >
                Download Sample Template
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Import Leads'}
              </button>
            </div>
          </div>
        ) : (
          /* Results Section */
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Results</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.total}</div>
                  <div className="text-sm text-blue-800">Total Rows</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.success}</div>
                  <div className="text-sm text-green-800">Success</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </div>

              {results.errors && results.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setFile(null);
                  setError('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Import More
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsImport;
