import { NextRequest, NextResponse } from 'next/server'
import type { LoginRequest, LoginResponse } from '@/app/types/api'
import {
  validateCredentials,
  createSession,
  createSessionCookie,
} from '@/app/lib/auth'

/**
 * POST /api/auth/login
 * Authenticate user and create session
 *
 * @param request - The incoming request with username and password
 * @returns Response with session cookie or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LoginRequest = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required',
        } as LoginResponse,
        { status: 400 }
      )
    }

    // Validate credentials
    const isValid = validateCredentials(username, password)

    if (!isValid) {
      // 3-second delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 3000))

      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password',
        } as LoginResponse,
        { status: 401 }
      )
    }

    // Create session
    const session = createSession(username)
    const sessionCookie = createSessionCookie(session)

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        redirect: '/dashboard',
      } as LoginResponse,
      { status: 200 }
    )

    // Set session cookie
    response.headers.set('Set-Cookie', sessionCookie)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login',
      } as LoginResponse,
      { status: 500 }
    )
  }
}

/**
 * GET method not allowed for login endpoint
 */
export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 })
}