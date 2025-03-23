import { NextResponse } from 'next/server'
import { auth } from './auth'
import { NextRequest } from 'next/server'

// Export the middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

// Safe URL utility
function safeUrl(base: string, path?: string): URL {
  try {
    return new URL(path || '/', base);
  } catch (e) {
    console.error('Error creating URL:', e);
    return new URL('/', base);
  }
}

// This function will run before each request
export async function middleware(request: NextRequest) {
  // Early return if request is undefined
  if (!request?.nextUrl) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  
  // Make sure pathname is defined
  if (!pathname) {
    return NextResponse.next();
  }
  
  // Check if this is a public route that doesn't require authentication
  const isPublicRoute = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/error',
    '/auth/verify-request',
  ].includes(pathname);
  
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  try {
    // Get the user's session
    const session = await auth();
    
    // Check if the user is authenticated
    if (!session) {
      // Create a safe URL with proper error handling
      const baseUrl = request.url || 'http://localhost:3000';
      const url = safeUrl(baseUrl, '/auth/login');
      
      // Only set callback if pathname is valid
      if (pathname && typeof pathname === 'string') {
        url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
      }
      
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Authentication error:', error);
    // Create a safe error URL
    const baseUrl = request.url || 'http://localhost:3000';
    return NextResponse.redirect(safeUrl(baseUrl, '/auth/error'));
  }
  
  return NextResponse.next();
}