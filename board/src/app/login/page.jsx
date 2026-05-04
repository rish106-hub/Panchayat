'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'

export default function LoginPage() {
  const router   = useRouter()
  const supabase = createClient()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (err) { setError(err.message ?? 'Sign in failed.'); setLoading(false); return }

    // Verify board role
    const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'board') {
      await supabase.auth.signOut()
      setError('This portal is for board members only. Use the resident app to sign in.')
      setLoading(false)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col bg-brand-600 w-[400px] shrink-0 p-10">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>spatial_audio</span>
          </div>
          <span className="font-semibold text-white">Spoke Admin</span>
        </div>
        <div className="mb-10">
          <p className="text-2xl font-bold text-white leading-snug mb-3">
            The ops command center for your HOA board.
          </p>
          <p className="text-brand-200 text-sm">Complaints, residents, dues, gate, maintenance — all in one place.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { val: '60%', label: 'Faster resolution' },
            { val: '94%', label: 'Board satisfaction' },
            { val: '2 min', label: 'Avg complaint time' },
            { val: '∞', label: 'Scale potential' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-white">{s.val}</p>
              <p className="text-brand-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <span className="material-symbols-rounded text-white" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
            </div>
            <span className="text-base font-semibold text-text-primary">Spoke Admin</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary mb-1">Board sign in</h1>
              <p className="text-sm text-text-secondary">Access your HOA management dashboard.</p>
            </div>

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
            />

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full h-9 px-3 pr-10 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{showPwd ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg">
                <span className="material-symbols-rounded text-danger shrink-0 mt-0.5" style={{ fontSize: 16 }}>error</span>
                <p className="text-xs text-danger leading-relaxed">{error}</p>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} disabled={!email || !password}>
              Sign in to board portal
              {!loading && <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-text-muted">
            Not a board member?{' '}
            <a href={process.env.NEXT_PUBLIC_RESIDENT_APP_URL ?? '#'} target="_blank" rel="noopener noreferrer"
              className="text-brand-600 hover:underline">
              Go to resident portal
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
