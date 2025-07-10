import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  // Only allow POST method for this operation
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check current schema
    const columnsResult = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'users'
    `);

    const existingColumns = columnsResult.map(col => col.COLUMN_NAME.toLowerCase());
    const columnsToAdd = [];
    const alterStatements = [];

    // Check for department column
    if (!existingColumns.includes('department')) {
      columnsToAdd.push('department');
      alterStatements.push(`ADD COLUMN department VARCHAR(100) DEFAULT NULL`);
    }

    // Check for job_title column
    if (!existingColumns.includes('job_title')) {
      columnsToAdd.push('job_title');
      alterStatements.push(`ADD COLUMN job_title VARCHAR(100) DEFAULT NULL`);
    }

    // Check for last_login_at column
    if (!existingColumns.includes('last_login_at')) {
      columnsToAdd.push('last_login_at');
      alterStatements.push(`ADD COLUMN last_login_at TIMESTAMP NULL`);
    }

    // Check for username column
    if (!existingColumns.includes('username') && existingColumns.includes('name')) {
      columnsToAdd.push('username');
      alterStatements.push(`ADD COLUMN username VARCHAR(100) DEFAULT NULL`);
      
      // Copy names to usernames where username is NULL
      await executeQuery(`
        UPDATE users 
        SET username = name 
        WHERE username IS NULL OR username = ''
      `);
    }

    // Check for first_name and last_name columns
    if (!existingColumns.includes('first_name') && existingColumns.includes('name')) {
      columnsToAdd.push('first_name');
      alterStatements.push(`ADD COLUMN first_name VARCHAR(100) DEFAULT NULL`);
      
      // Split name into first_name (everything before the first space)
      await executeQuery(`
        UPDATE users 
        SET first_name = SUBSTRING_INDEX(name, ' ', 1) 
        WHERE first_name IS NULL OR first_name = ''
      `);
    }

    if (!existingColumns.includes('last_name') && existingColumns.includes('name')) {
      columnsToAdd.push('last_name');
      alterStatements.push(`ADD COLUMN last_name VARCHAR(100) DEFAULT NULL`);
      
      // Split name into last_name (everything after the first space)
      await executeQuery(`
        UPDATE users 
        SET last_name = 
          CASE 
            WHEN CHAR_LENGTH(name) - CHAR_LENGTH(REPLACE(name, ' ', '')) > 0 
            THEN SUBSTRING(name, INSTR(name, ' ') + 1) 
            ELSE ''
          END
        WHERE last_name IS NULL OR last_name = ''
      `);
    }

    // Execute the ALTER TABLE statement if there are columns to add
    if (alterStatements.length > 0) {
      await executeQuery(`
        ALTER TABLE users 
        ${alterStatements.join(', ')}
      `);

      return res.status(200).json({ 
        message: 'Schema migration completed successfully', 
        addedColumns: columnsToAdd 
      });
    } else {
      return res.status(200).json({ 
        message: 'No schema changes needed',
        schema: existingColumns 
      });
    }
  } catch (error) {
    console.error('Schema migration error:', error);
    return res.status(500).json({ 
      message: 'Failed to migrate schema',
      error: error.message
    });
  }
}
