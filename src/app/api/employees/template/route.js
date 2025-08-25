import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Create sample data with the required headers
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
        'Full Name': 'Michael Johnson'
      }
    ];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths for better readability
    const colWidths = [
      { wch: 8 },  // SR.NO
      { wch: 15 }, // Employee Code
      { wch: 25 }  // Full Name
    ];
    worksheet['!cols'] = colWidths;
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    // Generate the Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });
    
    // Return the file as a response
    return new Response(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="employees_import_template.xlsx"'
      }
    });
    
  } catch (error) {
    console.error('Error generating template:', error);
    return Response.json(
      { error: 'Failed to generate template file' },
      { status: 500 }
    );
  }
}
