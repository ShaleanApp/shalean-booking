// Legacy file - use src/lib/supabase/browser.ts instead
import { createSupabaseBrowser } from './browser'

export function createClient() {
  return createSupabaseBrowser()
}
