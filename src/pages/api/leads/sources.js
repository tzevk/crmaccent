import { executeQuery } from '../../../../lib/db';

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
    console.error('API Error:', error);
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}

// GET /api/leads/sources - Get all lead sources
async function handleGet(req, res) {
  const { active_only = 'true' } = req.query;

  let query = `
    SELECT 
      ls.*,
      COUNT(l.id) as lead_count
    FROM lead_sources ls
    LEFT JOIN leads l ON ls.name = l.source
  `;

  const params = [];

  if (active_only === 'true') {
    query += ' WHERE ls.is_active = true';
  }

  query += ' GROUP BY ls.id ORDER BY ls.name';

  const sources = await executeQuery(query, params);

  return res.status(200).json({
    sources
  });
}

// POST /api/leads/sources - Create a new lead source
async function handlePost(req, res) {
  const { name, description, is_active = true } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Source name is required' });
  }

  try {
    const query = `
      INSERT INTO lead_sources (name, description, is_active)
      VALUES (?, ?, ?)
    `;

    const result = await executeQuery(query, [name, description, is_active]);

    return res.status(201).json({
      message: 'Lead source created successfully',
      sourceId: result.insertId
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Lead source with this name already exists' 
      });
    }
    throw error;
  }
}

// PUT /api/leads/sources - Update a lead source
async function handlePut(req, res) {
  const { id, name, description, is_active } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Source ID is required' });
  }

  const fields = [];
  const params = [];

  if (name !== undefined) {
    fields.push('name = ?');
    params.push(name);
  }
  if (description !== undefined) {
    fields.push('description = ?');
    params.push(description);
  }
  if (is_active !== undefined) {
    fields.push('is_active = ?');
    params.push(is_active);
  }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE lead_sources SET ${fields.join(', ')} WHERE id = ?`;

  try {
    const result = await executeQuery(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lead source not found' });
    }

    return res.status(200).json({
      message: 'Lead source updated successfully'
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        message: 'Lead source with this name already exists' 
      });
    }
    throw error;
  }
}

// DELETE /api/leads/sources - Delete a lead source
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Source ID is required' });
  }

  // Check if source is being used by any leads
  const usageCheck = await executeQuery(
    'SELECT COUNT(*) as count FROM leads WHERE source = (SELECT name FROM lead_sources WHERE id = ?)',
    [id]
  );

  if (usageCheck[0].count > 0) {
    return res.status(409).json({ 
      message: 'Cannot delete lead source that is being used by existing leads'
    });
  }

  const result = await executeQuery('DELETE FROM lead_sources WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Lead source not found' });
  }

  return res.status(200).json({
    message: 'Lead source deleted successfully'
  });
}
