'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function OnboardingPage() {
  const router = useRouter()
  const toast  = useToast()
  const [code, setCode]    = useState('')
  const [loading, setLoad] = useState(false)
  const [error, setError]  = useState('')

  async function handleJoin(e) {
    e.preventDefault()
    setError(''); setLoad(true)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: code }),
    })
    const data = await res.json()
    setLoad(false)

    if (!res.ok) { setError(data.error); return }

    toast(`Welcome, ${data.name}! You're all set.`)
    router.push('/dashboard')
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
          <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 mx-auto">
            <span className="material-symbols-rounded text-brand-600" style={{ fontSize: 24 }}>mail</span>
          </div>
          <h1 className="text-lg font-bold text-text-primary mb-1 text-center">Enter your invite code</h1>
          <p className="text-sm text-text-muted mb-6 text-center">
            Your society admin sent you a personal invite code. Enter it below to link your account.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              label="Invite code"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABCD-1234"
              required
              className="font-mono tracking-widest text-center text-lg"
            />
            <Button type="submit" fullWidth loading={loading}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>
              Join community
            </Button>
          </form>

          <p className="text-xs text-text-muted text-center mt-4">
            No code? Contact your society secretary to get one.
          </p>
        </div>
      </div>
    </div>
  )
}
