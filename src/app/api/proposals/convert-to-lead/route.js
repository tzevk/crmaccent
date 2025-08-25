import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT)
};

export async function POST(request) {
  let connection;
  
  try {
    const { proposalId } = await request.json();
    connection = await mysql.createConnection(dbConfig);

    await connection.beginTransaction();

    try {
      // Get the proposal data
      const [proposalRows] = await connection.execute(
        'SELECT * FROM proposals WHERE id = ?',
        [proposalId]
      );

      if (proposalRows.length === 0) {
        throw new Error('Proposal not found');
      }

      const proposal = proposalRows[0];

      // Check if already converted to lead
      if (proposal.is_converted_to_lead) {
        throw new Error('Proposal already converted to lead');
      }

      // Check if status allows conversion (must be at least submitted)
      if (proposal.current_status === 'Draft') {
        throw new Error('Draft proposals cannot be converted to leads. Please submit the proposal first.');
      }

      // Generate unique enquiry number for lead
      const timestamp = Date.now();
      const enquiryNumber = `ENQ-${timestamp}`;

      // Create lead from proposal data
      const [leadResult] = await connection.execute(`
        INSERT INTO leads (
          enquiry_number,
          name,
          email,
          phone,
          company,
          location,
          requirement,
          status,
          source,
          assigned_to,
          created_by,
          sr_no,
          enquiry_no,
          year,
          company_name,
          type,
          city,
          enquiry_date,
          enquiry_type,
          contact_name,
          contact_email,
          project_description,
          enquiry_status,
          project_status,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        enquiryNumber,
        proposal.contact_person,
        proposal.email,
        proposal.phone_number || null,
        proposal.client_name,
        proposal.address || null,
        proposal.scope_of_work || proposal.project_name,
        'qualified', // Set as qualified since it came from awarded proposal
        'proposal_conversion', // Custom source
        1, // Default assigned user
        1, // Default created by
        null, // sr_no - will be auto-generated
        enquiryNumber.split('-')[1], // enquiry_no from timestamp
        new Date().getFullYear(),
        proposal.client_name,
        'Existing', // Type since this comes from proposal
        proposal.address || null,
        proposal.proposal_date || new Date(),
        'Proposal Conversion',
        proposal.contact_person,
        proposal.email,
        proposal.scope_of_work || proposal.project_name,
        'Qualified', // Already qualified from proposal
        'Open' // Open for project conversion
      ]);

      const newLeadId = leadResult.insertId;

      // Update proposal to mark as converted to lead
      await connection.execute(`
        UPDATE proposals 
        SET is_converted_to_lead = 1, 
            lead_id = ?,
            updated_at = NOW()
        WHERE id = ?
      `, [newLeadId, proposalId]);

      // Create lead activity for tracking
      try {
        await connection.execute(`
          INSERT INTO lead_activities (
            lead_id,
            activity_type,
            description,
            activity_date,
            created_by,
            created_at
          ) VALUES (?, ?, ?, NOW(), ?, NOW())
        `, [
          newLeadId,
          'Proposal',
          `Lead created from proposal conversion: "${proposal.proposal_title}"`,
          1 // Default user
        ]);
      } catch (activityError) {
        console.warn('Failed to create lead activity:', activityError.message);
      }

      await connection.commit();

      return NextResponse.json({
        success: true,
        message: 'Proposal successfully converted to lead',
        lead_id: newLeadId,
        enquiry_number: enquiryNumber
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error converting proposal to lead:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to convert proposal to lead' 
      },
      { status: 400 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
