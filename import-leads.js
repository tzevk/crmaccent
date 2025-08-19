const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function importLeadsCSV() {
  try {
    const form = new FormData();
    const filePath = '/Users/tanvikadam/Desktop/desktop/crmaccent/leads_import_template.csv';
    
    console.log('Checking file...');
    if (!fs.existsSync(filePath)) {
      console.error('CSV file not found at:', filePath);
      return;
    }
    
    const fileStats = fs.statSync(filePath);
    console.log(`File size: ${fileStats.size} bytes`);
    
    form.append('file', fs.createReadStream(filePath));
    form.append('created_by', '1');
    
    console.log('Importing CSV file with real leads data...');
    console.log('This may take a moment for 57+ leads...');
    
    const response = await fetch('http://localhost:3000/api/leads/import', {
      method: 'POST',
      body: form
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Import successful!');
      console.log(`📊 Results:`);
      console.log(`   Total records processed: ${data.results.total}`);
      console.log(`   Successfully imported: ${data.results.success}`);
      console.log(`   Failed imports: ${data.results.failed}`);
      
      if (data.results.errors && data.results.errors.length > 0) {
        console.log('⚠️  Errors:');
        data.results.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('❌ Import failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Import error:', error.message);
  }
}

importLeadsCSV();
