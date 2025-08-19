// Create a sample Excel file for leads import
const XLSX = require('xlsx');
const path = require('path');

function createExcelTemplate() {
  const data = [
    [
      'Company Name', 
      'Contact Name', 
      'Contact Email', 
      'City', 
      'Enquiry Type', 
      'Project Description', 
      'Enquiry Status', 
      'Project Status', 
      'Type'
    ],
    [
      'Tech Solutions Inc',
      'John Smith',
      'john@techsolutions.com',
      'New York',
      'Email',
      'Looking for web development services',
      'New',
      'Open',
      'New'
    ],
    [
      'Marketing Pro',
      'Emily Davis',
      'emily@marketingpro.com',
      'Los Angeles',
      'Website',
      'Need digital marketing consultation',
      'New',
      'Open',
      'New'
    ],
    [
      'Startup Hub',
      'David Johnson',
      'david@startuphub.com',
      'Chicago',
      'Phone',
      'Software development project',
      'New',
      'Open',
      'New'
    ]
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  // Write to file
  const filePath = path.join(__dirname, 'leads_import_template.xlsx');
  XLSX.writeFile(workbook, filePath);
  
  console.log('Excel template created:', filePath);
}

createExcelTemplate();
