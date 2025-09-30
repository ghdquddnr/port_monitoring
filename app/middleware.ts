import { NextRequest, NextResponse } from 'next/server'
import { validateSession, getSessionFromCookie } from '@/app/lib/auth'

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/logout']

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/api/ports']

/**
 * Check if the path is a public route
 * @param pathname - The request pathname
 * @returns true if the path is public, false otherwise
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if the path is a protected route
 * @param pathname - The request pathname
 * @returns true if the path requires authentication, false otherwise
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Middleware function to protect routes and enforce authentication
 * @param request - The incoming request
 * @returns Response to continue, redirect, or block
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes without authentication
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    // Get session from cookie
    const cookieHeader = request.headers.get('cookie')
    const sessionToken = getSessionFromCookie(cookieHeader)

    // Validate session
    const session = validateSession(sessionToken)

    if (!session) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Allow authenticated request to proceed
    return NextResponse.next()
  }

  // Allow other routes by default (for root page, etc.)
  return NextResponse.next()
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Files with extensions (e.g., .png, .jpg, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}