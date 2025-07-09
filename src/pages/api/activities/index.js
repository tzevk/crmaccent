import { getDbConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;

  try {
    const db = await getDbConnection();
    
    switch (method) {
      case 'GET':
        // Get all activities with optional filtering
        const { search, type: activityType, status: activityStatus, limit = 50, page = 1 } = req.query;
        
        let whereClause = '';
        const params = [];
        
        if (search) {
          whereClause += 'WHERE (a.title LIKE ? OR a.description LIKE ? OR a.notes LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (activityType && activityType !== 'all') {
          whereClause += whereClause ? ' AND' : 'WHERE';
          whereClause += ' a.type = ?';
          params.push(activityType);
        }
        
        if (activityStatus && activityStatus !== 'all') {
          whereClause += whereClause ? ' AND' : 'WHERE';
          whereClause += ' a.status = ?';
          params.push(activityStatus);
        }
        
        const offset = (page - 1) * limit;
        
        const [activities] = await db.query(`
          SELECT 
            a.*,
            u.first_name as assigned_user_name,
            CASE 
              WHEN a.lead_id IS NOT NULL THEN l.company_name
              WHEN a.project_id IS NOT NULL THEN p.name
              ELSE 'General'
            END as related_entity,
            CASE 
              WHEN a.lead_id IS NOT NULL THEN 'Lead'
              WHEN a.project_id IS NOT NULL THEN 'Project'
              ELSE 'General'
            END as entity_type
          FROM activities a
          LEFT JOIN users u ON a.assigned_to = u.id
          LEFT JOIN leads l ON a.lead_id = l.id
          LEFT JOIN projects p ON a.project_id = p.id
          ${whereClause}
          ORDER BY a.created_at DESC
          LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), offset]);
        
        const [countResult] = await db.query(`
          SELECT COUNT(*) as total
          FROM activities a
          ${whereClause}
        `, params);
        
        const totalCount = countResult[0].total;
        const totalPages = Math.ceil(totalCount / limit);
        
        return res.status(200).json({
          success: true,
          activities,
          count: activities.length,
          totalCount,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          }
        });

      case 'POST':
        // Create new activity
        const { 
          title,
          description,
          type,
          status = 'pending',
          priority = 'medium',
          due_date,
          assigned_to,
          lead_id,
          project_id,
          notes
        } = req.body;

        // Validate required fields
        if (!title || !type) {
          return res.status(400).json({
            success: false,
            message: 'Title and type are required'
          });
        }

        // Create the activity
        const createQuery = `
          INSERT INTO activities (
            title, description, type, status, priority, due_date,
            assigned_to, lead_id, project_id, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;

        const [result] = await db.query(createQuery, [
          title,
          description || null,
          type,
          status,
          priority,
          due_date || null,
          assigned_to || null,
          lead_id || null,
          project_id || null,
          notes || null
        ]);

        // Return the created activity
        const [newActivity] = await db.query(`
          SELECT 
            a.*,
            u.first_name as assigned_user_name
          FROM activities a
          LEFT JOIN users u ON a.assigned_to = u.id
          WHERE a.id = ?
        `, [result.insertId]);

        return res.status(201).json({
          success: true,
          message: 'Activity created successfully',
          activity: newActivity[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Activities API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
