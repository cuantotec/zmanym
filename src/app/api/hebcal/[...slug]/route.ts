import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('🔍 API: Catch-all route called with URL:', request.url);
  console.log('🔍 API: Pathname:', request.nextUrl.pathname);
  
  return NextResponse.json({ 
    message: 'Catch-all route hit',
    url: request.url,
    pathname: request.nextUrl.pathname
  });
}
