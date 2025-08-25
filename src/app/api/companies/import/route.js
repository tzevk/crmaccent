import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import * as XLSX from 'xlsx';

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
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read the Excel file
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    if (jsonData.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty or invalid' },
        { status: 400 }
      );
    }
    
    connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();
    
    const results = {
      total: jsonData.length,
      imported: 0,
      skipped: 0,
      errors: []
    };
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Map Excel columns to database fields (flexible mapping)
        const companyName = row['Company Name'] || row['name'] || row['Company'] || row['Name'];
        
        if (!companyName || companyName.toString().trim() === '') {
          results.errors.push(`Row ${i + 2}: Company name is required`);
          results.skipped++;
          continue;
        }
        
        // Check if company already exists
        const [existingCompany] = await connection.execute(
          'SELECT id FROM companies WHERE name = ?',
          [companyName.toString().trim()]
        );
        
        if (existingCompany.length > 0) {
          results.skipped++;
          continue;
        }
        
        // Extract other fields with flexible column mapping
        const address = row['Address'] || row['address'] || null;
        const city = row['City'] || row['city'] || null;
        const state = row['State'] || row['state'] || null;
        const country = row['Country'] || row['country'] || 'India';
        const sector = row['Sector'] || row['sector'] || row['Industry'] || row['industry'] || null;
        const phone = row['Phone'] || row['phone'] || row['Mobile'] || row['mobile'] || null;
        const email = row['Email'] || row['email'] || null;
        const website = row['Website'] || row['website'] || null;
        
        // Insert company
        await connection.execute(`
          INSERT INTO companies (
            name, address, city, state, country, sector, 
            phone, email, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          companyName.toString().trim(),
          address ? address.toString().trim() : null,
          city ? city.toString().trim() : null,
          state ? state.toString().trim() : null,
          country ? country.toString().trim() : 'India',
          sector ? sector.toString().trim() : null,
          phone ? phone.toString().trim() : null,
          email ? email.toString().trim() : null,
          website ? website.toString().trim() : null
        ]);
        
        results.imported++;
        
      } catch (error) {
        console.error(`Error importing row ${i + 2}:`, error);
        results.errors.push(`Row ${i + 2}: ${error.message}`);
        results.skipped++;
      }
    }
    
    await connection.commit();
    
    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.imported} companies imported, ${results.skipped} skipped`,
      results
    });
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error importing companies:', error);
    return NextResponse.json(
      { error: 'Failed to import companies: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
