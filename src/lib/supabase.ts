// Legacy exports for backward compatibility
// Note: These should be replaced with direct imports from browser.ts or server.ts

import { createSupabaseBrowser } from './supabase/browser'
import { createSupabaseServer, createAdminClient } from './supabase/server'

// Client-side client (for components marked with 'use client')
export const createClientComponentClient = createSupabaseBrowser

// Server-side client (for server components and route handlers)
export const createServerComponentClient = createSupabaseServer

// Admin client (for server-side operations with service role)
export { createAdminClient }
