'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input }  from '@/components/ui/Input'

function DuesBadge({ status }) {
  const map = {
    paid:    'bg-success/10 text-success-text',
    overdue: 'bg-danger/10 text-danger',
    pending: 'bg-warning/10 text-warning-text',
    due:     'bg-warning/10 text-warning-text',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${map[status] ?? map.pending}`}>
      {status ?? 'pending'}
    </span>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
      status === 'accepted' ? 'bg-success/10 text-success-text' : 'bg-warning/10 text-warning-text'
    }`}>
      {status === 'accepted' ? 'Joined' : 'Pending'}
    </span>
  )
}

function InviteModal({ onClose, onCreated }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [unit, setUnit]   = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoad] = useState(false)
  const [error, setError]  = useState('')
  const [result, setResult] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoad(true)
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, unit_number: unit, phone }),
    })
    const data = await res.json()
    setLoad(false)
    if (!res.ok) { setError(data.error); return }
    setResult(data.invitation)
    onCreated()
  }

  async function copyCode() {
    await navigator.clipboard.writeText(result.invite_code)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
        {result ? (
          <>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-success/10 mx-auto mb-4">
              <span className="material-symbols-rounded text-success-text" style={{ fontSize: 24 }}>check_circle</span>
            </div>
            <h2 className="text-base font-bold text-text-primary text-center mb-1">Invitation created</h2>
            <p className="text-sm text-text-muted text-center mb-5">
              Share this code with <strong>{result.name}</strong> ({result.email})
            </p>
            <div className="flex items-center gap-2 p-3 bg-surface-2 rounded-xl border border-border mb-5">
              <span className="flex-1 font-mono text-xl font-bold text-text-primary tracking-widest text-center">
                {result.invite_code}
              </span>
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-border transition-colors text-text-muted hover:text-text-primary">
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>content_copy</span>
              </button>
            </div>
            <p className="text-xs text-text-muted text-center mb-5">
              Unit <strong>{result.unit_number}</strong> · Code is single-use and tied to this email.
            </p>
            <Button fullWidth onClick={onClose}>Done</Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary">Invite resident</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2 text-text-muted transition-colors">
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-danger/10 text-danger text-sm">
                <span className="material-symbols-rounded shrink-0" style={{ fontSize: 16 }}>error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input label="Full name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" required />
              <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" required />
              <Input label="Unit number" value={unit} onChange={e => setUnit(e.target.value)} placeholder="A-101" required />
              <Input label="Phone (optional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" />
              <div className="pt-1">
                <Button type="submit" fullWidth loading={loading}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>send</span>
                  Generate invite code
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function CodeReveal({ code }) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied]   = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className={`font-mono text-xs font-semibold tracking-widest ${visible ? 'text-text-primary' : 'text-text-muted select-none'}`}>
        {visible ? code : '••••-••••'}
      </span>
      <button onClick={() => setVisible(v => !v)} className="p-0.5 text-text-muted hover:text-text-secondary transition-colors">
        <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{visible ? 'visibility_off' : 'visibility'}</span>
      </button>
      {visible && (
        <button onClick={copy} className="p-0.5 text-text-muted hover:text-text-secondary transition-colors">
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{copied ? 'check' : 'content_copy'}</span>
        </button>
      )}
    </div>
  )
}

export default function ResidentsPage() {
  const supabase = createClient()
  const [residents,    setResidents]    = useState([])
  const [invitations,  setInvitations]  = useState([])
  const [complaints,   setComplaints]   = useState([])
  const [search,       setSearch]       = useState('')
  const [tab,          setTab]          = useState('members')
  const [loading,      setLoading]      = useState(true)
  const [showInvite,   setShowInvite]   = useState(false)
  const [societyId,    setSocietyId]    = useState(null)

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
    if (!p?.society_id) return
    setSocietyId(p.society_id)

    const [{ data: r }, { data: c }, invRes] = await Promise.all([
      supabase.from('users').select('id, name, unit_number, role, onboarded, phone').eq('society_id', p.society_id).eq('role', 'resident').order('unit_number'),
      supabase.from('complaints').select('id, unit_number').eq('society_id', p.society_id),
      fetch('/api/invitations'),
    ])

    const { data: dues } = await supabase.from('dues').select('user_id, status').eq('society_id', p.society_id).order('due_date', { ascending: false })
    const duesMap = {}
    dues?.forEach(d => { if (!duesMap[d.user_id]) duesMap[d.user_id] = d.status })
    setResidents((r ?? []).map(res => ({ ...res, dues_status: duesMap[res.id] ?? 'pending' })))
    setComplaints(c ?? [])

    const invData = await invRes.json()
    setInvitations(invData.invitations ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function revokeInvitation(id) {
    await fetch('/api/invitations', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const filteredResidents = residents.filter(r => {
    if (!search) return true
    return r.name?.toLowerCase().includes(search.toLowerCase()) || r.unit_number?.toLowerCase().includes(search.toLowerCase())
  })

  const filteredInvites = invitations.filter(inv => {
    if (!search) return true
    return inv.name?.toLowerCase().includes(search.toLowerCase()) ||
           inv.email?.toLowerCase().includes(search.toLowerCase()) ||
           inv.unit_number?.toLowerCase().includes(search.toLowerCase())
  })

  const pendingCount = invitations.filter(i => i.status === 'pending').length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onCreated={() => load()}
        />
      )}

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Residents</h1>
          <p className="text-sm text-text-muted mt-0.5">{residents.length} members · {pendingCount} pending invite{pendingCount !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowInvite(true)} size="sm">
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>person_add</span>
          Invite resident
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-2 rounded-xl mb-5 w-fit">
        {[['members', 'Members'], ['invites', 'Invitations']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={['px-4 py-1.5 rounded-lg text-sm font-medium transition-all', tab === key ? 'bg-surface text-text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'].join(' ')}>
            {label}
            {key === 'invites' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={tab === 'members' ? 'Search by name or unit…' : 'Search by name, email or unit…'}
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
      </div>

      {loading ? (
        <div className="text-sm text-text-muted text-center py-16">Loading…</div>
      ) : tab === 'members' ? (
        filteredResidents.length === 0 ? (
          <div className="text-sm text-text-muted text-center py-16">No members yet. Invite residents to get started.</div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {filteredResidents.map((r, i) => {
              const cCount = complaints.filter(c => c.unit_number === r.unit_number).length
              return (
                <div key={r.id} className={['px-4 py-3.5 flex items-center gap-3', i < filteredResidents.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                  <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-600">{r.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
                    <p className="text-xs text-text-muted">Unit {r.unit_number} · {cCount} complaint{cCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <DuesBadge status={r.dues_status} />
                    {r.phone && <span className="text-[10px] text-text-muted">{r.phone}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        filteredInvites.length === 0 ? (
          <div className="text-sm text-text-muted text-center py-16">No invitations sent yet.</div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {filteredInvites.map((inv, i) => (
              <div key={inv.id} className={['px-4 py-3.5 flex items-center gap-3', i < filteredInvites.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                  <span className="text-xs font-bold text-text-muted">{inv.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text-primary">{inv.name}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-xs text-text-muted truncate">{inv.email} · Unit {inv.unit_number}</p>
                  {inv.status === 'pending' && (
                    <div className="mt-1">
                      <CodeReveal code={inv.invite_code} />
                    </div>
                  )}
                </div>
                {inv.status === 'pending' && (
                  <button
                    onClick={() => revokeInvitation(inv.id)}
                    className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors shrink-0"
                    title="Revoke invitation"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 16 }}>delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
