import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Load environment variables
if (typeof window === 'undefined') {
  require('dotenv').config({ path: '.env.local' });
}

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306
};

// Helper function to normalize column names for mapping
function normalizeColumnName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/\s+/g, '');
}

// Column mapping for flexible Excel import
const columnMappings = {
  // Company Info
  'companyname': 'company_name',
  'company': 'company_name',
  'organization': 'company_name',
  'firm': 'company_name',
  
  // Contact Info
  'contactname': 'contact_name',
  'contact': 'contact_name',
  'contactperson': 'contact_name',
  'name': 'contact_name',
  'personname': 'contact_name',
  
  'email': 'email',
  'emailid': 'email',
  'emailaddress': 'email',
  'mail': 'email',
  
  'phone': 'mobile',
  'mobile': 'mobile',
  'phonenumber': 'mobile',
  'contact': 'mobile',
  'mobilenumber': 'mobile',
  
  // Location
  'city': 'city',
  'location': 'city',
  'place': 'city',
  
  'address': 'address',
  'companyaddress': 'address',
  'location': 'address',
  
  // Project Info
  'projectname': 'project_name',
  'project': 'project_name',
  'title': 'project_name',
  'subject': 'project_name',
  
  'projectdescription': 'project_description',
  'description': 'project_description',
  'details': 'project_description',
  'requirements': 'project_description',
  'requirement': 'project_description',
  
  'value': 'estimated_value',
  'estimatedvalue': 'estimated_value',
  'amount': 'estimated_value',
  'budget': 'estimated_value',
  'cost': 'estimated_value',
  
  // Lead Info
  'enquirytype': 'enquiry_type',
  'type': 'enquiry_type',
  'category': 'enquiry_type',
  
  'status': 'enquiry_status',
  'leadstatus': 'enquiry_status',
  'enquirystatus': 'enquiry_status',
  
  'source': 'source',
  'leadsource': 'source',
  'origin': 'source',
  
  'industry': 'industry',
  'sector': 'industry',
  'business': 'industry',
  
  'designation': 'designation',
  'position': 'designation',
  'role': 'designation',
  'title': 'designation',
  
  'remarks': 'remarks',
  'notes': 'remarks',
  'comments': 'remarks'
};

export async function POST(request) {
  let connection;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const action = formData.get('action'); // 'preview' or 'import'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Dynamically import XLSX with proper handling
    let XLSX;
    try {
      XLSX = await import('xlsx');
    } catch (error) {
      console.error('Failed to import XLSX:', error);
      return NextResponse.json(
        { error: 'Excel processing library not available' },
        { status: 500 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // Map Excel columns to database fields
    const mappedData = jsonData.map((row, index) => {
      const mappedRow = {
        rowNumber: index + 2, // Excel row number (1-based + header)
        originalData: { ...row }
      };

      // Apply column mappings
      Object.keys(row).forEach(key => {
        const normalizedKey = normalizeColumnName(key);
        const mappedField = columnMappings[normalizedKey];
        
        if (mappedField) {
          let value = row[key];
          
          // Clean and format the value
          if (value !== null && value !== undefined) {
            value = String(value).trim();
            
            // Handle estimated value - convert to number
            if (mappedField === 'estimated_value' && value) {
              const numValue = parseFloat(value.replace(/[^\d.]/g, ''));
              value = isNaN(numValue) ? 0 : numValue;
            }
            
            // Handle email validation
            if (mappedField === 'email' && value) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                mappedRow.warnings = mappedRow.warnings || [];
                mappedRow.warnings.push(`Invalid email format: ${value}`);
              }
            }
            
            // Handle phone/mobile formatting
            if (mappedField === 'mobile' && value) {
              // Remove non-numeric characters and validate
              const phoneNum = value.replace(/[^\d]/g, '');
              if (phoneNum.length < 10) {
                mappedRow.warnings = mappedRow.warnings || [];
                mappedRow.warnings.push(`Phone number too short: ${value}`);
              }
            }
          }
          
          mappedRow[mappedField] = value || '';
        }
      });

      // Set defaults for required fields
      if (!mappedRow.company_name && !mappedRow.contact_name) {
        mappedRow.errors = mappedRow.errors || [];
        mappedRow.errors.push('Either company name or contact name is required');
      }

      // Set default values
      mappedRow.enquiry_type = mappedRow.enquiry_type || 'Direct';
      mappedRow.enquiry_status = mappedRow.enquiry_status || 'New';
      mappedRow.project_status = mappedRow.project_status || 'Pending';
      mappedRow.lead_stage = mappedRow.lead_stage || 'New';
      mappedRow.currency = mappedRow.currency || 'INR';
      mappedRow.estimated_value = mappedRow.estimated_value || 0;
      mappedRow.year = new Date().getFullYear();
      mappedRow.enquiry_date = new Date().toISOString().split('T')[0];

      return mappedRow;
    });

    // If this is just a preview request, return the mapped data
    if (action === 'preview') {
      const validRows = mappedData.filter(row => !row.errors || row.errors.length === 0);
      const errorRows = mappedData.filter(row => row.errors && row.errors.length > 0);
      
      return NextResponse.json({
        success: true,
        preview: true,
        totalRows: mappedData.length,
        validRows: validRows.length,
        errorRows: errorRows.length,
        data: mappedData.slice(0, 10), // Show first 10 rows for preview
        columnMappings: Object.keys(columnMappings),
        summary: {
          validRows,
          errorRows
        }
      });
    }

    // For actual import, proceed with database insertion
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    const validRows = mappedData.filter(row => !row.errors || row.errors.length === 0);
    let imported = 0;
    let failed = 0;
    const failedRows = [];

    for (const row of validRows) {
      try {
        // Generate enquiry number
        const currentYear = new Date().getFullYear();
        const timestamp = Date.now().toString().slice(-6);
        const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const enquiryNo = `ENQ-${currentYear}-${timestamp}-${randomNum}`;

        await connection.execute(`
          INSERT INTO leads (
            enquiry_no, year, enquiry_date, enquiry_type, source,
            company_name, city, industry, contact_name, designation,
            mobile, email, address, project_name, project_description,
            estimated_value, currency, enquiry_status, project_status,
            lead_stage, remarks, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          enquiryNo,
          row.year,
          row.enquiry_date,
          row.enquiry_type,
          row.source || null,
          row.company_name || null,
          row.city || null,
          row.industry || null,
          row.contact_name || null,
          row.designation || null,
          row.mobile || null,
          row.email || null,
          row.address || null,
          row.project_name || null,
          row.project_description || null,
          row.estimated_value,
          row.currency,
          row.enquiry_status,
          row.project_status,
          row.lead_stage,
          row.remarks || null,
          1 // Default created_by
        ]);
        
        imported++;
      } catch (error) {
        failed++;
        failedRows.push({
          row: row.rowNumber,
          error: error.message,
          data: row.originalData
        });
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      imported,
      failed,
      total: mappedData.length,
      validRows: validRows.length,
      invalidRows: mappedData.length - validRows.length,
      failedRows: failedRows.slice(0, 10) // Limit error details
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error importing leads:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to import leads' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
