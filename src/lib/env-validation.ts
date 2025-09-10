/**
 * Environment variable validation utility
 * Helps catch missing or invalid environment variables early
 */

interface EnvConfig {
  // Application
  NEXT_PUBLIC_BASE_URL: string
  NEXT_PUBLIC_APP_URL: string
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  
  // Paystack
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string
  PAYSTACK_SECRET_KEY: string
  PAYMENT_WEBHOOK_SECRET: string
  
  // Email
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  
  // Push Notifications
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: string
  VAPID_PRIVATE_KEY: string
  
  // Security
  CRON_SECRET: string
}

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = [
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_SECRET_KEY',
  'PAYMENT_WEBHOOK_SECRET',
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'CRON_SECRET',
]

/**
 * Environment variables that are optional (have defaults)
 */
const OPTIONAL_ENV_VARS: (keyof EnvConfig)[] = [
  // Add any optional variables here
]

/**
 * Validate environment variables
 * @param isProduction - Whether we're in production mode
 * @returns Object with validation results
 */
export function validateEnvironment(isProduction: boolean = false) {
  const errors: string[] = []
  const warnings: string[] = []
  const missing: string[] = []
  const present: string[] = []

  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    
    if (!value || value.trim() === '') {
      missing.push(varName)
      if (isProduction) {
        errors.push(`Missing required environment variable: ${varName}`)
      } else {
        warnings.push(`Missing environment variable: ${varName}`)
      }
    } else {
      present.push(varName)
    }
  }

  // Check optional variables
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = process.env[varName]
    if (value && value.trim() !== '') {
      present.push(varName)
    }
  }

  // Validate specific variables
  validateSpecificVariables(errors, warnings)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing,
    present,
    summary: {
      total: REQUIRED_ENV_VARS.length + OPTIONAL_ENV_VARS.length,
      present: present.length,
      missing: missing.length,
      errors: errors.length,
      warnings: warnings.length,
    }
  }
}

/**
 * Validate specific environment variables for format/content
 */
function validateSpecificVariables(errors: string[], warnings: string[]) {
  // Validate URLs
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (baseUrl && !isValidUrl(baseUrl)) {
    errors.push(`NEXT_PUBLIC_BASE_URL is not a valid URL: ${baseUrl}`)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (appUrl && !isValidUrl(appUrl)) {
    errors.push(`NEXT_PUBLIC_APP_URL is not a valid URL: ${appUrl}`)
  }

  // Validate Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    warnings.push(`NEXT_PUBLIC_SUPABASE_URL doesn't look like a Supabase URL: ${supabaseUrl}`)
  }

  // Validate email format
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (fromEmail && !isValidEmail(fromEmail)) {
    warnings.push(`RESEND_FROM_EMAIL doesn't look like a valid email: ${fromEmail}`)
  }

  // Check for development values in production
  if (process.env.NODE_ENV === 'production') {
    if (baseUrl?.includes('localhost')) {
      errors.push('NEXT_PUBLIC_BASE_URL should not contain localhost in production')
    }
    
    if (process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY?.startsWith('pk_test_')) {
      warnings.push('Using Paystack test key in production - should use live key')
    }
    
    if (process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) {
      warnings.push('Using Paystack test secret in production - should use live secret')
    }
  }
}

/**
 * Check if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

/**
 * Check if a string is a valid email
 */
function isValidEmail(string: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(string)
}

/**
 * Get environment variable with validation
 * @param key - Environment variable key
 * @param defaultValue - Default value if not set
 * @param required - Whether the variable is required
 * @returns Environment variable value
 */
export function getEnvVar(
  key: keyof EnvConfig, 
  defaultValue?: string, 
  required: boolean = false
): string {
  const value = process.env[key]
  
  if (!value && required) {
    throw new Error(`Required environment variable ${key} is not set`)
  }
  
  return value || defaultValue || ''
}

/**
 * Log environment validation results
 * @param isProduction - Whether we're in production mode
 */
export function logEnvironmentValidation(isProduction: boolean = false) {
  const validation = validateEnvironment(isProduction)
  
  console.log('🔍 Environment Variable Validation:')
  console.log(`   Total variables: ${validation.summary.total}`)
  console.log(`   Present: ${validation.summary.present}`)
  console.log(`   Missing: ${validation.summary.missing}`)
  console.log(`   Errors: ${validation.summary.errors}`)
  console.log(`   Warnings: ${validation.summary.warnings}`)
  
  if (validation.errors.length > 0) {
    console.error('❌ Environment Errors:')
    validation.errors.forEach(error => console.error(`   - ${error}`))
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment Warnings:')
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`))
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ All environment variables are properly configured')
  }
  
  return validation
}

/**
 * Get a summary of environment configuration for debugging
 */
export function getEnvironmentSummary() {
  const validation = validateEnvironment(process.env.NODE_ENV === 'production')
  
  return {
    nodeEnv: process.env.NODE_ENV,
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
    hasSupabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasPaystack: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    hasEmail: !!process.env.RESEND_API_KEY,
    hasPushNotifications: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    validation,
  }
}
