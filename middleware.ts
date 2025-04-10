import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

// Auth cookie name
const AUTH_COOKIE = 'presense_auth';

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login', 
  '/signup',
  '/api/auth/login', 
  '/api/auth/signup',
];

// Export the middleware config with optimized matcher
export const config = {
  matcher: [
    // Match all request paths except static assets and public files
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

// Check if a path should be public
function isPublicPath(path: string): boolean {
  return publicRoutes.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );
}

// Simple function to get user from cookie
function getUserFromCookie(request: NextRequest) {
  try {
    const authCookie = request.cookies.get(AUTH_COOKIE);
    
    if (!authCookie) {
      return null;
    }
    
    const sessionData = JSON.parse(
      Buffer.from(authCookie.value, 'base64').toString()
    );
    
    // Check if token is expired
    if (sessionData.exp < Date.now()) {
      return null;
    }
    
    return {
      userId: sessionData.userId,
      email: sessionData.email
    };
  } catch (error) {
    console.error('Error extracting user from cookie:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Early return if request is invalid
  if (!request?.nextUrl) {
    return NextResponse.next();
  }
  
  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Check for authentication
  const user = getUserFromCookie(request);
  
  // If unauthenticated and accessing protected route, redirect to login
  if (!user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, proceed
  return NextResponse.next();
}