const XLSX = require('xlsx');
const path = require('path');

function createEmployeeImportTemplate() {
  // Create sample data
  const templateData = [
    {
      'SR.NO': 1,
      'Employee Code': 'EMP001',
      'Full Name': 'John Doe'
    },
    {
      'SR.NO': 2,
      'Employee Code': 'EMP002', 
      'Full Name': 'Jane Smith'
    },
    {
      'SR.NO': 3,
      'Employee Code': 'EMP003',
      'Full Name': 'Mike Johnson'
    }
  ];

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create worksheet from the template data
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  const columnWidths = [
    { wch: 10 }, // SR.NO
    { wch: 15 }, // Employee Code
    { wch: 25 }  // Full Name
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add the worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Import Template');
  
  // Create the public directory if it doesn't exist
  const publicDir = path.join(process.cwd(), 'public');
  
  // Write the file
  const filePath = path.join(publicDir, 'employee_import_template.xlsx');
  XLSX.writeFile(workbook, filePath);
  
  console.log('✅ Employee import template created successfully!');
  console.log('📄 File location:', filePath);
  console.log('🌐 Download URL: http://localhost:3000/employee_import_template.xlsx');
}

// Run the function
createEmployeeImportTemplate();
