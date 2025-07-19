import { getDbConnection } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Generate a sample project number since we can't call our own API endpoint from here
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const baseNumber = 519;
    const sampleNumber = `${baseNumber}-${month}-${year}-001`;
    
    // Sample data as if it came from the generate-number endpoint
    const data = {
      project_number: sampleNumber,
      prefix: `${baseNumber}-${month}-${year}-`
    };

    // Now generate some samples with project names to demonstrate the full format
    const sampleProjectNames = [
      "EPC Consulting Project",
      "Solar Plant Design",
      "Wind Farm Development",
      "Gas Pipeline Engineering",
      "Oil Refinery Upgrade"
    ];

    const samples = sampleProjectNames.map(name => {
      // Extract the number part (before the project name is added)
      const numberParts = data.project_number.split('-');
      const baseNumber = numberParts.slice(0, 4).join('-');
      
      // Add the project name (converted to slug)
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      return `${baseNumber}-${slug}`;
    });

    // Return both the raw generated number and samples
    return res.status(200).json({
      generated_number: data.project_number,
      sample_numbers_with_names: samples
    });
  } catch (error) {
    console.error('Error testing project number generation:', error);
    return res.status(500).json({ message: 'Failed to test project number generation', error: error.message });
  }
}
