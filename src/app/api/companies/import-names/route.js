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

    // Import XLSX library
    const XLSX = require('xlsx');
    
    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(bytes);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // Process company names from Excel
    const processedData = jsonData.map((row, index) => {
      const rowData = {
        rowNumber: index + 2, // Excel row number (1-based + header)
        originalData: { ...row },
        name: '',
        city: '',
        sector: '',
        phone: '',
        email: '',
        errors: [],
        warnings: []
      };

      // Try to extract company name from various possible column names
      const possibleNameColumns = ['Company Name', 'company_name', 'Name', 'name', 'Company', 'company', 'Organization', 'Business Name'];
      for (const col of possibleNameColumns) {
        if (row[col] && String(row[col]).trim()) {
          rowData.name = String(row[col]).trim();
          break;
        }
      }

      // Try to extract city
      const possibleCityColumns = ['City', 'city', 'Location', 'location'];
      for (const col of possibleCityColumns) {
        if (row[col] && String(row[col]).trim()) {
          rowData.city = String(row[col]).trim();
          break;
        }
      }

      // Try to extract sector
      const possibleSectorColumns = ['Sector', 'sector', 'Industry', 'industry', 'Business Type', 'Type'];
      for (const col of possibleSectorColumns) {
        if (row[col] && String(row[col]).trim()) {
          rowData.sector = String(row[col]).trim();
          break;
        }
      }

      // Try to extract phone
      const possiblePhoneColumns = ['Phone', 'phone', 'Contact', 'contact', 'Mobile', 'mobile', 'Telephone'];
      for (const col of possiblePhoneColumns) {
        if (row[col] && String(row[col]).trim()) {
          rowData.phone = String(row[col]).trim();
          break;
        }
      }

      // Try to extract email
      const possibleEmailColumns = ['Email', 'email', 'Email Address', 'Contact Email', 'Mail'];
      for (const col of possibleEmailColumns) {
        if (row[col] && String(row[col]).trim()) {
          const email = String(row[col]).trim();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailRegex.test(email)) {
            rowData.email = email;
          } else {
            rowData.warnings.push(`Invalid email format: ${email}`);
          }
          break;
        }
      }

      // Validation
      if (!rowData.name) {
        rowData.errors.push('Company name is required');
      }

      return rowData;
    });

    // If this is just a preview request, return the mapped data
    if (action === 'preview') {
      const validRows = processedData.filter(row => row.errors.length === 0);
      const errorRows = processedData.filter(row => row.errors.length > 0);
      
      return NextResponse.json({
        success: true,
        preview: true,
        totalRows: processedData.length,
        validRows: validRows.length,
        errorRows: errorRows.length,
        data: processedData.slice(0, 10), // Show first 10 rows for preview
        summary: {
          validRows,
          errorRows
        }
      });
    }

    // For actual import, proceed with database insertion
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    const validRows = processedData.filter(row => row.errors.length === 0);
    let imported = 0;
    let failed = 0;
    let duplicates = 0;
    const failedRows = [];

    for (const row of validRows) {
      try {
        // Check if company already exists
        const [existing] = await connection.execute(
          'SELECT id FROM companies WHERE name = ?',
          [row.name]
        );

        if (existing.length > 0) {
          duplicates++;
          continue;
        }

        // Insert new company with minimal data
        await connection.execute(`
          INSERT INTO companies (
            name, city, sector, phone, email, country, currency,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          row.name,
          row.city || null,
          row.sector || null,
          row.phone || null,
          row.email || null,
          'India',
          'INR'
        ]);
        
        imported++;
      } catch (error) {
        failed++;
        failedRows.push({
          row: row.rowNumber,
          name: row.name,
          error: error.message.includes('Duplicate entry') ? 'Company already exists' : error.message
        });
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      imported,
      failed,
      duplicates,
      total: processedData.length,
      validRows: validRows.length,
      invalidRows: processedData.length - validRows.length,
      failedRows: failedRows.slice(0, 10), // Limit error details
      message: `Successfully imported ${imported} companies. ${duplicates} duplicates skipped, ${failed} failed.`
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error importing companies:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to import companies' 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
