const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Create a sample template for leads import
const template = [
  {
    'Company Name': 'ABC Technologies Pvt Ltd',
    'Contact Name': 'John Smith',
    'Email': 'john.smith@abctech.com',
    'Mobile': '+91 9876543210',
    'Phone': '+91 22 12345678',
    'City': 'Mumbai',
    'Address': '123 Business Park, Andheri East',
    'Industry': 'IT Services',
    'Project Name': 'E-commerce Website Development',
    'Project Description': 'Full-stack e-commerce platform with payment gateway integration',
    'Estimated Value': '500000',
    'Enquiry Type': 'Website Development',
    'Source': 'Website',
    'Status': 'New',
    'Priority': 'High',
    'Designation': 'IT Manager',
    'Notes': 'Looking for quick delivery within 3 months'
  },
  {
    'Company Name': 'XYZ Manufacturing Ltd',
    'Contact Name': 'Sarah Johnson',
    'Email': 'sarah.j@xyzmanuf.com',
    'Mobile': '+91 9988776655',
    'Phone': '+91 11 98765432',
    'City': 'Delhi',
    'Address': '456 Industrial Area, Gurgaon',
    'Industry': 'Manufacturing',
    'Project Name': 'Inventory Management System',
    'Project Description': 'Custom ERP solution for inventory and production management',
    'Estimated Value': '1200000',
    'Enquiry Type': 'Software Development',
    'Source': 'Referral',
    'Status': 'New',
    'Priority': 'Medium',
    'Designation': 'Operations Head',
    'Notes': 'Budget approved, need detailed proposal'
  },
  {
    'Company Name': 'PQR Retail Chain',
    'Contact Name': 'Mike Williams',
    'Email': 'mike@pqrretail.com',
    'Mobile': '+91 8877665544',
    'Phone': '+91 80 87654321',
    'City': 'Bangalore',
    'Address': '789 Commercial Street, Koramangala',
    'Industry': 'Retail',
    'Project Name': 'Mobile App Development',
    'Project Description': 'Customer loyalty and shopping app for retail chain',
    'Estimated Value': '300000',
    'Enquiry Type': 'Mobile App',
    'Source': 'Cold Call',
    'Status': 'New',
    'Priority': 'Low',
    'Designation': 'Marketing Director',
    'Notes': 'Timeline flexible, cost is primary concern'
  }
];

// Create workbook and worksheet
const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(template);

// Set column widths for better readability
const columnWidths = [
  { wch: 25 }, // Company Name
  { wch: 20 }, // Contact Name
  { wch: 25 }, // Email
  { wch: 15 }, // Mobile
  { wch: 15 }, // Phone
  { wch: 15 }, // City
  { wch: 30 }, // Address
  { wch: 15 }, // Industry
  { wch: 25 }, // Project Name
  { wch: 40 }, // Project Description
  { wch: 15 }, // Estimated Value
  { wch: 20 }, // Enquiry Type
  { wch: 15 }, // Source
  { wch: 10 }, // Status
  { wch: 10 }, // Priority
  { wch: 20 }, // Designation
  { wch: 30 }  // Notes
];

worksheet['!cols'] = columnWidths;

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads Template');

// Create instructions sheet
const instructions = [
  { 'Field': 'Company Name', 'Required': 'Yes', 'Description': 'Name of the company or organization', 'Example': 'ABC Technologies Pvt Ltd' },
  { 'Field': 'Contact Name', 'Required': 'Yes', 'Description': 'Primary contact person name', 'Example': 'John Smith' },
  { 'Field': 'Email', 'Required': 'No', 'Description': 'Contact email address', 'Example': 'john@company.com' },
  { 'Field': 'Mobile', 'Required': 'No', 'Description': 'Mobile phone number', 'Example': '+91 9876543210' },
  { 'Field': 'Phone', 'Required': 'No', 'Description': 'Office phone number', 'Example': '+91 22 12345678' },
  { 'Field': 'City', 'Required': 'No', 'Description': 'City where company is located', 'Example': 'Mumbai' },
  { 'Field': 'Address', 'Required': 'No', 'Description': 'Complete company address', 'Example': '123 Business Park' },
  { 'Field': 'Industry', 'Required': 'No', 'Description': 'Industry or business sector', 'Example': 'IT Services' },
  { 'Field': 'Project Name', 'Required': 'No', 'Description': 'Name or title of the project', 'Example': 'Website Development' },
  { 'Field': 'Project Description', 'Required': 'No', 'Description': 'Detailed project requirements', 'Example': 'E-commerce platform with payment gateway' },
  { 'Field': 'Estimated Value', 'Required': 'No', 'Description': 'Project value in INR (numbers only)', 'Example': '500000' },
  { 'Field': 'Enquiry Type', 'Required': 'No', 'Description': 'Type of service enquiry', 'Example': 'Website Development, Mobile App, Software Development' },
  { 'Field': 'Source', 'Required': 'No', 'Description': 'How did the lead come to you', 'Example': 'Website, Referral, Cold Call' },
  { 'Field': 'Status', 'Required': 'No', 'Description': 'Current lead status', 'Example': 'New, Contacted, Qualified' },
  { 'Field': 'Priority', 'Required': 'No', 'Description': 'Lead priority level', 'Example': 'Low, Medium, High, Urgent' },
  { 'Field': 'Designation', 'Required': 'No', 'Description': 'Contact person designation', 'Example': 'IT Manager, CEO' },
  { 'Field': 'Notes', 'Required': 'No', 'Description': 'Additional notes or comments', 'Example': 'Budget approved, timeline flexible' }
];

const instructionsSheet = XLSX.utils.json_to_sheet(instructions);
instructionsSheet['!cols'] = [
  { wch: 20 }, // Field
  { wch: 10 }, // Required
  { wch: 40 }, // Description
  { wch: 30 }  // Example
];

XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');

// Write the file
const outputPath = path.join(__dirname, 'leads_import_template.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✅ Leads import template created successfully!');
console.log(`📄 File saved at: ${outputPath}`);
console.log('\n📋 Template includes:');
console.log('   • Sample data with 3 example leads');
console.log('   • Proper column formatting');
console.log('   • Instructions sheet with field descriptions');
console.log('   • Column mappings for flexible imports');
console.log('\n🚀 You can now use this template for Excel imports in your CRM!');
