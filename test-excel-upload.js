const fs = require('fs');
const path = require('path');
const { IncomingForm } = require('formidable');
const XLSX = require('xlsx');

// Test file processing function
function testExcelFileProcessing() {
  console.log('Testing Excel file processing...');
  
  // Check if xlsx package is working
  try {
    console.log('XLSX package version:', XLSX.version);
    console.log('XLSX utils available:', typeof XLSX.utils);
    console.log('XLSX read function available:', typeof XLSX.read);
    console.log('XLSX sheet_to_json available:', typeof XLSX.utils.sheet_to_json);
    
    // Test with a simple buffer
    const testData = [
      ['Company Name', 'Contact Name', 'Contact Email'],
      ['Test Company', 'John Doe', 'john@test.com']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(testData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Write to buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    console.log('Test buffer created, size:', buffer.length);
    
    // Try to read it back
    const readWb = XLSX.read(buffer, { type: 'buffer' });
    const readWs = readWb.Sheets[readWb.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(readWs);
    
    console.log('Successfully processed test Excel data:', jsonData);
    return true;
  } catch (error) {
    console.error('Error testing XLSX package:', error);
    return false;
  }
}

// Test formidable package
function testFormidablePackage() {
  console.log('Testing Formidable package...');
  
  try {
    const form = new IncomingForm({ multiples: false });
    console.log('Formidable form created successfully');
    console.log('Formidable version available');
    return true;
  } catch (error) {
    console.error('Error testing Formidable package:', error);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('=== Excel Upload Functionality Tests ===\n');
  
  const xlsxTest = testExcelFileProcessing();
  const formidableTest = testFormidablePackage();
  
  console.log('\n=== Test Results ===');
  console.log('XLSX Package Test:', xlsxTest ? 'PASS' : 'FAIL');
  console.log('Formidable Package Test:', formidableTest ? 'PASS' : 'FAIL');
  
  if (xlsxTest && formidableTest) {
    console.log('\n✅ All basic functionality tests passed!');
    console.log('The issue might be in the API endpoint or file handling logic.');
  } else {
    console.log('\n❌ Some tests failed. Check package installations.');
  }
}

runTests();
