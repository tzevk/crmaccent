import { executeQuery } from '../../../lib/db';

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

// GET /api/leads - Get all leads with optional filtering
async function handleGet(req, res) {
  const { 
    status, 
    source, 
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;

  let query = `
    SELECT 
      l.*,
      u.first_name as created_by_name,
      u.last_name as created_by_lastname
    FROM leads l
    LEFT JOIN users u ON l.created_by = u.id
    WHERE 1=1
  `;
  
  const params = [];

  // Add filters
  if (status && status !== 'all') {
    query += ' AND l.status = ?';
    params.push(status);
  }

  if (source && source !== 'all') {
    query += ' AND l.source = ?';
    params.push(source);
  }

  if (search) {
    query += ' AND (l.name LIKE ? OR l.company LIKE ? OR l.email LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  // Add sorting
  const allowedSortFields = ['created_at', 'name', 'company', 'status', 'value', 'last_contact'];
  const allowedSortOrders = ['ASC', 'DESC'];
  
  if (allowedSortFields.includes(sortBy) && allowedSortOrders.includes(sortOrder.toUpperCase())) {
    query += ` ORDER BY l.${sortBy} ${sortOrder.toUpperCase()}`;
  } else {
    query += ' ORDER BY l.created_at DESC';
  }

  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const leads = await executeQuery(query, params);

  // Get total count for pagination
  let countQuery = `
    SELECT COUNT(*) as total
    FROM leads l
    WHERE 1=1
  `;
  
  const countParams = [];
  if (status && status !== 'all') {
    countQuery += ' AND l.status = ?';
    countParams.push(status);
  }
  if (source && source !== 'all') {
    countQuery += ' AND l.source = ?';
    countParams.push(source);
  }
  if (search) {
    countQuery += ' AND (l.name LIKE ? OR l.company LIKE ? OR l.email LIKE ?)';
    const searchPattern = `%${search}%`;
    countParams.push(searchPattern, searchPattern, searchPattern);
  }

  const countResult = await executeQuery(countQuery, countParams);
  const totalCount = countResult[0].total;

  return res.status(200).json({
    leads,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
      totalCount,
      hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
      hasPreviousPage: parseInt(page) > 1
    }
  });
}

// POST /api/leads - Create a new lead
async function handlePost(req, res) {
  const {
    name,
    company,
    email,
    phone,
    status = 'cold',
    source = 'other',
    value = 0,
    assigned_to,
    description,
    address,
    city,
    state,
    postal_code,
    country = 'India',
    industry,
    website,
    lead_score = 0,
    next_follow_up,
    notes,
    tags,
    created_by
  } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const query = `
    INSERT INTO leads (
      name, company, email, phone, status, source, value, assigned_to,
      description, address, city, state, postal_code, country, industry,
      website, lead_score, next_follow_up, notes, tags, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    name, 
    company || null, 
    email || null, 
    phone || null, 
    status, 
    source, 
    value, 
    assigned_to || null,
    description || null, 
    address || null, 
    city || null, 
    state || null, 
    postal_code || null, 
    country, 
    industry || null,
    website || null, 
    lead_score, 
    next_follow_up || null, 
    notes || null, 
    tags || null, 
    created_by || null
  ];

  const result = await executeQuery(query, params);

  // Log activity
  if (result.insertId) {
    await executeQuery(
      'INSERT INTO lead_activities (lead_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
      [result.insertId, 'note', 'Lead created', `Lead ${name} was created`, created_by || null]
    );
  }

  return res.status(201).json({
    message: 'Lead created successfully',
    leadId: result.insertId
  });
}

// PUT /api/leads - Update a lead
async function handlePut(req, res) {
  const { id, updated_by, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  // Build dynamic update query
  const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
  
  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE leads SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  const params = [...fields.map(field => updateData[field]), id];

  const result = await executeQuery(query, params);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  // Log activity
  await executeQuery(
    'INSERT INTO lead_activities (lead_id, activity_type, subject, description, created_by) VALUES (?, ?, ?, ?, ?)',
    [id, 'note', 'Lead updated', `Lead information was updated`, updated_by]
  );

  return res.status(200).json({
    message: 'Lead updated successfully'
  });
}

// DELETE /api/leads - Delete a lead
async function handleDelete(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Lead ID is required' });
  }

  const result = await executeQuery('DELETE FROM leads WHERE id = ?', [id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Lead not found' });
  }

  return res.status(200).json({
    message: 'Lead deleted successfully'
  });
}
