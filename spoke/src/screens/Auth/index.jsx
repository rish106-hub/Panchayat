import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, fadeUp } from '../../utils/motion'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../../components/ui/Button'

// ── Phone step ─────────────────────────────────────────────────────────────

function PhoneStep({ onSent }) {
  const { sendOtp } = useAuth()
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  function normalise(raw) {
    // Strip spaces/dashes, ensure + prefix
    const digits = raw.replace(/[^\d+]/g, '')
    return digits.startsWith('+') ? digits : `+${digits}`
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const normalised = normalise(phone)
    if (normalised.length < 10) { setErr('Enter a valid phone number with country code.'); return }
    setErr('')
    setLoading(true)
    const { error } = await sendOtp(normalised)
    setLoading(false)
    if (error) { setErr(error); return }
    onSent(normalised)
  }

  return (
    <motion.div key="phone" variants={fadeUp} initial="initial" animate="animate" exit="exit">
      <h2 className="font-display font-bold text-2xl text-tp mb-2">Welcome back</h2>
      <p className="text-sm text-ts mb-8">Enter your phone number to receive a one-time code.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-1.5">
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+1 555 000 0000"
            autoFocus
            className="w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {err && <p className="text-xs text-err mt-2">{err}</p>}
        </div>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Sending code…' : 'Send code'}
          {!loading && (
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          )}
        </Button>
      </form>
    </motion.div>
  )
}

// ── OTP step ───────────────────────────────────────────────────────────────

function OtpStep({ phone, onBack }) {
  const navigate = useNavigate()
  const { verifyOtp } = useAuth()
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (otp.length < 4) { setErr('Enter the 6-digit code.'); return }
    setErr('')
    setLoading(true)
    const { error } = await verifyOtp(phone, otp.trim())
    setLoading(false)
    if (error) { setErr(error); return }
    navigate('/home', { replace: true })
  }

  return (
    <motion.div key="otp" variants={fadeUp} initial="initial" animate="animate" exit="exit">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-ts hover:text-tp mb-6 transition-colors">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
        Back
      </button>

      <h2 className="font-display font-bold text-2xl text-tp mb-2">Check your phone</h2>
      <p className="text-sm text-ts mb-8">
        We sent a 6-digit code to <span className="text-tp font-medium">{phone}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-1.5">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            autoFocus
            className="w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-center text-2xl font-mono text-tp tracking-[0.5em] placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {err && <p className="text-xs text-err mt-2">{err}</p>}
        </div>

        <Button type="submit" fullWidth size="lg" disabled={loading}>
          {loading ? 'Verifying…' : 'Verify & sign in'}
        </Button>
      </form>
    </motion.div>
  )
}

// ── Main Auth screen ───────────────────────────────────────────────────────

export default function AuthScreen() {
  const { isAuthenticated, IS_DEMO } = useAuth()
  const [step,  setStep]  = useState('phone')  // 'phone' | 'otp'
  const [phone, setPhone] = useState('')

  if (IS_DEMO || isAuthenticated) return <Navigate to="/home" replace />

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center gap-2 px-6 h-16">
        <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 22 }}>
          spatial_audio
        </span>
        <span className="font-display font-bold text-tp text-lg">Spoke</span>
      </header>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <PhoneStep
                key="phone"
                onSent={(p) => { setPhone(p); setStep('otp') }}
              />
            ) : (
              <OtpStep
                key="otp"
                phone={phone}
                onBack={() => setStep('phone')}
              />
            )}
          </AnimatePresence>

          <p className="text-center text-xs text-tm mt-8 leading-relaxed">
            By signing in you agree to our terms of service.<br />
            Your data stays within your society only.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
