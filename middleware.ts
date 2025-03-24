import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

// Export the middleware config
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

// Helper function to create a safe URL
function safeUrl(baseUrl: string, path: string): URL {
  try {
    const url = new URL(path, baseUrl)
    return url
  } catch (e) {
    // Fallback to a default URL if there's an error
    return new URL('http://localhost:3000')
  }
}

// This function will run before each request - using a cookie-based approach instead of NextAuth in Edge
export async function middleware(request: NextRequest) {
  // Early return if request is undefined
  if (!request?.nextUrl) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl
  
  // Make sure pathname is defined
  if (!pathname) {
    return NextResponse.next()
  }
  
  // All routes are now public since we're using mock auth
  const isPublicRoute = true
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Check for session token in cookies instead of using NextAuth directly
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  // No need to redirect to login page since we're using mock auth
  // and all routes are public now
  return NextResponse.next()
}