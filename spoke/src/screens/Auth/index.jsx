import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { Button }   from '../../components/ui/Button'
import { Input }    from '../../components/ui/Input'

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

function PhoneStep({ onSent }) {
  const { sendOtp } = useAuth()
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function normalise(raw) {
    const d = raw.replace(/[^\d+]/g, '')
    return d.startsWith('+') ? d : `+1${d}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const p = normalise(phone)
    if (p.length < 10) { setError('Enter a valid phone number.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await sendOtp(p)
    setLoading(false)
    if (err) { setError(typeof err === 'string' ? err : err.message); return }
    onSent(p)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Sign in to Spoke</h1>
        <p className="text-sm text-text-secondary">Enter your phone number to receive a verification code.</p>
      </div>
      <Input
        label="Phone number"
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+1 (555) 000-0000"
        autoFocus
        error={error}
      />
      <Button type="submit" fullWidth loading={loading}>
        Send verification code
        {!loading && <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>}
      </Button>
    </form>
  )
}

function OtpStep({ phone, onBack }) {
  const navigate = useNavigate()
  const { verifyOtp } = useAuth()
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (otp.length < 6) { setError('Enter the 6-digit code.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await verifyOtp(phone, otp.trim())
    setLoading(false)
    if (err) { setError(typeof err === 'string' ? err : err.message); return }
    navigate('/dashboard', { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-1 transition-colors">
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </button>
      <div>
        <h1 className="text-xl font-bold text-text-primary mb-1">Check your phone</h1>
        <p className="text-sm text-text-secondary">
          6-digit code sent to <span className="font-medium text-text-primary">{phone}</span>
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text-primary">Verification code</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          autoFocus
          className="w-full h-12 rounded-lg border border-border bg-surface text-center text-xl font-mono font-medium text-text-primary tracking-[0.4em] placeholder:text-text-muted placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
      <Button type="submit" fullWidth loading={loading}>
        Verify and sign in
      </Button>
    </form>
  )
}

export default function AuthScreen() {
  const { isAuthenticated, IS_DEMO } = useAuth()
  const [step,  setStep]  = useState('phone')
  const [phone, setPhone] = useState('')

  if (IS_DEMO || isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Left panel (desktop) */}
      <div className="hidden lg:flex flex-col bg-brand-600 w-96 shrink-0 p-10 text-white">
        <div className="flex items-center gap-2.5 mb-auto">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 18 }}>spatial_audio</span>
          </div>
          <span className="font-semibold">Spoke</span>
        </div>
        <div>
          <p className="text-2xl font-bold leading-snug mb-3">
            "Spoke saved us hours every week. Residents love the voice feature."
          </p>
          <p className="text-brand-200 text-sm">— Board President, Maple Heights HOA</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Logo />
          {step === 'phone' ? (
            <PhoneStep onSent={p => { setPhone(p); setStep('otp') }} />
          ) : (
            <OtpStep phone={phone} onBack={() => setStep('phone')} />
          )}
          <p className="mt-6 text-center text-xs text-text-muted">
            By signing in, you agree to our{' '}
            <a href="#" className="text-brand-600 hover:underline">Terms</a>{' '}and{' '}
            <a href="#" className="text-brand-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
