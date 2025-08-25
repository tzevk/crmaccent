import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return Response.json({ 
        status: 'ok', 
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      return Response.json({ 
        status: 'error', 
        database: 'disconnected',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
