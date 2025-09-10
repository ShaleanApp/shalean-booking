import { createClient } from '@supabase/supabase-js'
import { createClient as createBrowserClient } from './supabase/client'
import { createClient as createServerClient, createAdminClient as createServerAdminClient } from './supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Legacy client-side Supabase client (for backward compatibility)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// New client-side client (recommended for new code)
export const createClientComponentClient = createBrowserClient

// New server-side client (recommended for new code)
export const createServerComponentClient = createServerClient

// Admin client (for server-side operations with service role)
export const createAdminClient = createServerAdminClient
