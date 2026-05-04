'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ComplaintBadge, PriorityBadge } from '@/components/ui/Badge'
import { Button }  from '@/components/ui/Button'
import { Modal }   from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

const TABS   = ['All', 'Pending', 'In Progress', 'Resolved']
const NEXT   = { 'Pending': 'In Progress', 'In Progress': 'Resolved' }
const PORDER = { High: 0, Medium: 1, Low: 2 }

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function ComplaintsPage() {
  const supabase = createClient()
  const toast    = useToast()
  const [complaints, setComplaints] = useState([])
  const [tab,    setTab]    = useState('All')
  const [search, setSearch] = useState('')
  const [sel,    setSel]    = useState(null)
  const [saving, setSaving] = useState(false)
  const [societyId, setSocietyId] = useState(null)

  const load = useCallback(async (sid) => {
    const { data } = await supabase.from('complaints').select('*').eq('society_id', sid).order('created_at', { ascending: false })
    if (data) setComplaints(data)
  }, [supabase])

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (p?.society_id) { setSocietyId(p.society_id); load(p.society_id) }
    })
  }, [load, supabase])

  const filtered = complaints
    .filter(c => (tab === 'All' || c.status === tab) &&
      (!search || c.category?.toLowerCase().includes(search.toLowerCase()) ||
       c.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
       c.transcript?.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => (PORDER[a.priority] ?? 3) - (PORDER[b.priority] ?? 3) || new Date(b.created_at) - new Date(a.created_at))

  async function advance() {
    if (!sel || saving) return
    const next = NEXT[sel.status]
    if (!next) return
    setSaving(true)
    const { error } = await supabase.from('complaints').update({ status: next, updated_at: new Date().toISOString() }).eq('id', sel.id)
    if (error) { toast(error.message, 'error') }
    else {
      setComplaints(cs => cs.map(c => c.id === sel.id ? { ...c, status: next } : c))
      setSel(s => s ? { ...s, status: next } : null)
      toast(`Marked as ${next}`)
    }
    setSaving(false)
  }

  const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 }
  complaints.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++ })

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Complaints</h1>
          <p className="text-sm text-text-muted mt-0.5">{counts.Pending} pending · {counts['In Progress']} in progress · {counts.Resolved} resolved</p>
        </div>

        <div className="relative mb-4">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by category, unit, or description…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors" />
        </div>

        <div className="flex gap-1 mb-5 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={['px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', tab === t ? 'bg-brand-600 text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'].join(' ')}>
              {t} {t !== 'All' && <span className="opacity-60 ml-1">{counts[t] ?? 0}</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-text-muted">No complaints match your filter.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <button key={c.id} onClick={() => setSel(c)}
                className="w-full bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-card-md hover:border-border-strong transition-all text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary">{c.category}</span>
                      <span className="text-xs text-text-muted">· Unit {c.unit_number}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{c.transcript}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ComplaintBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-[10px] text-text-muted ml-auto">{timeAgo(c.created_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!sel} onClose={() => setSel(null)} title="Complaint Detail">
        {sel && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: (sel.color ?? '#94A3B8') + '18' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: sel.color ?? '#94A3B8' }}>{sel.icon ?? 'report_problem'}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{sel.category}</h3>
                <p className="text-xs text-text-muted">Unit {sel.unit_number} · {new Date(sel.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ComplaintBadge status={sel.status} />
              <PriorityBadge priority={sel.priority} />
            </div>
            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Resident description</p>
              <p className="text-sm text-text-primary leading-relaxed">{sel.transcript}</p>
            </div>
            <p className="text-[10px] text-text-muted font-mono">ID: {sel.id}</p>
            <div className="flex gap-2 pt-1">
              {NEXT[sel.status] && (
                <Button fullWidth loading={saving} onClick={advance}>
                  Mark as {NEXT[sel.status]}
                </Button>
              )}
              <Button fullWidth variant="secondary" onClick={() => setSel(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
