import { executeQuery } from '../../../lib/db';
import formidable from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs';

// Disable Next.js body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);
    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    // Check file extension
    const fileName = file.originalFilename || '';
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv');
    
    if (!isExcel) {
      return res.status(400).json({ 
        success: false,
        message: 'Please upload a valid Excel file (.xlsx, .xls) or CSV file' 
      });
    }

    // Read the file
    const filePath = file.filepath || file.path;
    if (!filePath) {
      return res.status(400).json({ 
        success: false,
        message: 'Unable to process uploaded file' 
      });
    }
    
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'The uploaded file is empty' 
      });
    }

    // Expected columns based on leads schema
    const expectedColumns = {
      'company_name': 'company_name',
      'contact_name': 'contact_name', 
      'contact_email': 'contact_email',
      'city': 'city',
      'project_description': 'project_description',
      'enquiry_type': 'enquiry_type',
      'enquiry_status': 'enquiry_status',
      'enquiry_date': 'enquiry_date'
    };

    const results = {
      total: jsonData.length,
      success: 0,
      failed: 0,
      errors: []
    };

    const created_by = fields.created_by ? (Array.isArray(fields.created_by) ? fields.created_by[0] : fields.created_by) : null;

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNum = i + 2; // Excel row number (accounting for header)

      try {
        // Map and validate required fields
        const leadData = {
          company_name: row['Company Name'] || row['company_name'] || row['Company'] || '',
          contact_name: row['Contact Name'] || row['contact_name'] || row['Contact'] || '',
          contact_email: row['Contact Email'] || row['contact_email'] || row['Email'] || '',
          city: row['City'] || row['city'] || row['Location'] || '',
          project_description: row['Project Description'] || row['project_description'] || row['Description'] || row['Requirement'] || '',
          enquiry_type: row['Enquiry Type'] || row['enquiry_type'] || row['Source'] || 'Email',
          enquiry_status: row['Enquiry Status'] || row['enquiry_status'] || row['Status'] || 'New',
          enquiry_date: row['Enquiry Date'] || row['enquiry_date'] || row['Date'] || new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        // Basic validation
        if (!leadData.company_name) {
          results.errors.push(`Row ${rowNum}: Company name is required`);
          results.failed++;
          continue;
        }

        // Generate enquiry number
        const year = new Date().getFullYear();
        const enquiry_no = `ENQ-${year}-${String(Date.now() + i).slice(-6)}`;

        // Validate enquiry_type
        const validEnquiryTypes = ['Email', 'Phone', 'Website', 'Referral', 'Social Media', 'Other'];
        if (!validEnquiryTypes.includes(leadData.enquiry_type)) {
          leadData.enquiry_type = 'Other';
        }

        // Validate enquiry_status
        const validStatuses = ['New', 'Working', 'Quoted', 'Won', 'Lost', 'Follow-up'];
        if (!validStatuses.includes(leadData.enquiry_status)) {
          leadData.enquiry_status = 'New';
        }

        // Format enquiry_date
        let enquiry_date = new Date();
        if (leadData.enquiry_date) {
          const parsedDate = new Date(leadData.enquiry_date);
          if (!isNaN(parsedDate.getTime())) {
            enquiry_date = parsedDate;
          }
        }

        // Insert lead
        const insertQuery = `
          INSERT INTO leads (
            enquiry_no, year, company_name, contact_name, contact_email, 
            city, project_description, enquiry_type, enquiry_status, 
            enquiry_date, type, project_status, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          enquiry_no,
          new Date().getFullYear(),
          leadData.company_name,
          leadData.contact_name || null,
          leadData.contact_email || null,
          leadData.city || null,
          leadData.project_description || null,
          leadData.enquiry_type,
          leadData.enquiry_status,
          enquiry_date.toISOString().slice(0, 19).replace('T', ' '),
          'New', // Default type
          'Open', // Default project status
          created_by
        ];

        await executeQuery(insertQuery, params);
        results.success++;

      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        results.errors.push(`Row ${rowNum}: ${error.message}`);
        results.failed++;
      }
    }

    // Clean up temp file
    if (filePath) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Import completed',
      results
    });

  } catch (error) {
    console.error('Leads Import Error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Import failed', 
      error: error.message 
    });
  }
}
