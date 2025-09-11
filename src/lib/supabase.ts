// Server-side Supabase client exports
// Note: For client-side usage, import directly from './supabase/browser'

import { createSupabaseServer, createAdminClient } from './supabase/server'

// Server-side client (for server components and route handlers)
export const createServerComponentClient = createSupabaseServer

// Admin client (for server-side operations with service role)
export { createAdminClient }
