import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Demo mode: explicit flag OR missing credentials → local data, no auth
// Set VITE_DEMO_MODE=true in Vercel to keep demo for ProductHunt while
// Supabase credentials are present but auth isn't fully configured yet.
export const IS_DEMO =
  import.meta.env.VITE_DEMO_MODE === 'true' ||
  !SUPABASE_URL ||
  !SUPABASE_ANON_KEY

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
