import { executeQuery } from '../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query; // Lead ID
  const projectData = req.body;

  try {
    // 1. Get lead details
    const [lead] = await executeQuery('SELECT * FROM leads WHERE id = ?', [id]);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // 2. Generate unique project number if not provided
    const projectNumber = projectData.project_number || `PROJ-${Date.now().toString().slice(-6)}`;

    // 3. Create the project
    const result = await executeQuery(
      `INSERT INTO projects (
        project_number, name, description, client_id, lead_id, type, status, 
        value, start_date, end_date, project_manager_id, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        projectNumber,
        projectData.name,
        projectData.description || lead.requirement,
        lead.company_id || projectData.client_id,
        id, // Link to the lead
        projectData.type || 'PROPOSAL',
        projectData.status || 'planning',
        projectData.value || lead.estimated_value || 0,
        projectData.start_date || null,
        projectData.end_date || null,
        projectData.assigned_to || lead.assigned_to, // The assigned_to from UI becomes project_manager_id in DB
        projectData.created_by
      ]
    );

    // 4. Update lead status to 'converted'
    await executeQuery(
      'UPDATE leads SET enquiry_status = ? WHERE id = ?',
      ['converted', id]
    );

    // 5. Add team members if any
    if (projectData.team_members && Array.isArray(projectData.team_members) && projectData.team_members.length > 0) {
      const projectTeamValues = projectData.team_members.map(userId => {
        return [result.insertId, userId];
      });
      
      // Batch insert team members
      if (projectTeamValues.length > 0) {
        const placeholders = projectTeamValues.map(() => '(?, ?)').join(', ');
        const flatValues = projectTeamValues.flat();
        
        await executeQuery(
          `INSERT INTO project_team (project_id, user_id) VALUES ${placeholders}`,
          flatValues
        );
      }
    }

    // 6. Log the conversion in project activities
    await executeQuery(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        projectData.created_by || null,
        'Lead converted to project',
        'project',
        result.insertId,
        JSON.stringify({
          lead_id: id,
          lead_name: lead.contact_name,
          lead_company: lead.company_name
        })
      ]
    );

    return res.status(201).json({
      message: 'Lead successfully converted to project',
      projectId: result.insertId,
      projectNumber
    });
  } catch (error) {
    console.error('Error converting lead to project:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
