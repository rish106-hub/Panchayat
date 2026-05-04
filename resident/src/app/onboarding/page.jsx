'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function OnboardingPage() {
  const supabase = createClient()
  const router   = useRouter()
  const toast    = useToast()
  const [code, setCode]     = useState('')
  const [unit, setUnit]     = useState('')
  const [phone, setPhone]   = useState('')
  const [loading, setLoad]  = useState(false)
  const [error, setError]   = useState('')

  async function handleJoin(e) {
    e.preventDefault()
    setError(''); setLoad(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: society } = await supabase.from('societies').select('id').eq('invite_code', code.trim().toUpperCase()).single()
    if (!society) { setError('Invalid invite code. Check with your society admin.'); setLoad(false); return }

    const { error } = await supabase.from('users').upsert({
      id:          user.id,
      society_id:  society.id,
      unit_number: unit.trim().toUpperCase(),
      phone:       phone.trim() || null,
      role:        'resident',
      onboarded:   true,
    })

    setLoad(false)
    if (error) { setError(error.message); return }

    toast('Welcome to your community!')
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
          <h1 className="text-lg font-bold text-text-primary mb-1">Join your community</h1>
          <p className="text-sm text-text-muted mb-6">Enter your society invite code to get started.</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
              <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleJoin} className="space-y-4">
            <Input label="Invite code" value={code} onChange={e => setCode(e.target.value)}
              placeholder="e.g. PARKVIEW2024" required className="font-mono tracking-widest uppercase" />
            <Input label="Unit number" value={unit} onChange={e => setUnit(e.target.value)} placeholder="e.g. 4B" required />
            <Input label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
            <Button type="submit" fullWidth loading={loading}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>arrow_forward</span>
              Join community
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
