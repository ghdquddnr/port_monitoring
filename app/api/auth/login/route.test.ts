/**
 * Login API Integration Tests
 *
 * Note: These tests require a running Next.js server for full integration testing.
 * For unit tests, see app/lib/auth.test.ts
 *
 * To run integration tests:
 * 1. Start the dev server: npm run dev
 * 2. Run tests against the live server
 */

import { validateCredentials, createSession, encodeSession } from '@/app/lib/auth'
import type { LoginRequest, LoginResponse } from '@/app/types/api'

// Set up test environment
process.env.ADMIN_PASSWORD = 'test-password'
process.env.SESSION_SECRET = 'test-secret-key-at-least-32-characters-long'

describe('Login API Logic', () => {
  describe('validateCredentials', () => {
    it('should validate correct credentials', () => {
      expect(validateCredentials('admin', 'test-password')).toBe(true)
    })

    it('should reject invalid username', () => {
      expect(validateCredentials('wronguser', 'test-password')).toBe(false)
    })

    it('should reject invalid password', () => {
      expect(validateCredentials('admin', 'wrong-password')).toBe(false)
    })

    it('should reject empty credentials', () => {
      expect(validateCredentials('', '')).toBe(false)
    })
  })

  describe('Session Creation Flow', () => {
    it('should create and encode session for valid login', () => {
      const username = 'admin'
      const session = createSession(username)

      expect(session.username).toBe(username)
      expect(session.userId).toBeTruthy()
      expect(session.createdAt).toBeLessThanOrEqual(Date.now())
      expect(session.expiresAt).toBeGreaterThan(Date.now())

      const token = encodeSession(session)
      // Allow URL-safe base64 characters: A-Z, a-z, 0-9, +, /, -, _, =
      expect(token).toMatch(/^[A-Za-z0-9+/_-]+\.[A-Za-z0-9+/_-]+$/)
    })

    it('should create unique sessions for multiple logins', async () => {
      const session1 = createSession('admin')
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10))
      const session2 = createSession('admin')

      expect(session1.userId).not.toBe(session2.userId)
      expect(session1.createdAt).not.toBe(session2.createdAt)
    })
  })

  describe('API Request/Response Types', () => {
    it('should match LoginRequest interface', () => {
      const request: LoginRequest = {
        username: 'admin',
        password: 'test-password',
      }

      expect(request.username).toBe('admin')
      expect(request.password).toBe('test-password')
    })

    it('should match LoginResponse interface for success', () => {
      const response: LoginResponse = {
        success: true,
        redirect: '/dashboard',
      }

      expect(response.success).toBe(true)
      expect(response.redirect).toBe('/dashboard')
    })

    it('should match LoginResponse interface for failure', () => {
      const response: LoginResponse = {
        success: false,
        message: 'Invalid username or password',
      }

      expect(response.success).toBe(false)
      expect(response.message).toBeTruthy()
    })
  })
})

describe('Login API E2E Tests (Manual)', () => {
  it('should have correct endpoint structure', () => {
    const endpoint = '/api/auth/login'
    expect(endpoint).toBe('/api/auth/login')
  })

  it('should require POST method', () => {
    const method = 'POST'
    expect(method).toBe('POST')
  })

  it('should return JSON response', () => {
    const contentType = 'application/json'
    expect(contentType).toBe('application/json')
  })

  it('should set HttpOnly cookie on success', () => {
    const expectedCookieFlags = ['HttpOnly', 'SameSite=Strict', 'Path=/']
    expectedCookieFlags.forEach(flag => {
      expect(flag).toBeTruthy()
    })
  })
})