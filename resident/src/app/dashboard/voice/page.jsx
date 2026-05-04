'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

export default function VoicePage() {
  const supabase = createClient()
  const router   = useRouter()
  const toast    = useToast()
  const [text, setText]     = useState('')
  const [loading, setLoad]  = useState(false)
  const [result, setResult] = useState(null)

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    setLoad(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: p } = await supabase.from('users').select('society_id, unit_number').eq('id', user.id).single()

    const res = await fetch('/api/complaints', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text: text.trim(), society_id: p.society_id, unit_number: p.unit_number, user_id: user.id }),
    })
    const json = await res.json()
    setLoad(false)

    if (!res.ok) { toast(json.error ?? 'Failed to submit', 'error'); return }
    setResult(json)
  }

  if (result) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: (result.color ?? '#6366F1') + '18' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 32, color: result.color ?? '#6366F1' }}>{result.icon ?? 'check_circle'}</span>
        </div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Complaint submitted</h2>
        <p className="text-sm text-text-muted mb-4">Your complaint has been logged and assigned priority.</p>
        <div className="bg-surface border border-border rounded-2xl p-4 text-left mb-6 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-text-primary">{result.category}</span>
            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: result.priority === 'High' ? '#DC2626' : result.priority === 'Medium' ? '#D97706' : '#059669', color: '#fff' }}>
              {result.priority}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">{result.summary}</p>
        </div>
        <div className="flex gap-2">
          <Button fullWidth onClick={() => { setText(''); setResult(null) }}>Submit another</Button>
          <Button fullWidth variant="secondary" onClick={() => router.push('/dashboard/complaints')}>View all</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Submit a complaint</h1>
        <p className="text-sm text-text-muted mt-0.5">Describe your issue in plain language. We'll categorize it automatically.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <Input
          as="textarea"
          label="Describe your issue"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="E.g. The elevator in Block B has been making a loud grinding noise for the past 3 days and the doors don't close properly…"
          rows={6}
          required
        />
        <p className="text-xs text-text-muted">{text.length} characters · minimum 20</p>
        <Button type="submit" fullWidth loading={loading} disabled={text.trim().length < 20}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>send</span>
          Submit complaint
        </Button>
      </form>
    </div>
  )
}
