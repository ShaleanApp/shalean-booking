/**
 * Comprehensive error handling utilities
 */

export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: any
}

export interface ApiResponse<T = any> {
  data?: T
  error?: ApiError
  success: boolean
}

/**
 * Standard error messages for common scenarios
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action. Please log in and try again.',
  FORBIDDEN: 'Access denied. You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PAYMENT_ERROR: 'Payment processing failed. Please try again or use a different payment method.',
  BOOKING_ERROR: 'Booking creation failed. Please try again or contact support.',
  EMAIL_ERROR: 'Email sending failed. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support.',
} as const

/**
 * Error types for better categorization
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  PAYMENT = 'PAYMENT',
  BOOKING = 'BOOKING',
  EMAIL = 'EMAIL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Parse error from API response
 */
export function parseApiError(error: any): ApiError {
  if (error?.response?.data) {
    // Axios-style error
    return {
      message: error.response.data.message || error.response.data.error || ERROR_MESSAGES.SERVER_ERROR,
      status: error.response.status,
      code: error.response.data.code,
      details: error.response.data.details,
    }
  }

  if (error?.message) {
    // Standard Error object
    return {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    }
  }

  if (typeof error === 'string') {
    // String error
    return {
      message: error,
    }
  }

  // Unknown error format
  return {
    message: ERROR_MESSAGES.UNKNOWN_ERROR,
    details: error,
  }
}

/**
 * Categorize error type based on status code or message
 */
export function categorizeError(error: ApiError): ErrorType {
  if (error.status) {
    switch (error.status) {
      case 401:
        return ErrorType.AUTHENTICATION
      case 403:
        return ErrorType.AUTHORIZATION
      case 404:
        return ErrorType.CLIENT
      case 422:
        return ErrorType.VALIDATION
      case 500:
      case 502:
      case 503:
      case 504:
        return ErrorType.SERVER
      default:
        if (error.status >= 400 && error.status < 500) {
          return ErrorType.CLIENT
        }
        if (error.status >= 500) {
          return ErrorType.SERVER
        }
    }
  }

  // Categorize by message content
  const message = error.message.toLowerCase()
  if (message.includes('network') || message.includes('fetch')) {
    return ErrorType.NETWORK
  }
  if (message.includes('payment') || message.includes('paystack')) {
    return ErrorType.PAYMENT
  }
  if (message.includes('booking')) {
    return ErrorType.BOOKING
  }
  if (message.includes('email')) {
    return ErrorType.EMAIL
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorType.VALIDATION
  }

  return ErrorType.UNKNOWN
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: ApiError): string {
  const errorType = categorizeError(error)
  
  switch (errorType) {
    case ErrorType.NETWORK:
      return ERROR_MESSAGES.NETWORK_ERROR
    case ErrorType.SERVER:
      return ERROR_MESSAGES.SERVER_ERROR
    case ErrorType.AUTHENTICATION:
      return ERROR_MESSAGES.UNAUTHORIZED
    case ErrorType.AUTHORIZATION:
      return ERROR_MESSAGES.FORBIDDEN
    case ErrorType.CLIENT:
      return error.status === 404 ? ERROR_MESSAGES.NOT_FOUND : error.message
    case ErrorType.VALIDATION:
      return ERROR_MESSAGES.VALIDATION_ERROR
    case ErrorType.PAYMENT:
      return ERROR_MESSAGES.PAYMENT_ERROR
    case ErrorType.BOOKING:
      return ERROR_MESSAGES.BOOKING_ERROR
    case ErrorType.EMAIL:
      return ERROR_MESSAGES.EMAIL_ERROR
    default:
      return error.message || ERROR_MESSAGES.UNKNOWN_ERROR
  }
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  const errorType = categorizeError(error)
  
  switch (errorType) {
    case ErrorType.NETWORK:
    case ErrorType.SERVER:
      return true
    case ErrorType.AUTHENTICATION:
    case ErrorType.AUTHORIZATION:
    case ErrorType.CLIENT:
    case ErrorType.VALIDATION:
      return false
    default:
      return false
  }
}

/**
 * Get retry delay in milliseconds
 */
export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s, max 30s
  const baseDelay = 1000
  const maxDelay = 30000
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
  
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.1 * delay
  return delay + jitter
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  onRetry?: (attempt: number, error: any) => void
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts - 1) {
        throw error
      }

      const apiError = parseApiError(error)
      if (!isRetryableError(apiError)) {
        throw error
      }

      if (onRetry) {
        onRetry(attempt + 1, error)
      }

      const delay = getRetryDelay(attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Safe API call wrapper
 */
export async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  options: {
    retry?: boolean
    maxRetries?: number
    onError?: (error: ApiError) => void
    onRetry?: (attempt: number, error: any) => void
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const data = options.retry 
      ? await retryWithBackoff(apiCall, options.maxRetries, options.onRetry)
      : await apiCall()
    
    return {
      data,
      success: true,
    }
  } catch (error) {
    const apiError = parseApiError(error)
    
    if (options.onError) {
      options.onError(apiError)
    }

    return {
      error: apiError,
      success: false,
    }
  }
}

/**
 * Log error for debugging and monitoring
 */
export function logError(error: ApiError, context?: string) {
  const errorInfo = {
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  }

  console.error('API Error:', errorInfo)

  // In production, send to error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service (e.g., Sentry, LogRocket)
  }
}

/**
 * Create error handler hook for React components
 */
export function createErrorHandler() {
  return {
    handleError: (error: any, context?: string) => {
      const apiError = parseApiError(error)
      logError(apiError, context)
      return getUserFriendlyMessage(apiError)
    },
    
    isRetryable: (error: any) => {
      const apiError = parseApiError(error)
      return isRetryableError(apiError)
    },
    
    parseError: parseApiError,
    getUserFriendlyMessage,
  }
}
