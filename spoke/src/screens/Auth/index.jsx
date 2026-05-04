import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { Button }   from '../../components/ui/Button'
import { Input }    from '../../components/ui/Input'

// ── Logo ──────────────────────────────────────────────────────────────────

function Logo() {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-8">
      <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
        <span className="material-symbols-rounded text-white" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
      </div>
      <span className="text-base font-semibold text-text-primary">Spoke</span>
    </button>
  )
}

// ── Sign In ───────────────────────────────────────────────────────────────

function SignInForm({ onSwitch }) {
  const navigate = useNavigate()
  const { signInWithEmail } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError('')
    setLoading(true)
    const { error: err } = await signInWithEmail(email.trim().toLowerCase(), password)
    setLoading(false)
    if (err) { setError(err.message ?? 'Sign in failed. Check your credentials.'); return }
    navigate('/dashboard', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h1>
        <p className="text-sm text-text-secondary">Sign in to your Spoke account.</p>
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
          <button
            type="button"
            onClick={() => setShowPwd(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            tabIndex={-1}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              {showPwd ? 'visibility_off' : 'visibility'}
            </span>
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
        Sign in
        {!loading && <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>}
      </Button>

      <p className="text-center text-sm text-text-muted">
        No account?{' '}
        <button type="button" onClick={onSwitch} className="text-brand-600 font-medium hover:underline">
          Create one free
        </button>
      </p>
    </form>
  )
}

// ── Sign Up ───────────────────────────────────────────────────────────────

function SignUpForm({ onSwitch }) {
  const navigate = useNavigate()
  const { signUpWithEmail } = useAuth()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError('')
    setLoading(true)
    const { data, error: err } = await signUpWithEmail(email.trim().toLowerCase(), password, name.trim())
    setLoading(false)
    if (err) { setError(err.message ?? 'Sign up failed. Try again.'); return }
    // If email confirmation is disabled → session exists, redirect to onboarding
    if (data?.session) {
      navigate('/onboarding', { replace: true })
    } else {
      // Email confirmation required
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
          <span className="material-symbols-rounded text-success" style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-text-primary mb-1">Check your email</h2>
          <p className="text-sm text-text-secondary">
            We sent a confirmation link to <span className="font-medium text-text-primary">{email}</span>.
            Click it to activate your account, then sign in.
          </p>
        </div>
        <Button fullWidth variant="secondary" onClick={onSwitch}>Back to sign in</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary mb-1">Create your account</h1>
        <p className="text-sm text-text-secondary">Join your HOA on Spoke. Free to get started.</p>
      </div>

      <Input
        label="Full name"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Alex Rivera"
        autoComplete="name"
        autoFocus
        required
      />

      <Input
        label="Email address"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-primary">Password</label>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full h-9 px-3 pr-10 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPwd(s => !s)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
            tabIndex={-1}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
              {showPwd ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
      </div>

      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg">
          <span className="material-symbols-rounded text-danger shrink-0 mt-0.5" style={{ fontSize: 16 }}>error</span>
          <p className="text-xs text-danger leading-relaxed">{error}</p>
        </div>
      )}

      <Button type="submit" fullWidth loading={loading} disabled={!name || !email || !password || !confirm}>
        Create account
        {!loading && <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>}
      </Button>

      <p className="text-center text-sm text-text-muted">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-brand-600 font-medium hover:underline">
          Sign in
        </button>
      </p>
    </form>
  )
}

// ── Main screen ───────────────────────────────────────────────────────────

export default function AuthScreen() {
  const { isAuthenticated, IS_DEMO } = useAuth()
  const [tab, setTab] = useState('signin')

  if (IS_DEMO || isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex flex-col bg-brand-600 w-[420px] shrink-0 p-10">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-brand-200 hover:text-white transition-colors mb-auto"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>spatial_audio</span>
            </div>
            <span className="font-semibold text-white">Spoke</span>
          </div>
        </button>

        <div className="mb-auto pt-16">
          <blockquote className="text-2xl font-bold text-white leading-snug mb-4">
            "Spoke cut our complaint resolution time by 60%. Residents love the voice feature."
          </blockquote>
          <p className="text-brand-200 text-sm">— Sarah M., Board President, Sunridge Estates</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: '2 min', label: 'Avg complaint time' },
            { val: '94%',   label: 'Resident satisfaction' },
            { val: '60%',   label: 'Faster resolution' },
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
          <Logo />

          {tab === 'signin' ? (
            <SignInForm onSwitch={() => setTab('signup')} />
          ) : (
            <SignUpForm onSwitch={() => setTab('signin')} />
          )}

          <p className="mt-6 text-center text-xs text-text-muted">
            By continuing, you agree to our{' '}
            <a href="#" className="text-brand-600 hover:underline">Terms</a>{' '}and{' '}
            <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
