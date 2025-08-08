import { executeQuery } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use DELETE method.' 
    });
  }

  try {
    console.log('🚨 DANGER: Clearing ALL leads from database');
    
    // Get current count first
    const countResult = await executeQuery('SELECT COUNT(*) as count FROM leads');
    const currentCount = countResult[0]?.count || 0;
    
    if (currentCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No leads to delete. Database is already clean.',
        deleted: 0,
        remaining: 0
      });
    }

    // Delete all leads
    const deleteResult = await executeQuery('DELETE FROM leads');
    
    // Reset auto increment
    await executeQuery('ALTER TABLE leads AUTO_INCREMENT = 1');
    
    // Verify deletion
    const verifyResult = await executeQuery('SELECT COUNT(*) as count FROM leads');
    const remainingCount = verifyResult[0]?.count || 0;
    
    console.log(`✅ Deleted ${deleteResult.affectedRows} leads. ${remainingCount} remaining.`);
    
    return res.status(200).json({
      success: true,
      message: `Successfully deleted all leads from database`,
      deleted: deleteResult.affectedRows,
      remaining: remainingCount,
      originalCount: currentCount
    });
    
  } catch (error) {
    console.error('❌ Error clearing all leads:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear leads',
      error: error.message
    });
  }
}
