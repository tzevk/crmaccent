import { query } from '@/lib/db';
import * as XLSX from 'xlsx';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '' // Default value for empty cells
    });
    
    if (jsonData.length < 2) {
      return Response.json(
        { error: 'Excel file must contain at least a header row and one data row' },
        { status: 400 }
      );
    }
    
    const headers = jsonData[0]; // First row contains headers
    const dataRows = jsonData.slice(1); // Remaining rows contain data
    
    console.log('Headers found:', headers);
    console.log('Number of data rows:', dataRows.length);
    
    // Create a mapping of Excel columns to database columns
    const columnMapping = {
      'SR.NO': 'srNo',
      'Sr.No': 'srNo',
      'Serial No': 'srNo',
      'Employee Code': 'username',
      'Emp Code': 'username',
      'Code': 'username',
      'Full Name': 'fullName',
      'Name': 'fullName',
      'Employee Name': 'fullName',
      'First Name': 'firstName',
      'Last Name': 'lastName',
      // Add more mappings as needed
      'Email': 'email',
      'Email ID': 'email',
      'Department': 'department',
      'Role': 'role',
      'Position': 'role',
      'Phone': 'mobile',
      'Mobile': 'mobile',
      'Joining Date': 'joiningDate',
      'Basic Salary': 'basicSalary',
      'Gender': 'gender',
      'Employee Type': 'empType',
      'Status': 'employeeStatus',
      'City': 'city',
      'State': 'state',
      'Address': 'presentAddress',
      'PIN': 'pin',
      'DOB': 'dob',
      'Date of Birth': 'dob',
      'Marital Status': 'maritalStatus',
      'PF No': 'pfNo',
      'Qualification': 'qualification',
      'Institute': 'institute',
      'Passing Year': 'passingYear'
    };
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Process each data row
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex];
      const rowNumber = rowIndex + 2; // +2 because we're starting from row 2 (after header)
      
      try {
        // Skip empty rows
        if (row.every(cell => cell === '' || cell === null || cell === undefined)) {
          continue;
        }
        
        // Create employee object from row data
        const employeeData = {};
        
        // Map Excel columns to database fields
        headers.forEach((header, colIndex) => {
          // Try exact match first
          let dbField = columnMapping[header];
          
          // If no exact match, try case-insensitive match
          if (!dbField) {
            const headerLower = header.toLowerCase().trim();
            const mappingKey = Object.keys(columnMapping).find(key => 
              key.toLowerCase().trim() === headerLower
            );
            if (mappingKey) {
              dbField = columnMapping[mappingKey];
            }
          }
          
          if (dbField && colIndex < row.length) {
            const cellValue = row[colIndex];
            // Only set the value if it's not empty
            if (cellValue !== '' && cellValue !== null && cellValue !== undefined) {
              employeeData[dbField] = cellValue;
            }
          }
        });
        
        console.log('Mapped employee data:', employeeData);
        
        // Handle Full Name splitting
        if (employeeData.fullName) {
          const nameParts = employeeData.fullName.trim().split(' ');
          employeeData.firstName = nameParts[0] || '';
          employeeData.lastName = nameParts.slice(1).join(' ') || '';
          console.log(`Name split: "${employeeData.fullName}" -> firstName: "${employeeData.firstName}", lastName: "${employeeData.lastName}"`);
        }
        
        // Set defaults for required fields
        if (!employeeData.username) {
          employeeData.username = `emp_${Date.now()}_${rowNumber}`;
        }
        if (!employeeData.firstName) {
          employeeData.firstName = employeeData.fullName || 'Unknown';
          console.log('No firstName found, setting to:', employeeData.firstName);
        }
        if (!employeeData.lastName) {
          employeeData.lastName = '';
        }
        
        // Set default values
        employeeData.gender = employeeData.gender || 'Male';
        employeeData.empType = employeeData.empType || 'Permanent';
        employeeData.employeeStatus = employeeData.employeeStatus || 'Working';
        employeeData.country = 'India';
        employeeData.maritalStatus = employeeData.maritalStatus || 'Single';
        
        // Convert numeric fields
        if (employeeData.basicSalary) {
          employeeData.basicSalary = parseFloat(employeeData.basicSalary) || 0;
        } else {
          employeeData.basicSalary = 0;
        }
        
        if (employeeData.passingYear) {
          employeeData.passingYear = parseInt(employeeData.passingYear) || null;
        }
        
        // Format dates
        if (employeeData.joiningDate) {
          const date = new Date(employeeData.joiningDate);
          if (!isNaN(date.getTime())) {
            employeeData.joiningDate = date.toISOString().split('T')[0];
          } else {
            employeeData.joiningDate = null;
          }
        }
        
        if (employeeData.dob) {
          const date = new Date(employeeData.dob);
          if (!isNaN(date.getTime())) {
            employeeData.dob = date.toISOString().split('T')[0];
          } else {
            employeeData.dob = null;
          }
        }
        
        console.log(`Processing row ${rowNumber}:`, employeeData);
        
        // Insert into database
        const sql = `
          INSERT INTO employees (
            username, firstName, lastName, gender, empType, department, 
            role, email, mobile, phone, joiningDate, employeeStatus, basicSalary,
            country, maritalStatus, presentAddress, city, state, pin, dob,
            pfNo, qualification, institute, passingYear,
            da, hra, conveyanceAllowance, otherAllowance,
            bonus, pf, mlwf, pt, esic, tds,
            bonusAmount, pfAmount, mlwfPercentage, ptAmount, esicPercentage, tdsPercentage,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [
          employeeData.username || `emp_${Date.now()}_${rowNumber}`,
          employeeData.firstName || 'Unknown',
          employeeData.lastName || '',
          employeeData.gender || 'Male',
          employeeData.empType || 'Permanent',
          employeeData.department || '',
          employeeData.role || '',
          employeeData.email || '',
          employeeData.mobile || '',
          employeeData.phone || '',
          employeeData.joiningDate || null,
          employeeData.employeeStatus || 'Working',
          employeeData.basicSalary || 0,
          employeeData.country || 'India',
          employeeData.maritalStatus || 'Single',
          employeeData.presentAddress || '',
          employeeData.city || '',
          employeeData.state || '',
          employeeData.pin || '',
          employeeData.dob || null,
          employeeData.pfNo || '',
          employeeData.qualification || '',
          employeeData.institute || '',
          employeeData.passingYear || null,
          0, // da
          0, // hra
          0, // conveyanceAllowance
          0, // otherAllowance
          false, // bonus
          false, // pf
          false, // mlwf
          false, // pt
          false, // esic
          false, // tds
          0, // bonusAmount
          0, // pfAmount
          7, // mlwfPercentage
          0, // ptAmount
          7, // esicPercentage
          0  // tdsPercentage
        ];
        
        await query(sql, values);
        successCount++;
        
      } catch (error) {
        console.error(`Error processing row ${rowNumber}:`, error);
        errorCount++;
        errors.push({
          row: rowNumber,
          error: error.message,
          data: row
        });
      }
    }
    
    return Response.json({
      message: `Import completed: ${successCount} employees imported successfully, ${errorCount} errors`,
      results: {
        total: dataRows.length,
        imported: successCount,
        errors: errorCount,
        errorDetails: errors
      }
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return Response.json(
      { error: `Import failed: ${error.message}` },
      { status: 500 }
    );
  }
}
