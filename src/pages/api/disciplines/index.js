import { getDbConnection } from '../../../lib/db';

export default async function handler(req, res) {
  const { method } = req;
  let db;

  try {
    db = await getDbConnection();
    
    switch (method) {
      case 'GET':
        // Get all disciplines with optional filtering
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
        
        const [disciplines] = await db.query(query, params);
        
        return res.status(200).json({
          success: true,
          disciplines,
          count: disciplines.length
        });

      case 'POST':
        // Create new discipline
        const { 
          discipline_name, 
          start_date, 
          end_date, 
          description 
        } = req.body;

        // Validate required fields
        if (!discipline_name) {
          return res.status(400).json({
            success: false,
            message: 'Discipline name is required'
          });
        }

        // Check if discipline already exists
        const [existingDiscipline] = await db.query(
          'SELECT id FROM disciplines WHERE discipline_name = ?',
          [discipline_name]
        );

        if (existingDiscipline.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Discipline with this name already exists'
          });
        }

        // Create the discipline
        const createQuery = `
          INSERT INTO disciplines (
            discipline_name, 
            start_date, 
            end_date, 
            description,
            is_active
          ) VALUES (?, ?, ?, ?, true)
        `;

        const [result] = await db.query(createQuery, [
          discipline_name,
          start_date || null,
          end_date || null,
          description || null
        ]);

        // Return the created discipline
        const [newDiscipline] = await db.query(
          'SELECT * FROM disciplines WHERE id = ?',
          [result.insertId]
        );

        return res.status(201).json({
          success: true,
          message: 'Discipline created successfully',
          discipline: newDiscipline[0]
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          message: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Disciplines API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  } finally {
    // Always close the database connection
    if (db) {
      try {
        await db.end();
      } catch (closeError) {
        console.error('Error closing database connection:', closeError);
      }
    }
  }
}
