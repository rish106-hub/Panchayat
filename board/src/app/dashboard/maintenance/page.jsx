'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal }  from '@/components/ui/Modal'
import { Input }  from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const PRIORITY_COLOR = { High: '#DC2626', Medium: '#D97706', Low: '#059669' }
const STATUS_NEXT = { 'Open': 'In Progress', 'In Progress': 'Resolved' }
const STATUS_COLOR = { 'Open': '#6366F1', 'In Progress': '#D97706', 'Resolved': '#059669' }

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function MaintenancePage() {
  const supabase = createClient()
  const toast    = useToast()
  const [tickets, setTickets]     = useState([])
  const [societyId, setSocietyId] = useState(null)
  const [createdBy, setCreatedBy] = useState(null)
  const [tab, setTab]             = useState('All')
  const [search, setSearch]       = useState('')
  const [open, setOpen]           = useState(false)
  const [sel, setSel]             = useState(null)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState({ title: '', description: '', priority: 'Medium', location: '' })

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) return
      setSocietyId(p.society_id)
      setCreatedBy(user.id)
      const { data } = await supabase.from('maintenance_tickets').select('*').eq('society_id', p.society_id).order('created_at', { ascending: false })
      if (data) setTickets(data)
    })
  }, [supabase])

  const tabs = ['All', 'Open', 'In Progress', 'Resolved']
  const counts = { Open: 0, 'In Progress': 0, Resolved: 0 }
  tickets.forEach(t => { if (counts[t.status] !== undefined) counts[t.status]++ })

  const filtered = tickets.filter(t =>
    (tab === 'All' || t.status === tab) &&
    (!search || t.title?.toLowerCase().includes(search.toLowerCase()) || t.location?.toLowerCase().includes(search.toLowerCase()))
  )

  async function createTicket(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const entry = {
      society_id:  societyId,
      created_by:  createdBy,
      title:       form.title.trim(),
      description: form.description.trim(),
      priority:    form.priority,
      location:    form.location.trim(),
      status:      'Open',
    }
    const { data, error } = await supabase.from('maintenance_tickets').insert(entry).select().single()
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setTickets(ts => [data, ...ts])
    setForm({ title: '', description: '', priority: 'Medium', location: '' })
    setOpen(false)
    toast('Ticket created')
  }

  async function advance() {
    if (!sel || saving) return
    const next = STATUS_NEXT[sel.status]
    if (!next) return
    setSaving(true)
    const { error } = await supabase.from('maintenance_tickets').update({ status: next }).eq('id', sel.id)
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setTickets(ts => ts.map(t => t.id === sel.id ? { ...t, status: next } : t))
    setSel(s => s ? { ...s, status: next } : null)
    toast(`Marked as ${next}`)
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Maintenance</h1>
            <p className="text-sm text-text-muted mt-0.5">{counts.Open} open · {counts['In Progress']} in progress</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            New ticket
          </Button>
        </div>

        <div className="relative mb-4">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
        </div>

        <div className="flex gap-1 mb-5 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={['px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all', tab === t ? 'bg-brand-600 text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-2'].join(' ')}>
              {t} {t !== 'All' && <span className="opacity-60 ml-1">{counts[t] ?? 0}</span>}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-text-muted">No tickets match your filter.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(t => (
              <button key={t.id} onClick={() => setSel(t)}
                className="w-full bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-card-md hover:border-border-strong transition-all text-left">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5 bg-surface-2">
                    <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 18 }}>build</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary truncate">{t.title}</span>
                      {t.location && <span className="text-xs text-text-muted shrink-0">· {t.location}</span>}
                    </div>
                    {t.description && <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{t.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: (STATUS_COLOR[t.status] ?? '#94A3B8') + '18', color: STATUS_COLOR[t.status] ?? '#94A3B8' }}>
                        {t.status}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: (PRIORITY_COLOR[t.priority] ?? '#94A3B8') + '18', color: PRIORITY_COLOR[t.priority] ?? '#94A3B8' }}>
                        {t.priority}
                      </span>
                      <span className="text-[10px] text-text-muted ml-auto">{timeAgo(t.created_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create ticket modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Maintenance Ticket">
        <form onSubmit={createTicket} className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="E.g. Elevator not working" required />
          <Input label="Location (optional)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="E.g. Block B, Floor 3" />
          <Input as="textarea" label="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue…" rows={3} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['High', 'Medium', 'Low'].map(p => (
                <button key={p} type="button" onClick={() => setForm(f => ({ ...f, priority: p }))}
                  className={['px-3 py-2 rounded-xl border text-sm font-medium transition-all', form.priority === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-border text-text-secondary hover:bg-surface-2'].join(' ')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth loading={saving}>Create ticket</Button>
            <Button type="button" fullWidth variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Detail modal */}
      <Modal open={!!sel} onClose={() => setSel(null)} title="Ticket Detail">
        {sel && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary">{sel.title}</h3>
              {sel.location && <p className="text-xs text-text-muted mt-0.5">{sel.location}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: (STATUS_COLOR[sel.status] ?? '#94A3B8') + '18', color: STATUS_COLOR[sel.status] ?? '#94A3B8' }}>{sel.status}</span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: (PRIORITY_COLOR[sel.priority] ?? '#94A3B8') + '18', color: PRIORITY_COLOR[sel.priority] ?? '#94A3B8' }}>{sel.priority} Priority</span>
            </div>
            {sel.description && (
              <div className="bg-surface-2 rounded-xl p-3">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5">Description</p>
                <p className="text-sm text-text-primary leading-relaxed">{sel.description}</p>
              </div>
            )}
            <p className="text-[10px] text-text-muted">Created {timeAgo(sel.created_at)}</p>
            <div className="flex gap-2 pt-1">
              {STATUS_NEXT[sel.status] && (
                <Button fullWidth loading={saving} onClick={advance}>Mark as {STATUS_NEXT[sel.status]}</Button>
              )}
              <Button fullWidth variant="secondary" onClick={() => setSel(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
