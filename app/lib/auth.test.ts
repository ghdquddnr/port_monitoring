// Set test environment variables BEFORE importing auth module
process.env.ADMIN_PASSWORD = 'test-password'
process.env.SESSION_SECRET = 'test-secret-key'

import type { Session } from '@/app/types/api'
import {
  createSession,
  encodeSession,
  decodeSession,
  validateSession,
  validateCredentials,
  createSessionCookie,
  deleteSessionCookie,
  getSessionFromCookie,
  TEST_EXPORTS,
} from './auth'

describe('createSession', () => {
  test('should create session with correct structure', () => {
    const session = createSession('admin')

    expect(session).toHaveProperty('userId')
    expect(session).toHaveProperty('username', 'admin')
    expect(session).toHaveProperty('createdAt')
    expect(session).toHaveProperty('expiresAt')
    expect(typeof session.userId).toBe('string')
    expect(typeof session.createdAt).toBe('number')
    expect(typeof session.expiresAt).toBe('number')
  })

  test('should create session that expires in 1 hour', () => {
    const session = createSession('admin')
    const expectedExpiration = session.createdAt + TEST_EXPORTS.SESSION_DURATION

    expect(session.expiresAt).toBe(expectedExpiration)
  })

  test('should generate unique userId', () => {
    const session1 = createSession('admin')
    const session2 = createSession('admin')

    expect(session1.userId).not.toBe(session2.userId)
  })

  test('should use provided username', () => {
    const session = createSession('testuser')

    expect(session.username).toBe('testuser')
  })
})

describe('encodeSession and decodeSession', () => {
  test('should encode and decode session correctly', () => {
    const original = createSession('admin')
    const token = encodeSession(original)
    const decoded = decodeSession(token)

    expect(decoded).toEqual(original)
  })

  test('should return null for invalid token format', () => {
    expect(decodeSession('invalid')).toBeNull()
    expect(decodeSession('no-signature-here-extra-parts')).toBeNull()
    expect(decodeSession('')).toBeNull()
  })

  test('should return null for tampered token', () => {
    const session = createSession('admin')
    const token = encodeSession(session)
    const [payload] = token.split('.')
    const tamperedToken = `${payload}.fake-signature`

    expect(decodeSession(tamperedToken)).toBeNull()
  })

  test('should return null for malformed JSON payload', () => {
    const badPayload = Buffer.from('not json').toString('base64url')
    const token = `${badPayload}.signature`

    expect(decodeSession(token)).toBeNull()
  })

  test('should return null for payload with missing fields', () => {
    const incompleteSession = { username: 'admin' }
    const payload = Buffer.from(JSON.stringify(incompleteSession)).toString(
      'base64url'
    )
    // This will fail signature verification, but even if it passed, it should fail validation
    const token = `${payload}.signature`

    expect(decodeSession(token)).toBeNull()
  })
})

describe('validateSession', () => {
  test('should validate valid session', () => {
    const session = createSession('admin')
    const token = encodeSession(session)
    const validated = validateSession(token)

    expect(validated).toEqual(session)
  })

  test('should reject expired session', () => {
    const expiredSession: Session = {
      userId: 'test-id',
      username: 'admin',
      createdAt: Date.now() - 7200000, // 2 hours ago
      expiresAt: Date.now() - 3600000, // 1 hour ago (expired)
    }
    const token = encodeSession(expiredSession)

    expect(validateSession(token)).toBeNull()
  })

  test('should return null for undefined token', () => {
    expect(validateSession(undefined)).toBeNull()
  })

  test('should return null for invalid token', () => {
    expect(validateSession('invalid-token')).toBeNull()
  })

  test('should accept session that expires in the future', () => {
    const futureSession: Session = {
      userId: 'test-id',
      username: 'admin',
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour from now
    }
    const token = encodeSession(futureSession)

    expect(validateSession(token)).toEqual(futureSession)
  })
})

describe('validateCredentials', () => {
  test('should validate correct credentials', () => {
    expect(validateCredentials('admin', 'test-password')).toBe(true)
  })

  test('should reject incorrect username', () => {
    expect(validateCredentials('user', 'test-password')).toBe(false)
    expect(validateCredentials('Admin', 'test-password')).toBe(false)
    expect(validateCredentials('ADMIN', 'test-password')).toBe(false)
  })

  test('should reject incorrect password', () => {
    expect(validateCredentials('admin', 'wrong')).toBe(false)
    expect(validateCredentials('admin', '')).toBe(false)
    expect(validateCredentials('admin', 'Test-Password')).toBe(false)
  })

  test('should reject empty credentials', () => {
    expect(validateCredentials('', '')).toBe(false)
    expect(validateCredentials('', 'test-password')).toBe(false)
  })
})

describe('createSessionCookie', () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  test('should create cookie with correct attributes', () => {
    const session = createSession('admin')
    const cookie = createSessionCookie(session)

    expect(cookie).toContain('session=')
    expect(cookie).toContain('Max-Age=3600')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
  })

  test('should include token in cookie value', () => {
    const session = createSession('admin')
    const cookie = createSessionCookie(session)
    const token = encodeSession(session)

    expect(cookie).toContain(`session=${token}`)
  })

  test('should add Secure flag in production', () => {
    process.env.NODE_ENV = 'production'

    const session = createSession('admin')
    const cookie = createSessionCookie(session)

    expect(cookie).toContain('Secure')
  })

  test('should not add Secure flag in development', () => {
    process.env.NODE_ENV = 'development'

    const session = createSession('admin')
    const cookie = createSessionCookie(session)

    expect(cookie).not.toContain('Secure')
  })
})

describe('deleteSessionCookie', () => {
  test('should create cookie with Max-Age=0', () => {
    const cookie = deleteSessionCookie()

    expect(cookie).toContain('session=')
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('HttpOnly')
  })

  test('should create empty session value', () => {
    const cookie = deleteSessionCookie()

    expect(cookie).toMatch(/session=;/)
  })
})

describe('getSessionFromCookie', () => {
  test('should extract session from cookie header', () => {
    const session = createSession('admin')
    const token = encodeSession(session)
    const cookieHeader = `session=${token}`

    expect(getSessionFromCookie(cookieHeader)).toBe(token)
  })

  test('should extract session from multiple cookies', () => {
    const token = 'test-token'
    const cookieHeader = `other=value; session=${token}; another=value`

    expect(getSessionFromCookie(cookieHeader)).toBe(token)
  })

  test('should handle cookies with spaces', () => {
    const token = 'test-token'
    const cookieHeader = `other=value;  session=${token};  another=value`

    expect(getSessionFromCookie(cookieHeader)).toBe(token)
  })

  test('should return undefined for null cookie header', () => {
    expect(getSessionFromCookie(null)).toBeUndefined()
  })

  test('should return undefined if session cookie not found', () => {
    expect(getSessionFromCookie('other=value')).toBeUndefined()
    expect(getSessionFromCookie('other=value; another=value')).toBeUndefined()
  })

  test('should return undefined for empty cookie header', () => {
    expect(getSessionFromCookie('')).toBeUndefined()
  })
})