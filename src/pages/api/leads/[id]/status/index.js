import { executeQuery } from '../../../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query; // Lead ID
  const { status } = req.body;

  // Validate status
  const validStatuses = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'];
  if (!status || !validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    // Check if lead exists
    const [lead] = await executeQuery('SELECT id FROM leads WHERE id = ?', [id]);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Update lead status
    await executeQuery(
      'UPDATE leads SET enquiry_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status.toLowerCase(), id]
    );

    // Log the status change
    await executeQuery(
      `INSERT INTO logs (user_id, action, entity_type, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        req.body.user_id || null,
        `Lead status updated to ${status}`,
        'lead',
        id,
        JSON.stringify({ 
          new_status: status,
          changed_by: req.body.user_id
        })
      ]
    );

    return res.status(200).json({
      message: 'Lead status updated successfully',
      id,
      status
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
