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
    enquiry_status,
    project_status,
    company_name,
    enquiry_type,
    type,
    year,
    search, 
    page = 1, 
    limit = 50,
    sortBy = 'created_at',
    sortOrder = 'DESC',
    followup_required
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

  // Filter by enquiry status
  if (enquiry_status) {
    query += ' AND l.enquiry_status = ?';
    params.push(enquiry_status);
  }

  // Filter by project status
  if (project_status) {
    query += ' AND l.project_status = ?';
    params.push(project_status);
  }

  // Filter by company name
  if (company_name) {
    query += ' AND l.company_name LIKE ?';
    params.push(`%${company_name}%`);
  }

  // Filter by enquiry type
  if (enquiry_type) {
    query += ' AND l.enquiry_type = ?';
    params.push(enquiry_type);
  }

  // Filter by type
  if (type) {
    query += ' AND l.type = ?';
    params.push(type);
  }

  // Filter by year
  if (year) {
    query += ' AND l.year = ?';
    params.push(year);
  }

  // Filter for follow-up required
  if (followup_required === 'true') {
    query += ' AND (l.enquiry_status = "Follow-up" OR l.followup1_date < NOW() OR l.followup2_date < NOW() OR l.followup3_date < NOW())';
  }

  // Search functionality
  if (search) {
    query += ` AND (
      l.company_name LIKE ? OR 
      l.contact_name LIKE ? OR 
      l.contact_email LIKE ? OR 
      l.project_description LIKE ? OR
      l.enquiry_no LIKE ?
    )`;
    const searchParam = `%${search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
  }

  // Sorting
  const allowedSortFields = [
    'sr_no', 'enquiry_no', 'year', 'company_name', 'type', 'city',
    'enquiry_date', 'enquiry_type', 'contact_name', 'contact_email',
    'enquiry_status', 'project_status', 'created_at', 'updated_at'
  ];
  
  if (allowedSortFields.includes(sortBy)) {
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY l.${sortBy} ${order}`;
  } else {
    query += ' ORDER BY l.created_at DESC';
  }

  // Pagination
  const offset = (parseInt(page) - 1) * parseInt(limit);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  try {
    // Get leads
    const leads = await executeQuery(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM leads l
      WHERE 1=1
    `;
    const countParams = [];

    // Apply the same filters for count query
    if (enquiry_status) {
      countQuery += ' AND l.enquiry_status = ?';
      countParams.push(enquiry_status);
    }
    if (project_status) {
      countQuery += ' AND l.project_status = ?';
      countParams.push(project_status);
    }
    if (company_name) {
      countQuery += ' AND l.company_name LIKE ?';
      countParams.push(`%${company_name}%`);
    }
    if (enquiry_type) {
      countQuery += ' AND l.enquiry_type = ?';
      countParams.push(enquiry_type);
    }
    if (type) {
      countQuery += ' AND l.type = ?';
      countParams.push(type);
    }
    if (year) {
      countQuery += ' AND l.year = ?';
      countParams.push(year);
    }
    if (search) {
      countQuery += ` AND (
        l.company_name LIKE ? OR 
        l.contact_name LIKE ? OR 
        l.contact_email LIKE ? OR 
        l.project_description LIKE ? OR
        l.enquiry_no LIKE ?
      )`;
      const searchParam = `%${search}%`;
      countParams.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    const [countResult] = await executeQuery(countQuery, countParams);
    const total = countResult.total;

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const currentPage = parseInt(page);

    res.status(200).json({
      leads,
      pagination: {
        currentPage,
        totalPages,
        totalCount: total,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ 
      message: 'Database query failed', 
      error: error.message 
    });
  }
}

// POST /api/leads - Create new lead
async function handlePost(req, res) {
  const {
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
    followup1_date,
    followup1_description,
    followup2_date,
    followup2_description,
    followup3_date,
    followup3_description,
    created_by
  } = req.body;

  // Validation
  if (!enquiry_no || !company_name || !contact_name || !contact_email || !project_description) {
    return res.status(400).json({ 
      message: 'Missing required fields',
      required: ['enquiry_no', 'company_name', 'contact_name', 'contact_email', 'project_description']
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact_email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Check if enquiry number already exists
    const existingLead = await executeQuery(
      'SELECT id FROM leads WHERE enquiry_no = ?',
      [enquiry_no]
    );

    if (existingLead.length > 0) {
      return res.status(400).json({ message: 'Enquiry number already exists' });
    }

    // Insert new lead
    const insertQuery = `
      INSERT INTO leads (
        sr_no, enquiry_no, year, company_name, type, city,
        enquiry_date, enquiry_type, contact_name, contact_email,
        project_description, enquiry_status, project_status,
        followup1_date, followup1_description, followup2_date, followup2_description,
        followup3_date, followup3_description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await executeQuery(insertQuery, [
      sr_no || null,
      enquiry_no,
      year || new Date().getFullYear(),
      company_name,
      type || 'New',
      city || null,
      enquiry_date || new Date().toISOString().split('T')[0],
      enquiry_type || 'Email',
      contact_name,
      contact_email,
      project_description,
      enquiry_status || 'New',
      project_status || 'Open',
      followup1_date || null,
      followup1_description || null,
      followup2_date || null,
      followup2_description || null,
      followup3_date || null,
      followup3_description || null,
      created_by || null
    ]);

    // Get the created lead
    const [createdLead] = await executeQuery(
      'SELECT * FROM leads WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      message: 'Lead created successfully',
      lead: createdLead
    });

  } catch (error) {
    console.error('Create lead error:', error);
    return res.status(500).json({ 
      message: 'Failed to create lead', 
      error: error.message 
    });
  }
}

// PUT /api/leads - Update lead (not used, individual lead updates go to /api/leads/[id])
async function handlePut(req, res) {
  return res.status(405).json({ message: 'Use /api/leads/[id] for individual lead updates' });
}

// DELETE /api/leads - Delete multiple leads
async function handleDelete(req, res) {
  const { leadIds } = req.body;

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return res.status(400).json({ message: 'Lead IDs array is required' });
  }

  try {
    // Delete related activities first
    const placeholders = leadIds.map(() => '?').join(',');
    await executeQuery(
      `DELETE FROM lead_activities WHERE lead_id IN (${placeholders})`,
      leadIds
    );

    // Delete leads
    const result = await executeQuery(
      `DELETE FROM leads WHERE id IN (${placeholders})`,
      leadIds
    );

    res.status(200).json({
      message: `${result.affectedRows} leads deleted successfully`,
      deletedCount: result.affectedRows
    });

  } catch (error) {
    console.error('Delete leads error:', error);
    return res.status(500).json({ 
      message: 'Failed to delete leads', 
      error: error.message 
    });
  }
}
