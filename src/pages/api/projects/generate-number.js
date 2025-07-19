// API endpoint to generate a unique project number

import { getDbConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  let db;
  try {
    db = await getDbConnection();
    
    // Get current date components
    const now = new Date();
    const year = now.getFullYear().toString(); // Full year
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // Format: 519-MM-YYYY-XXX where XXX is a sequential number
    const baseNumber = 519;
    const prefix = `${baseNumber}-${month}-${year}-`;
    
    // Find the last project number with this prefix
    const [lastProjects] = await db.execute(
      'SELECT project_number FROM projects WHERE project_number LIKE ? ORDER BY id DESC LIMIT 1',
      [`${prefix}%`]
    );
    
    let sequenceNumber = 1;
    
    if (lastProjects.length > 0) {
      // Extract the sequence number from the last project number
      const lastProjectNumber = lastProjects[0].project_number;
      const parts = lastProjectNumber.split('-');
      
      // If the format is 519-MM-YYYY-XXX-name or 519-MM-YYYY-XXX
      if (parts.length >= 4) {
        // Try to extract the sequence number
        const match = parts[3].match(/^(\d+)/);
        if (match) {
          sequenceNumber = parseInt(match[1], 10) + 1;
        }
      }
    }
    
    // Format the sequence number with leading zeros
    const formattedSequence = String(sequenceNumber).padStart(3, '0');
    const projectNumber = `${prefix}${formattedSequence}`;
    
    return res.status(200).json({ 
      project_number: projectNumber,
      prefix: prefix,
      base_number: baseNumber
    });
  } catch (error) {
    console.error('Error generating project number:', error);
    return res.status(500).json({ message: 'Failed to generate project number' });
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
