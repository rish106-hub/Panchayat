import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode: no env vars → all API calls return local data, no auth required
export const IS_DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY

export const supabase = IS_DEMO
  ? null
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession:      true,
        autoRefreshToken:    true,
        detectSessionInUrl:  true,
      },
    })

// Realtime channel helper — returns a noop in demo mode
export function getChannel(name) {
  if (IS_DEMO || !supabase) return { on: () => ({ subscribe: () => {} }), unsubscribe: () => {} }
  return supabase.channel(name)
}
