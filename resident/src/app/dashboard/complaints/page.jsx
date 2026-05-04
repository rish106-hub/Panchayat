'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ComplaintBadge, PriorityBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import Link from 'next/link'

const TABS = ['All', 'Pending', 'In Progress', 'Resolved']

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
  const [complaints, setComplaints] = useState([])
  const [tab,    setTab]    = useState('All')
  const [search, setSearch] = useState('')
  const [sel,    setSel]    = useState(null)
  const [loading, setLoad]  = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id, unit_number').eq('id', user.id).single()
      if (!p?.society_id) return
      const { data } = await supabase.from('complaints').select('*').eq('society_id', p.society_id).eq('unit_number', p.unit_number).order('created_at', { ascending: false })
      if (data) setComplaints(data)
      setLoad(false)
    })
  }, [supabase])

  const filtered = complaints.filter(c =>
    (tab === 'All' || c.status === tab) &&
    (!search || c.category?.toLowerCase().includes(search.toLowerCase()) || c.transcript?.toLowerCase().includes(search.toLowerCase()))
  )

  const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 }
  complaints.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++ })

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">My Complaints</h1>
            <p className="text-sm text-text-muted mt-0.5">{complaints.length} total</p>
          </div>
          <Link href="/dashboard/voice"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors">
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            New
          </Link>
        </div>

        <div className="relative mb-4">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
        </div>

        <div className="flex gap-1 mb-5 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={['px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', tab === t ? 'bg-brand-600 text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'].join(' ')}>
              {t} {t !== 'All' && <span className="opacity-60 ml-1">{counts[t] ?? 0}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-text-muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-text-muted mb-4">No complaints yet.</p>
            <Link href="/dashboard/voice" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
              Submit a complaint
            </Link>
          </div>
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
                    <p className="text-sm font-semibold text-text-primary mb-0.5">{c.category}</p>
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
                <p className="text-xs text-text-muted">{new Date(sel.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <ComplaintBadge status={sel.status} />
              <PriorityBadge priority={sel.priority} />
            </div>
            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Your description</p>
              <p className="text-sm text-text-primary leading-relaxed">{sel.transcript}</p>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
