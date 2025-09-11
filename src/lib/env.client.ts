/**
 * Client-side environment variables
 * Only exposes NEXT_PUBLIC_* variables to the browser
 * This prevents server-only environment variables from being exposed to the client
 */

interface ClientEnv {
  // Application
  NEXT_PUBLIC_BASE_URL: string
  NEXT_PUBLIC_APP_URL: string
  
  // Supabase (public keys only)
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  
  // Paystack (public key only)
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string
  
  // Push Notifications (public key only)
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: string
}

/**
 * Validates that all required client environment variables are present
 * Throws clear errors if any are missing
 */
function validateClientEnv(): ClientEnv {
  const requiredVars: (keyof ClientEnv)[] = [
    'NEXT_PUBLIC_BASE_URL',
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    'NEXT_PUBLIC_VAPID_PUBLIC_KEY',
  ]

  const missing: string[] = []
  const env: Partial<ClientEnv> = {}

  for (const key of requiredVars) {
    const value = process.env[key]
    if (!value || value.trim() === '') {
      missing.push(key)
    } else {
      env[key] = value
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missing.join(', ')}\n` +
      'Please check your .env.local file and ensure all NEXT_PUBLIC_* variables are set.'
    )
  }

  return env as ClientEnv
}

// Export validated client environment variables
export const clientEnv = validateClientEnv()

// Individual exports for convenience
export const {
  NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY,
} = clientEnv
