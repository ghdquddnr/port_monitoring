import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/app/lib/auth'

/**
 * POST /api/auth/logout
 * Delete session and logout user
 *
 * @returns Response with deleted session cookie
 */
export async function POST() {
  try {
    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
        redirect: '/login',
      },
      { status: 200 }
    )

    // Delete session cookie
    const deleteCookie = deleteSessionCookie()
    response.headers.set('Set-Cookie', deleteCookie)

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during logout',
      },
      { status: 500 }
    )
  }
}

/**
 * GET method not allowed for logout endpoint
 */
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}