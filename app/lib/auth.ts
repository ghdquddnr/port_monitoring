import crypto from 'crypto'
import type { Session } from '@/app/types/api'

// Constants
const ADMIN_USERNAME = 'admin'
const SESSION_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const COOKIE_NAME = 'session'

// Helper functions to get environment variables (for testability)
function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'changeme'
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'dev-secret-key'
}

// Warn if using default values in production
if (process.env.NODE_ENV === 'production') {
  if (getAdminPassword() === 'changeme') {
    console.warn(
      '⚠️  WARNING: Using default ADMIN_PASSWORD in production! Please set a secure password.'
    )
  }
  if (getSessionSecret() === 'dev-secret-key') {
    console.warn(
      '⚠️  WARNING: Using default SESSION_SECRET in production! Please set a secure secret.'
    )
  }
}

/**
 * Create a new session for the given username
 * @param username - The username for the session
 * @returns A new Session object with 1-hour expiration
 */
export function createSession(username: string): Session {
  const now = Date.now()
  return {
    userId: crypto.randomUUID(),
    username,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  }
}

/**
 * Sign a payload using HMAC-SHA256
 * @param payload - The payload to sign
 * @returns Base64URL encoded signature
 */
function sign(payload: string): string {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url')
}

/**
 * Verify a signature using timing-safe comparison
 * @param payload - The original payload
 * @param signature - The signature to verify
 * @returns true if signature is valid, false otherwise
 */
function verify(payload: string, signature: string): boolean {
  try {
    const expectedSignature = sign(payload)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch {
    return false
  }
}

/**
 * Encode a session into a signed token string
 * Format: base64url(JSON(session)).signature
 * @param session - The session to encode
 * @returns Signed token string
 */
export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  const signature = sign(payload)
  return `${payload}.${signature}`
}

/**
 * Decode and verify a session token
 * @param token - The token to decode
 * @returns Session object if valid, null otherwise
 */
export function decodeSession(token: string): Session | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) {
      return null
    }

    const [payload, signature] = parts

    // Verify signature
    if (!verify(payload, signature)) {
      return null
    }

    // Decode payload
    const sessionJson = Buffer.from(payload, 'base64url').toString('utf-8')
    const session = JSON.parse(sessionJson) as Session

    // Validate session structure
    if (
      !session.userId ||
      !session.username ||
      typeof session.createdAt !== 'number' ||
      typeof session.expiresAt !== 'number'
    ) {
      return null
    }

    return session
  } catch {
    return null
  }
}

/**
 * Validate a session token and check expiration
 * @param token - The session token to validate
 * @returns Session object if valid and not expired, null otherwise
 */
export function validateSession(token: string | undefined): Session | null {
  if (!token) {
    return null
  }

  const session = decodeSession(token)
  if (!session) {
    return null
  }

  // Check if session is expired
  if (Date.now() > session.expiresAt) {
    return null
  }

  return session
}

/**
 * Validate user credentials
 * @param username - The username to validate
 * @param password - The password to validate
 * @returns true if credentials are valid, false otherwise
 */
export function validateCredentials(
  username: string,
  password: string
): boolean {
  return username === ADMIN_USERNAME && password === getAdminPassword()
}

/**
 * Create a Set-Cookie header value for the session
 * @param session - The session to create a cookie for
 * @returns Set-Cookie header value
 */
export function createSessionCookie(session: Session): string {
  const token = encodeSession(session)
  const maxAge = Math.floor(SESSION_DURATION / 1000) // Convert to seconds

  const cookieAttributes = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ]

  // Add Secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieAttributes.push('Secure')
  }

  return cookieAttributes.join('; ')
}

/**
 * Create a Set-Cookie header value to delete the session cookie
 * @returns Set-Cookie header value for deletion
 */
export function deleteSessionCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`
}

/**
 * Extract session token from cookie string
 * @param cookieHeader - The Cookie header value
 * @returns Session token if found, undefined otherwise
 */
export function getSessionFromCookie(
  cookieHeader: string | null
): string | undefined {
  if (!cookieHeader) {
    return undefined
  }

  const cookies = cookieHeader.split(';').map(c => c.trim())
  const sessionCookie = cookies.find(c => c.startsWith(`${COOKIE_NAME}=`))

  if (!sessionCookie) {
    return undefined
  }

  return sessionCookie.substring(COOKIE_NAME.length + 1)
}

// Export constants for testing
export const TEST_EXPORTS = {
  ADMIN_USERNAME,
  SESSION_DURATION,
  COOKIE_NAME,
}