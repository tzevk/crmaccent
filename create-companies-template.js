const XLSX = require('xlsx');
const path = require('path');

// Sample company data for Excel template
const sampleCompanies = [
  {
    'Company Name': 'Tech Solutions Pvt Ltd',
    'Address': '123 Business Park, Sector 18',
    'City': 'Gurgaon',
    'State': 'Haryana',
    'Country': 'India',
    'Sector': 'Information Technology',
    'Phone': '+91-124-4567890',
    'Email': 'contact@techsolutions.com',
    'Website': 'https://www.techsolutions.com'
  },
  {
    'Company Name': 'Manufacturing Industries Ltd',
    'Address': 'Industrial Area Phase 2',
    'City': 'Pune',
    'State': 'Maharashtra',
    'Country': 'India',
    'Sector': 'Manufacturing',
    'Phone': '+91-20-2345678',
    'Email': 'info@manufacturing.com',
    'Website': 'https://www.manufacturing.com'
  },
  {
    'Company Name': 'Global Consulting Group',
    'Address': 'Corporate Tower, MG Road',
    'City': 'Bangalore',
    'State': 'Karnataka',
    'Country': 'India',
    'Sector': 'Consulting',
    'Phone': '+91-80-9876543',
    'Email': 'hello@globalconsulting.com',
    'Website': 'https://www.globalconsulting.com'
  },
  {
    'Company Name': 'Financial Services Corp',
    'Address': 'Financial District',
    'City': 'Mumbai',
    'State': 'Maharashtra',
    'Country': 'India',
    'Sector': 'Financial Services',
    'Phone': '+91-22-1234567',
    'Email': 'contact@financialservices.com',
    'Website': 'https://www.financialservices.com'
  },
  {
    'Company Name': 'Healthcare Innovations',
    'Address': 'Medical Hub Complex',
    'City': 'Chennai',
    'State': 'Tamil Nadu',
    'Country': 'India',
    'Sector': 'Healthcare',
    'Phone': '+91-44-8765432',
    'Email': 'info@healthcareinnovations.com',
    'Website': 'https://www.healthcareinnovations.com'
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(sampleCompanies);

// Add the worksheet to workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies');

// Write the file
const outputPath = path.join(__dirname, 'companies_import_template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Companies import template created:', outputPath);
console.log('📋 Template contains 5 sample companies with the following columns:');
console.log('   - Company Name (required)');
console.log('   - Address');
console.log('   - City');
console.log('   - State');
console.log('   - Country');
console.log('   - Sector');
console.log('   - Phone');
console.log('   - Email');
console.log('   - Website');
console.log('');
console.log('🚀 You can now use this template to import companies into the system!');
