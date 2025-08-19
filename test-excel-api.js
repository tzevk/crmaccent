const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testExcelImportAPI() {
  try {
    const form = new FormData();
    const filePath = '/Users/tanvikadam/Desktop/desktop/crmaccent/leads_import_template.xlsx';
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Excel test file not found:', filePath);
      return;
    }
    
    form.append('file', fs.createReadStream(filePath));
    form.append('created_by', '1');
    
    console.log('Sending Excel file to API...');
    const response = await fetch('http://localhost:3000/api/leads/import', {
      method: 'POST',
      body: form
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Excel test error:', error);
  }
}

testExcelImportAPI();
