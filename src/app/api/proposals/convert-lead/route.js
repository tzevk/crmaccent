import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const { leadId, proposalData } = await request.json();

    if (!leadId) {
      return Response.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // First, get the lead information
    const leadResults = await query(
      `SELECT * FROM leads WHERE id = ?`,
      [leadId]
    );

    if (leadResults.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    const lead = leadResults[0];

    // Generate a unique proposal ID
    const currentDate = new Date();
    const proposalIdPrefix = 'PROP';
    const dateStr = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const proposalId = `${proposalIdPrefix}-${dateStr}-${randomSuffix}`;

    // Create the proposal with lead data using existing schema
    const proposalInsertQuery = `
      INSERT INTO proposals (
        proposal_id,
        proposal_title,
        proposal_date,
        prepared_by,
        client_name,
        contact_person,
        designation,
        email,
        phone_number,
        address,
        project_name,
        project_type,
        scope_of_work,
        estimated_value,
        estimated_duration,
        currency,
        current_status,
        proposal_owner,
        department,
        internal_notes,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const proposalValues = [
      proposalId,
      proposalData.title || `Proposal for ${lead.company_name || lead.contact_person}`,
      currentDate.toISOString().slice(0, 10),
      proposalData.assigned_to || lead.assigned_to || 'System',
      lead.company_name || lead.contact_person,
      lead.contact_person || 'N/A',
      lead.designation || 'N/A',
      lead.email,
      lead.phone,
      lead.address || 'N/A',
      proposalData.project_name || `${lead.company_name} Project`,
      proposalData.project_type || 'General',
      proposalData.project_description || lead.requirements || lead.enquiry_details || 'Project requirements from lead',
      parseFloat(proposalData.budget_range?.replace(/[^\d.]/g, '') || lead.budget?.replace(/[^\d.]/g, '') || '0'),
      proposalData.timeline || '30 days',
      'INR',
      'Draft',
      proposalData.assigned_to || lead.assigned_to || 'System',
      'Sales',
      proposalData.notes || `Converted from lead #${leadId}. Original inquiry: ${lead.enquiry_details || ''}`
    ];

    const proposalResult = await query(proposalInsertQuery, proposalValues);
    const newProposalId = proposalResult.insertId;

    // Update the lead status to 'converted'
    await query(
      `UPDATE leads SET 
         enquiry_status = 'converted',
         updated_at = NOW()
       WHERE id = ?`,
      [leadId]
    );

    // Create an activity log entry if activities table exists
    try {
      const activityQuery = `
        INSERT INTO activities (
          type,
          title,
          description,
          related_type,
          related_id,
          assigned_to,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
      `;

      await query(activityQuery, [
        'lead_conversion',
        'Lead Converted to Proposal',
        `Lead #${leadId} (${lead.contact_person || lead.company_name}) has been successfully converted to proposal #${proposalId}`,
        'proposal',
        newProposalId,
        proposalData.assigned_to || lead.assigned_to
      ]);
    } catch (activityError) {
      // Activities table might not exist, but that's ok
      console.log('Could not create activity log:', activityError.message);
    }

    // Get the created proposal
    const newProposal = await query(
      `SELECT * FROM proposals WHERE id = ?`,
      [newProposalId]
    );

    return Response.json({
      success: true,
      message: 'Lead successfully converted to proposal',
      proposal: newProposal[0],
      leadId: leadId,
      proposalId: proposalId
    });

  } catch (error) {
    console.error('Error converting lead to proposal:', error);
    return Response.json(
      { error: 'Failed to convert lead to proposal', details: error.message },
      { status: 500 }
    );
  }
}

// GET method to retrieve conversion status
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (!leadId) {
      return Response.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Check if lead has already been converted by checking internal_notes
    const proposalResults = await query(
      `SELECT id, proposal_id, proposal_title, current_status, created_at 
       FROM proposals 
       WHERE internal_notes LIKE ?`,
      [`%Converted from lead #${leadId}%`]
    );

    const leadResults = await query(
      `SELECT enquiry_status FROM leads WHERE id = ?`,
      [leadId]
    );

    if (leadResults.length === 0) {
      return Response.json({ error: 'Lead not found' }, { status: 404 });
    }

    return Response.json({
      leadStatus: leadResults[0].enquiry_status,
      isConverted: proposalResults.length > 0,
      proposals: proposalResults
    });

  } catch (error) {
    console.error('Error checking conversion status:', error);
    return Response.json(
      { error: 'Failed to check conversion status' },
      { status: 500 }
    );
  }
}
