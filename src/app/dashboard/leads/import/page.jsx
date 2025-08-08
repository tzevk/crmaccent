'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileText, 
  Check,
  X,
  AlertCircle,
  Users,
  Database,
  RefreshCw,
  Eye,
  CheckCircle
} from 'lucide-react';

// Import components
import Navbar from '../../../../components/navigation/Navbar.jsx';

export default function ImportLeadsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [importStep, setImportStep] = useState(1);
  const [mappingData, setMappingData] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const fileInputRef = useRef(null);

  // Demo CSV data for preview matching the actual lead form fields
  const sampleCsvData = [
    {
      'Company Name': 'Tech Solutions Inc',
      'Contact Name': 'John Smith',
      'Contact Email': 'john@techsolutions.com',
      'City': 'New York',
      'Enquiry Type': 'Email',
      'Project Description': 'Looking for web development services',
      'Enquiry Status': 'New',
      'Project Status': 'Open',
      'Type': 'New'
    },
    {
      'Company Name': 'Marketing Pro',
      'Contact Name': 'Emily Davis',
      'Contact Email': 'emily@marketingpro.com',
      'City': 'Los Angeles',
      'Enquiry Type': 'Website',
      'Project Description': 'Need digital marketing consultation',
      'Enquiry Status': 'New',
      'Project Status': 'Open',
      'Type': 'New'
    },
    {
      'Company Name': 'Startup Hub',
      'Contact Name': 'David Johnson',
      'Contact Email': 'david@startuphub.com',
      'City': 'Chicago',
      'Enquiry Type': 'Phone',
      'Project Description': 'Software development project',
      'Enquiry Status': 'New',
      'Project Status': 'Open',
      'Type': 'New'
    }
  ];

  const fieldMappingOptions = [
    { value: 'company_name', label: 'Company Name' },
    { value: 'contact_name', label: 'Contact Name' },
    { value: 'contact_email', label: 'Contact Email' },
    { value: 'city', label: 'City' },
    { value: 'enquiry_type', label: 'Enquiry Type' },
    { value: 'project_description', label: 'Project Description' },
    { value: 'enquiry_status', label: 'Enquiry Status' },
    { value: 'project_status', label: 'Project Status' },
    { value: 'type', label: 'Type' },
    { value: 'followup1_description', label: 'Follow-up 1 Description' },
    { value: 'followup2_description', label: 'Follow-up 2 Description' },
    { value: 'followup3_description', label: 'Follow-up 3 Description' },
    { value: '', label: 'Do not import' }
  ];

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (userData && isAuthenticated === 'true') {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      router.push('/');
    }
  }, [router]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      alert('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUploadedFile(file);
    
    try {
      // For CSV files, we can parse them directly in the browser
      if (fileName.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.trim().split('\n');
        if (lines.length > 0) {
          // Better CSV parsing that handles quoted fields and commas within quotes
          const parseCSVLine = (line) => {
            const result = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim()); // Don't forget the last field
            return result;
          };
          
          const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
          const data = lines.slice(1).map(line => {
            const values = parseCSVLine(line).map(v => v.replace(/"/g, ''));
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });
          
          setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
          
          // Auto-map common column names
          const autoMapping = {};
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('company')) autoMapping[header] = 'company_name';
            else if (lowerHeader.includes('contact') && lowerHeader.includes('name')) autoMapping[header] = 'contact_name';
            else if (lowerHeader.includes('contact') && lowerHeader.includes('email')) autoMapping[header] = 'contact_email';
            else if (lowerHeader.includes('email') && !lowerHeader.includes('contact')) autoMapping[header] = 'contact_email';
            else if (lowerHeader.includes('city')) autoMapping[header] = 'city';
            else if (lowerHeader.includes('project') && lowerHeader.includes('description')) autoMapping[header] = 'project_description';
            else if (lowerHeader.includes('enquiry') && lowerHeader.includes('type')) autoMapping[header] = 'enquiry_type';
            else if (lowerHeader.includes('enquiry') && lowerHeader.includes('status')) autoMapping[header] = 'enquiry_status';
          });
          setMappingData(autoMapping);
          
          console.log(`📊 CSV parsed: ${lines.length - 1} records found`);
        }
      } else {
        // For Excel files, show file info
        setPreviewData([{
          'File Type': 'Excel',
          'Status': 'Ready for import',
          'Note': 'Excel files will be processed on import',
          'Filename': file.name,
          'Size': `${(file.size / 1024).toFixed(2)} KB`,
          'Records': 'Will be counted during import'
        }]);
        console.log(`📊 Excel file ready: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      alert('Error parsing file. Please check the file format and try again.');
      return;
    }
    
    setImportStep(2);
  };

  const handleMappingChange = (csvField, crmField) => {
    setMappingData(prev => ({
      ...prev,
      [csvField]: crmField
    }));
  };

  const validateMapping = () => {
    // Check if we have the required fields either mapped or in original column names
    const requiredFields = ['company_name', 'contact_name', 'contact_email'];
    const mappedFields = Object.values(mappingData);
    const originalFields = Object.keys(previewData[0] || {});
    
    // Check if required fields are mapped
    const hasRequiredMapped = requiredFields.every(field => mappedFields.includes(field));
    
    // Check if original column names match required fields (for files with correct headers)
    const hasRequiredInOriginal = requiredFields.every(field => {
      return originalFields.some(original => {
        const variations = {
          'company_name': ['Company Name', 'company_name', 'Company', 'company'],
          'contact_name': ['Contact Name', 'contact_name', 'Contact', 'Name', 'contact'],
          'contact_email': ['Contact Email', 'contact_email', 'Email', 'email']
        };
        return variations[field]?.includes(original);
      });
    });
    
    return hasRequiredMapped || hasRequiredInOriginal;
  };

  const skipMapping = () => {
    // Skip directly to import if file has correct column names
    setImportStep(3);
    handleImport();
  };

  const handleQuickImport = async (file) => {
    const validExtensions = ['.csv', '.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      alert('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setUploadedFile(file);
    
    // Skip field mapping for quick import - go directly to import
    setImportStep(3);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('created_by', user?.id || '1');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setImportProgress(100);

      setTimeout(() => {
        if (data.success) {
          setImportResults({
            total: data.results.total || 0,
            successful: data.results.success || 0,
            failed: data.results.failed || 0,
            duplicates: 0,
            errors: data.results.errors || []
          });
        } else {
          setImportResults({
            total: 0,
            successful: 0,
            failed: 1,
            duplicates: 0,
            errors: [data.message || 'Import failed']
          });
        }
        setImportStep(4);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Quick import error:', error);
      setImportResults({
        total: 0,
        successful: 0,
        failed: 1,
        duplicates: 0,
        errors: ['Failed to connect to server']
      });
      setImportStep(4);
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!validateMapping()) {
      alert('Please map required fields: Company Name, Contact Name and Contact Email');
      return;
    }

    if (!uploadedFile) {
      alert('No file selected for import');
      return;
    }

    setIsLoading(true);
    setImportStep(3);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('created_by', user?.id || '1');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/leads/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      clearInterval(progressInterval);
      setImportProgress(100);

      setTimeout(() => {
        if (data.success) {
          setImportResults({
            total: data.results.total || 0,
            successful: data.results.success || 0,
            failed: data.results.failed || 0,
            duplicates: 0,
            errors: data.results.errors || []
          });
        } else {
          setImportResults({
            total: 0,
            successful: 0,
            failed: 1,
            duplicates: 0,
            errors: [data.message || 'Import failed']
          });
        }
        setImportStep(4);
        setIsLoading(false);
      }, 500);

    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        total: 0,
        successful: 0,
        failed: 1,
        duplicates: 0,
        errors: ['Failed to connect to server']
      });
      setImportStep(4);
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Company Name,Contact Name,Contact Email,City,Enquiry Type,Project Description,Enquiry Status,Project Status,Type\n" +
      "Tech Solutions Inc,John Smith,john@techsolutions.com,New York,Email,Looking for web development services,New,Open,New\n" +
      "Marketing Pro,Emily Davis,emily@marketingpro.com,Los Angeles,Website,Need digital marketing consultation,New,Open,New\n" +
      "Startup Hub,David Johnson,david@startuphub.com,Chicago,Phone,Software development project,New,Open,New";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Navbar */}
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/dashboard/leads"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Leads
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Import Leads</h1>
            <p className="text-gray-600">Bulk import leads from CSV files</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  (importStep > step || importStep === 4) ? 'bg-green-600 text-white' :
                  (importStep === step || (importStep === 'quick' && step === 1) || (importStep === 'advanced' && step === 1)) ? 'bg-purple-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {(importStep > step || importStep === 4) ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`w-20 h-1 mx-4 ${
                    (importStep > step || importStep === 4) ? 'bg-green-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {(importStep === 1) && 'Choose Import Mode'}
                {(importStep === 'quick') && 'Quick Import - Upload File'}
                {(importStep === 'advanced') && 'Advanced Import - Upload File'}
                {importStep === 2 && 'Map Fields'}
                {importStep === 3 && 'Import Progress'}
                {importStep === 4 && 'Import Complete'}
              </p>
            </div>
          </div>
        </div>

        {/* Step 1: Import Options */}
        {importStep === 1 && (
          <div className="space-y-8">
            {/* Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Quick Import Option */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Import</h3>
                  <p className="text-gray-600 mb-6">Upload files with standard column names. No field mapping required.</p>
                  
                  <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Expected Column Names:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Company Name</li>
                      <li>• Contact Name</li>
                      <li>• Contact Email</li>
                      <li>• City, Project Description, etc.</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      setImportStep('quick');
                    }}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choose Quick Import
                  </button>
                </div>
              </div>

              {/* Advanced Import Option */}
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Database className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Import</h3>
                  <p className="text-gray-600 mb-6">Upload any CSV/Excel file and map columns to CRM fields manually.</p>
                  
                  <div className="text-left bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Custom field mapping</li>
                      <li>• Data preview before import</li>
                      <li>• Flexible column names</li>
                      <li>• Validation & error handling</li>
                    </ul>
                  </div>
                  
                  <button
                    onClick={() => {
                      setImportStep('advanced');
                    }}
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Database className="w-5 h-5 mr-2" />
                    Choose Advanced Import
                  </button>
                </div>
              </div>
            </div>

            {/* General Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">General Requirements</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
                    <li>• Required fields: Company Name, Contact Name, Contact Email</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• First row should contain column headers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Import Step */}
        {importStep === 'quick' && (
          <div className="space-y-8">
            {/* Quick Import Header */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start">
                <Upload className="w-6 h-6 text-green-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Quick Import Mode</h3>
                  <p className="text-sm text-green-800">Upload files with standard column names. The system will automatically detect and import your data.</p>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Template</h3>
                  <p className="text-gray-600">Get a sample CSV file with the correct format</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? 'border-green-400 bg-green-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Your File</h3>
              <p className="text-gray-600 mb-6">Drag and drop your file here, or click to browse</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5 mr-2" />
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    handleQuickImport(file);
                  }
                }}
                className="hidden"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setImportStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Import Options
              </button>
            </div>
          </div>
        )}

        {/* Advanced Import Step */}
        {importStep === 'advanced' && (
          <div className="space-y-8">
            {/* Advanced Import Header */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start">
                <Database className="w-6 h-6 text-purple-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-900 mb-2">Advanced Import Mode</h3>
                  <p className="text-sm text-purple-800">Upload any CSV/Excel file and map columns manually. Preview your data before import.</p>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Template</h3>
                  <p className="text-gray-600">Get a sample CSV file with the correct format</p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload CSV or Excel File</h3>
              <p className="text-gray-600 mb-6">Drag and drop your file here, or click to browse</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5 mr-2" />
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setImportStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Import Options
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Field Mapping */}
        {importStep === 2 && (
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Mapping</h3>
              <p className="text-gray-600 mb-6">Map your CSV columns to CRM fields</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(previewData[0] || {}).map((csvField) => (
                  <div key={csvField} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CSV Column: <span className="font-semibold">{csvField}</span>
                      </label>
                      <select
                        value={mappingData[csvField] || ''}
                        onChange={(e) => handleMappingChange(csvField, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select CRM field...</option>
                        {fieldMappingOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Required Fields</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Name and Email are required fields and must be mapped to proceed with import.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Data */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Data Preview</h3>
                <p className="text-gray-600">Preview of the first few rows from your CSV</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      {Object.keys(previewData[0] || {}).map((header) => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {previewData.slice(0, 3).map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4 text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={() => setImportStep(1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              
              <div className="flex space-x-3">
                {/* Skip Mapping button for files with correct headers */}
                {uploadedFile && uploadedFile.name.endsWith('.csv') && (
                  <button
                    onClick={skipMapping}
                    className="px-6 py-3 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Skip Mapping & Import
                  </button>
                )}
                
                <button
                  onClick={handleImport}
                  disabled={!validateMapping()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Database className="w-5 h-5 mr-2" />
                  Start Import
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Import Progress */}
        {importStep === 3 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 text-center">
            <RefreshCw className="w-16 h-16 text-purple-600 mx-auto mb-6 animate-spin" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Importing Leads...</h3>
            <p className="text-gray-600 mb-8">Please wait while we process your data</p>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm text-gray-900 font-medium">{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Import Results */}
        {importStep === 4 && importResults && (
          <div className="space-y-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-gray-200 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Import Complete!</h3>
              <p className="text-gray-600 mb-8">Your leads have been successfully imported</p>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{importResults.total}</p>
                  <p className="text-sm text-gray-600">Total Records</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{importResults.successful}</p>
                  <p className="text-sm text-gray-600">Successful</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{importResults.failed}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{importResults.duplicates}</p>
                  <p className="text-sm text-gray-600">Duplicates</p>
                </div>
              </div>
            </div>

            {/* Error Details */}
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-red-600 mb-4">Import Errors</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {importResults.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700 mb-2">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">🎉 Import Complete! What's Next?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium">✅ Review Your Data:</p>
                  <p>Check imported leads and update any missing information</p>
                </div>
                <div>
                  <p className="font-medium">📞 Start Follow-ups:</p>
                  <p>Reach out to new leads and schedule activities</p>
                </div>
                <div>
                  <p className="font-medium">📊 Track Progress:</p>
                  <p>Monitor lead status changes and conversion rates</p>
                </div>
                <div>
                  <p className="font-medium">🔄 Keep Importing:</p>
                  <p>Add more leads as you receive new enquiries</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Link
                href="/dashboard/leads"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Eye className="w-5 h-5 mr-2" />
                View Imported Leads
              </Link>
              <button
                onClick={() => {
                  setImportStep(1);
                  setUploadedFile(null);
                  setMappingData({});
                  setPreviewData([]);
                  setImportProgress(0);
                  setImportResults(null);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Import More Leads
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}