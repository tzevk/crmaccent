const fs = require('fs');
const path = require('path');

// Test data for the Excel template
const testEmployees = [
  { 'SR.NO': 1, 'Employee Code': 'EMP001', 'Full Name': 'Rajesh Kumar' },
  { 'SR.NO': 2, 'Employee Code': 'EMP002', 'Full Name': 'Priya Sharma' },
  { 'SR.NO': 3, 'Employee Code': 'EMP003', 'Full Name': 'Amit Singh' },
  { 'SR.NO': 4, 'Employee Code': 'EMP004', 'Full Name': 'Sunita Gupta' },
  { 'SR.NO': 5, 'Employee Code': 'EMP005', 'Full Name': 'Vikram Patel' }
];

// Create CSV content
const csvHeaders = 'SR.NO,Employee Code,Full Name\n';
const csvData = testEmployees.map(emp => 
  `${emp['SR.NO']},"${emp['Employee Code']}","${emp['Full Name']}"`
).join('\n');

const csvContent = csvHeaders + csvData;

// Write CSV file
fs.writeFileSync('employees_test_data.csv', csvContent);

console.log('✅ Test CSV file created: employees_test_data.csv');
console.log('📄 File contains:', testEmployees.length, 'employee records');
console.log('📋 You can use this file to test the import functionality');
console.log('\nFile contents preview:');
console.log(csvContent);
