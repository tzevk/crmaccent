import { executeQuery } from '../../../../lib/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Company ID is required' });
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res, id);
    } else if (req.method === 'PUT') {
      return await handlePut(req, res, id);
    } else if (req.method === 'DELETE') {
      return await handleDelete(req, res, id);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

async function handleGet(req, res, id) {
  // Get company details
  const companyQuery = `
    SELECT 
      c.id,
      c.name,
      c.created_at,
      c.updated_at
    FROM companies c
    WHERE c.id = ?
  `;

  const companyResult = await executeQuery(companyQuery, [id]);

  if (companyResult.length === 0) {
    return res.status(404).json({ message: 'Company not found' });
  }

  const company = companyResult[0];

  // Get projects for this company
  const projectsQuery = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.status,
      p.start_date,
      p.end_date,
      p.project_manager_id,
      CONCAT(u.first_name, ' ', u.last_name) as project_manager_name
    FROM projects p
    LEFT JOIN users u ON p.project_manager_id = u.id
    WHERE p.client_id = ?
    ORDER BY p.created_at DESC
  `;

  const projects = await executeQuery(projectsQuery, [id]);

  // Get leads for this company
  const leadsQuery = `
    SELECT 
      id,
      company_name,
      contact_name,
      contact_email,
      enquiry_date,
      enquiry_status,
      project_description
    FROM leads
    WHERE company_name = ?
    ORDER BY enquiry_date DESC
  `;

  const leads = await executeQuery(leadsQuery, [company.name]);

  return res.status(200).json({
    company,
    projects,
    leads
  });
}

async function handlePut(req, res, id) {
  const { updated_by, ...updateData } = req.body;

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE companies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Company not found' });
  }

  return res.status(200).json({
    message: 'Company updated successfully'
  });
}

async function handleDelete(req, res, id) {
  // Check if company has associated projects
  const projectsCheck = await executeQuery('SELECT COUNT(*) as count FROM projects WHERE client_id = ?', [id]);
  
  if (projectsCheck[0].count > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete company with associated projects. Remove projects first.'
    });
  }

  const result = await executeQuery('DELETE FROM companies WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Company not found' });
  }

  return res.status(200).json({
    message: 'Company deleted successfully'
  });
}
