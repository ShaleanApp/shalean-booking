import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createSupabaseMiddlewareClient(request, response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes and their required roles
  const protectedRoutes = {
    '/admin': 'admin',
    '/cleaner': 'cleaner',
    '/dashboard': ['customer', 'cleaner', 'admin'],
  }

  const { pathname } = request.nextUrl

  // Check if the current path is protected
  const protectedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  )

  if (protectedRoute) {
    if (!user) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Get user role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = profile?.role
    const requiredRoles = protectedRoutes[protectedRoute as keyof typeof protectedRoutes]

    if (Array.isArray(requiredRoles)) {
      if (!requiredRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    } else if (userRole !== requiredRoles) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
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
