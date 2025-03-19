import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Export the middleware config first
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
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}

// This function will run before withAuth
function middleware(request: Request) {
  const { pathname } = new URL(request.url)

  // Allow access to auth pages without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // For all other routes, use withAuth middleware
  return withAuth(request as any, {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/auth/login",
    }
  })
}

export default middleware 