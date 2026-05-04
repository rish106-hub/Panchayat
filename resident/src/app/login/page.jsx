'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'

export default function LoginPage() {
  const supabase = createClient()
  const router   = useRouter()
  const [tab, setTab]       = useState('signin')
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [name, setName]     = useState('')
  const [showPass, setShow] = useState(false)
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')
  const [success, setSucc]  = useState('')

  async function handleSignIn(e) {
    e.preventDefault()
    setError(''); setLoad(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoad(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError(''); setLoad(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name.trim() } },
    })
    setLoad(false)
    if (error) { setError(error.message); return }
    if (!data.session) {
      setSucc('Check your email to confirm your account, then sign in.')
      setTab('signin')
      return
    }
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 20 }}>apartment</span>
          </div>
          <span className="text-xl font-bold text-text-primary">Spoke</span>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-card p-6">
          <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-6">
            {['signin', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSucc('') }}
                className={['flex-1 py-1.5 rounded-lg text-sm font-medium transition-all', tab === t ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'].join(' ')}>
                {t === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {success && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-success/10 text-success-text text-sm">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>check_circle</span>
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          {tab === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <Input type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                    placeholder="••••••••" required autoComplete="current-password"
                    className="w-full h-10 pl-3 pr-10 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <Button type="submit" fullWidth loading={loading}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>login</span>
                Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              <Input label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
              <Input type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPass(e.target.value)}
                    placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
                    className="w-full h-10 pl-3 pr-10 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
                  <button type="button" onClick={() => setShow(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              <Button type="submit" fullWidth loading={loading}>Create account</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
