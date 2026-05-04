import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, IS_DEMO } from '../lib/supabase'
import { fetchProfile }       from '../api/users'

// ── Demo user (no auth required) ──────────────────────────────────────────
const DEMO_USER = {
  id:          'demo-user',
  name:        'Alex Rivera',
  unit_number: '4B',
  role:        'resident',
  avatar:      'AR',
  society_id:  'demo',
  onboarded:   true,
  dues_status: 'paid',
  phone:       null,
  isDemoUser:  true,
  societies: { name: 'Maple Heights HOA' },
}

const DEMO_BOARD_USER = {
  ...DEMO_USER,
  id:         'demo-board',
  name:       'Board Admin',
  role:       'board',
  avatar:     'BA',
  isDemoUser: true,
}

// ── Context ────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)    // profile row from public.users
  const [session, setSession] = useState(null)    // Supabase session
  const [loading, setLoading] = useState(true)    // initial auth check in progress
  const [error,   setError]   = useState(null)

  // ── Demo mode: skip auth entirely ───────────────────────────────────────
  useEffect(() => {
    if (!IS_DEMO) return
    setUser(DEMO_USER)
    setLoading(false)
  }, [])

  // ── Production: rehydrate session on mount ───────────────────────────────
  useEffect(() => {
    if (IS_DEMO) return

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        const { data } = await fetchProfile(session.user.id)
        setUser(data)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)

        if (event === 'SIGNED_IN' && session?.user) {
          const { data } = await fetchProfile(session.user.id)
          setUser(data)
        }

        if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ── Email + Password ─────────────────────────────────────────────────────

  const signInWithEmail = useCallback(async (email, password) => {
    if (IS_DEMO) return { error: null }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    return { data, error }
  }, [])

  const signUpWithEmail = useCallback(async (email, password, name) => {
    if (IS_DEMO) return { error: null }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) setError(error.message)
    return { data, error }
  }, [])

  // Keep OTP methods as no-ops for backwards compat
  const sendOtp   = useCallback(async () => ({ error: null }), [])
  const verifyOtp = useCallback(async () => ({ error: null }), [])

  // ── Sign out ─────────────────────────────────────────────────────────────

  const signOut = useCallback(async () => {
    if (IS_DEMO) {
      setUser(DEMO_USER) // reset to default demo user
      return
    }
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }, [])

  // ── Demo role switch (ProductHunt convenience) ────────────────────────────

  const switchDemoRole = useCallback((role) => {
    if (!IS_DEMO) return
    setUser(role === 'board' ? DEMO_BOARD_USER : DEMO_USER)
  }, [])

  // ── Refresh profile (after onboarding) ──────────────────────────────────

  const refreshProfile = useCallback(async () => {
    if (IS_DEMO || !session?.user) return
    const { data } = await fetchProfile(session.user.id)
    if (data) setUser(data)
  }, [session])

  const isAuthenticated = IS_DEMO ? true : !!session
  const isBoard = user?.role === 'board'

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      error,
      isAuthenticated,
      isBoard,
      IS_DEMO,
      signInWithEmail,
      signUpWithEmail,
      sendOtp,
      verifyOtp,
      signOut,
      switchDemoRole,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
