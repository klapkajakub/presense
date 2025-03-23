import { NextResponse } from 'next/server'

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

// This function will run before each request
export async function middleware(request: Request) {
  // Authentication has been removed
  // All requests are allowed
  return NextResponse.next()
}