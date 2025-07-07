// Simple health check API that should work without authentication
export default function handler(req, res) {
  return res.status(200).json({
    success: true,
    message: 'API is working without Vercel authentication',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    method: req.method
  });
}
