import { getDbConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const db = await getDbConnection();
      
      const { search, status, type, limit = 50, page = 1 } = req.query;
      let whereClause = '';
      const params = [];
      
      if (search) {
        whereClause += 'WHERE (o.subject LIKE ? OR o.notes LIKE ? OR c.name LIKE ? OR l.company_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      
      if (status && status !== 'all') {
        whereClause += whereClause ? ' AND' : 'WHERE';
        whereClause += ' o.status = ?';
        params.push(status);
      }
      
      if (type && type !== 'all') {
        whereClause += whereClause ? ' AND' : 'WHERE';
        whereClause += ' o.type = ?';
        params.push(type);
      }
      
      const offset = (page - 1) * limit;
      
      const [outreach] = await db.query(`
        SELECT 
          o.*,
          CASE 
            WHEN o.lead_id IS NOT NULL THEN l.company_name
            WHEN o.company_id IS NOT NULL THEN c.name
            ELSE 'N/A'
          END as target_name,
          CASE 
            WHEN o.lead_id IS NOT NULL THEN l.contact_name
            ELSE 'N/A'
          END as contact_person,
          CASE 
            WHEN o.lead_id IS NOT NULL THEN l.contact_email
            ELSE 'N/A'
          END as contact_email,
          u.first_name as assigned_user_name
        FROM outreach o
        LEFT JOIN leads l ON o.lead_id = l.id
        LEFT JOIN companies c ON o.company_id = c.id
        LEFT JOIN users u ON o.assigned_to = u.id
        ${whereClause}
        ORDER BY o.created_at DESC
        LIMIT ? OFFSET ?
      `, [...params, parseInt(limit), offset]);
      
      const [countResult] = await db.query(`
        SELECT COUNT(*) as total
        FROM outreach o
        LEFT JOIN leads l ON o.lead_id = l.id
        LEFT JOIN companies c ON o.company_id = c.id
        ${whereClause}
      `, params);
      
      const totalCount = countResult[0].total;
      const totalPages = Math.ceil(totalCount / limit);
      
      res.status(200).json({
        outreach,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error fetching outreach:', error);
      res.status(500).json({ message: 'Error fetching outreach data' });
    }
  } else if (req.method === 'POST') {
    try {
      const db = await getDbConnection();
      const {
        type,
        subject,
        target_type,
        lead_id,
        company_id,
        assigned_to,
        scheduled_date,
        status = 'scheduled',
        priority = 'medium',
        notes
      } = req.body;
      
      if (!type || !subject || !target_type) {
        return res.status(400).json({ message: 'Type, subject, and target_type are required' });
      }
      
      if (target_type === 'lead' && !lead_id) {
        return res.status(400).json({ message: 'Lead ID is required when target_type is lead' });
      }
      
      if (target_type === 'company' && !company_id) {
        return res.status(400).json({ message: 'Company ID is required when target_type is company' });
      }
      
      const [result] = await db.query(`
        INSERT INTO outreach (
          type, subject, target_type, lead_id, company_id, assigned_to,
          scheduled_date, status, priority, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        type, subject, target_type, 
        target_type === 'lead' ? lead_id : null,
        target_type === 'company' ? company_id : null,
        assigned_to, scheduled_date, status, priority, notes
      ]);
      
      res.status(201).json({ 
        message: 'Outreach created successfully',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error creating outreach:', error);
      res.status(500).json({ message: 'Error creating outreach' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
