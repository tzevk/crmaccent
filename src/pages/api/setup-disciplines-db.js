import { getDbConnection } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = await getDbConnection();

    // Create disciplines table
    await db.query(`
      CREATE TABLE IF NOT EXISTS disciplines (
        id INT AUTO_INCREMENT PRIMARY KEY,
        discipline_name VARCHAR(255) NOT NULL UNIQUE,
        start_date DATE NULL,
        end_date DATE NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_disciplines_name (discipline_name),
        INDEX idx_disciplines_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Clear existing sample data and insert engineering disciplines specific to Accent Techno Solutions (EPC domain)
    await db.query(`DELETE FROM disciplines WHERE discipline_name NOT IN ('Mechanical Engineering', 'Electrical Engineering', 'Instrumentation Engineering', 'Civil & Structural Engineering', 'Piping Engineering', 'Process Engineering')`);
    
    await db.query(`
      INSERT IGNORE INTO disciplines (discipline_name, description, is_active) VALUES
      ('Mechanical Engineering', 'Design and analysis of mechanical systems, equipment selection, and mechanical components for industrial projects', true),
      ('Electrical Engineering', 'Electrical system design, power distribution, control systems, and electrical equipment specifications', true),
      ('Instrumentation Engineering', 'Process instrumentation, control systems, automation, and measurement device design and implementation', true),
      ('Civil & Structural Engineering', 'Foundation design, structural analysis, civil works, and building/plant infrastructure development', true),
      ('Piping Engineering', 'Piping system design, layout, stress analysis, and material specifications for process industries', true),
      ('Process Engineering', 'Process design, optimization, equipment sizing, and process flow development for chemical and industrial processes', true)
    `);

    res.status(200).json({ 
      message: 'Disciplines table created successfully with engineering disciplines for Accent Techno Solutions'
    });
  } catch (error) {
    console.error('Setup disciplines table error:', error);
    res.status(500).json({ 
      message: 'Error setting up disciplines table',
      error: error.message 
    });
  }
}
