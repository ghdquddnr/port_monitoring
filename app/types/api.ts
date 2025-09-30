// API Request/Response Types

/**
 * 로그인 요청 타입
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 로그인 응답 타입
 */
export interface LoginResponse {
  success: boolean
  message?: string
  redirect?: string
}

/**
 * 세션 데이터 타입
 */
export interface Session {
  userId: string
  username: string
  createdAt: number // Unix timestamp (milliseconds)
  expiresAt: number // Unix timestamp (milliseconds)
}

/**
 * API 에러 응답 타입
 */
export interface ApiError {
  error: string
  message: string
}

/**
 * API 성공 응답 타입 (제네릭)
 */
export interface ApiSuccess<T = unknown> {
  success: true
  data?: T
  message?: string
}