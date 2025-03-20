import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

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

// This function will run before each request
export async function middleware(request: Request) {
  const { pathname } = new URL(request.url)

  // Allow access to auth pages without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]

  if (!token) {
    // Redirect to login if no token is present
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  try {
    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    await jwtVerify(token, secret)
    
    // Token is valid, proceed with the request
    return NextResponse.next()
  } catch (error) {
    // Token is invalid or expired, redirect to login
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
} 