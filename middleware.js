import { NextResponse } from 'next/server';

export function middleware(request) {
  // Allow all API routes to proceed without Vercel authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Add CORS headers
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*'
  ]
}
