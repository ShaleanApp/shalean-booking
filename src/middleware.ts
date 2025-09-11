import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/admin',
    '/cleaner', 
    '/dashboard',
    '/profile',
    '/bookings',
    '/notifications'
  ]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Check for auth token in cookies
    const authToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!authToken && !refreshToken) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // For admin routes, we'll do role checking in the page components
    // since we can't access Supabase in Edge runtime
    if (pathname.startsWith('/admin')) {
      // Let the page handle admin role verification
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
