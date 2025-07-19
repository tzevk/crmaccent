// pages/api/health/database.js
import { checkDbHealth } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthCheck = await checkDbHealth();
    
    if (healthCheck.status === 'healthy') {
      res.status(200).json({
        success: true,
        ...healthCheck,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        success: false,
        ...healthCheck,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('❌ Health check API error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to perform health check',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
