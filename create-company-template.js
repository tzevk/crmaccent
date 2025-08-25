const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Sample company data for template
const sampleCompanies = [
  { 
    'Company Name': 'Tech Solutions Inc', 
    'City': 'Mumbai', 
    'Sector': 'Technology',
    'Phone': '+91 98765 43210',
    'Email': 'info@techsolutions.com'
  },
  { 
    'Company Name': 'Healthcare Partners Ltd', 
    'City': 'Delhi', 
    'Sector': 'Healthcare',
    'Phone': '+91 87654 32109',
    'Email': 'contact@healthpartners.com'
  },
  { 
    'Company Name': 'Financial Advisors Corp', 
    'City': 'Bangalore', 
    'Sector': 'Finance',
    'Phone': '+91 76543 21098',
    'Email': 'support@financialadvisors.com'
  },
  { 
    'Company Name': 'Education Excellence Academy', 
    'City': 'Chennai', 
    'Sector': 'Education',
    'Phone': '+91 65432 10987',
    'Email': 'admissions@eduexcellence.com'
  },
  { 
    'Company Name': 'Manufacturing Pro Pvt Ltd', 
    'City': 'Pune', 
    'Sector': 'Manufacturing',
    'Phone': '+91 54321 09876',
    'Email': 'orders@manufacturingpro.com'
  }
];

// Create workbook and worksheet
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(sampleCompanies);

// Add worksheet to workbook
XLSX.utils.book_append_sheet(wb, ws, 'Company Names');

// Write to file
const outputPath = path.join(__dirname, 'company_names_template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Company names template created successfully at: ${outputPath}`);
console.log('');
console.log('Template includes columns for:');
console.log('- Company Name (Required)');
console.log('- City (Optional)');
console.log('- Sector (Optional)'); 
console.log('- Phone (Optional)');
console.log('- Email (Optional)');
console.log('');
console.log('You can modify this template and upload it through the Import Excel option in Company Management.');
