import { executeQuery } from '@/lib/db';
import { authenticateEndpoint, checkEndpointPermission, PERMISSIONS } from '@/utils/authUtils';
import { logUserActivity, logAuditTrail, LOG_ACTIONS, LOG_CATEGORIES, LOG_SEVERITY } from '@/utils/logUtils';

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      case 'PUT':
        return await handlePut(req, res);
      case 'DELETE':
        return await handleDelete(req, res);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Disciplines API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/disciplines - Get all disciplines
async function handleGet(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.DISCIPLINE_VIEW);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { search, status } = req.query;
  
  let query = `
    SELECT 
      id,
      discipline_name,
      start_date,
      end_date,
      description,
      is_active,
      created_at,
      updated_at
    FROM disciplines
  `;
  
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push('(discipline_name LIKE ? OR description LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  
  if (status === 'active') {
    conditions.push('is_active = true');
  } else if (status === 'inactive') {
    conditions.push('is_active = false');
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY discipline_name ASC';
  
  const disciplines = await executeQuery(query, params);
  
  return res.status(200).json({
    success: true,
    disciplines,
    count: disciplines.length
  });
}

// POST /api/disciplines - Create a new discipline
async function handlePost(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.DISCIPLINE_CREATE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const {
    discipline_name,
    start_date,
    end_date,
    description,
    is_active = true
  } = req.body;

  // Validation
  if (!discipline_name) {
    return res.status(400).json({ message: 'Discipline name is required' });
  }

  // Check if discipline already exists
  const existingDiscipline = await executeQuery(
    'SELECT id FROM disciplines WHERE discipline_name = ?',
    [discipline_name]
  );

  if (existingDiscipline.length > 0) {
    return res.status(400).json({ message: 'Discipline already exists' });
  }

  const query = `
    INSERT INTO disciplines (
      discipline_name, start_date, end_date, description, is_active
    ) VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    discipline_name,
    start_date || null,
    end_date || null,
    description || null,
    is_active
  ];

  const result = await executeQuery(query, params);

  // Log discipline creation
  await logUserActivity({
    userId: user.id,
    action: LOG_ACTIONS.PROJECT_CREATE, // Using project create as discipline is related
    entityType: 'discipline',
    entityId: result.insertId,
    description: `Created discipline: ${discipline_name}`,
    category: LOG_CATEGORIES.DISCIPLINE,
    severity: LOG_SEVERITY.INFO,
    req,
    metadata: { discipline_name, start_date, end_date, description }
  });

  await logAuditTrail({
    userId: user.id,
    action: 'DISCIPLINE_CREATE',
    tableName: 'disciplines',
    recordId: result.insertId,
    operationType: 'CREATE',
    newValue: { discipline_name, start_date, end_date, description, is_active },
    req,
    riskLevel: 'low'
  });

  return res.status(201).json({
    success: true,
    message: 'Discipline created successfully',
    disciplineId: result.insertId
  });
}

// PUT /api/disciplines - Update a discipline
async function handlePut(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.DISCIPLINE_EDIT);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Discipline ID is required' });
  }

  // Check if discipline exists
  const existingDiscipline = await executeQuery('SELECT * FROM disciplines WHERE id = ?', [id]);
  if (existingDiscipline.length === 0) {
    return res.status(404).json({ message: 'Discipline not found' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  // Check for duplicate discipline name if updating name
  if (updateData.discipline_name) {
    const duplicateCheck = await executeQuery(
      'SELECT id FROM disciplines WHERE discipline_name = ? AND id != ?',
      [updateData.discipline_name, id]
    );

    if (duplicateCheck.length > 0) {
      return res.status(400).json({ message: 'Discipline name already exists' });
    }
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE disciplines SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Discipline not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Discipline updated successfully'
  });
}

// DELETE /api/disciplines - Delete a discipline
async function handleDelete(req, res) {
  const { user, error } = await checkEndpointPermission(req, res, PERMISSIONS.DISCIPLINE_DELETE);
  if (error) {
    return res.status(error.status).json({ message: error.message });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Discipline ID is required' });
  }

  // Check if discipline is being used in projects
  const usageCheck = await executeQuery(
    'SELECT COUNT(*) as count FROM projects WHERE discipline_id = ?',
    [id]
  );

  if (usageCheck[0].count > 0) {
    return res.status(400).json({ 
      message: 'Cannot delete discipline as it is being used in projects' 
    });
  }

  const result = await executeQuery('DELETE FROM disciplines WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Discipline not found' });
  }

  return res.status(200).json({
    success: true,
    message: 'Discipline deleted successfully'
  });
}
