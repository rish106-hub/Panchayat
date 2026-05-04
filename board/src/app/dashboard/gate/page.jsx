'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal }  from '@/components/ui/Modal'
import { Input }  from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

const TYPE_ICON  = { package: 'inventory_2', guest: 'person', delivery: 'local_shipping', vehicle: 'directions_car' }
const TYPE_COLOR = { package: '#6366F1', guest: '#0891B2', delivery: '#D97706', vehicle: '#059669' }

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function GateLogPage() {
  const supabase = createClient()
  const toast    = useToast()
  const [logs, setLogs]           = useState([])
  const [societyId, setSocietyId] = useState(null)
  const [createdBy, setCreatedBy] = useState(null)
  const [search, setSearch]       = useState('')
  const [typeFilter, setType]     = useState('all')
  const [open, setOpen]           = useState(false)
  const [form, setForm]           = useState({ type: 'guest', description: '', unit_number: '', note: '' })
  const [saving, setSaving]       = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) return
      setSocietyId(p.society_id)
      setCreatedBy(user.id)
      const { data } = await supabase.from('gate_logs').select('*').eq('society_id', p.society_id).order('created_at', { ascending: false }).limit(100)
      if (data) setLogs(data)
    })
  }, [supabase])

  const filtered = logs.filter(g =>
    (typeFilter === 'all' || g.type === typeFilter) &&
    (!search || g.description?.toLowerCase().includes(search.toLowerCase()) || g.unit_number?.toLowerCase().includes(search.toLowerCase()))
  )

  async function logEntry(e) {
    e.preventDefault()
    if (!form.description.trim()) return
    setSaving(true)
    const entry = {
      society_id:  societyId,
      logged_by:   createdBy,
      type:        form.type,
      description: form.description.trim(),
      unit_number: form.unit_number.trim() || 'MGMT',
      status:      form.type === 'guest' ? 'Signed in' : form.type === 'package' ? 'Arrived' : 'Logged',
      note:        form.note.trim(),
    }
    const { data, error } = await supabase.from('gate_logs').insert(entry).select().single()
    setSaving(false)
    if (error) { toast(error.message, 'error'); return }
    setLogs(ls => [data, ...ls])
    setForm({ type: 'guest', description: '', unit_number: '', note: '' })
    setOpen(false)
    toast('Gate entry logged')
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gate Log</h1>
            <p className="text-sm text-text-muted mt-0.5">{logs.length} total entries</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            Log entry
          </Button>
        </div>

        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
          </div>
          <select value={typeFilter} onChange={e => setType(e.target.value)}
            className="h-10 px-3 pr-8 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer">
            <option value="all">All types</option>
            <option value="guest">Guest</option>
            <option value="package">Package</option>
            <option value="delivery">Delivery</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {filtered.length === 0 ? (
            <p className="px-4 py-12 text-sm text-text-muted text-center">No entries match your filter.</p>
          ) : filtered.map((g, i) => (
            <div key={g.id} className={['px-4 py-3.5 flex items-center gap-3', i < filtered.length - 1 ? 'border-b border-border' : ''].join(' ')}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: (TYPE_COLOR[g.type] ?? '#94A3B8') + '15' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: TYPE_COLOR[g.type] ?? '#94A3B8' }}>{TYPE_ICON[g.type] ?? 'info'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{g.description}</p>
                <p className="text-xs text-text-muted capitalize">{g.type} · Unit {g.unit_number}{g.note ? ` · ${g.note}` : ''}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-medium text-text-secondary">{g.status}</p>
                <p className="text-[10px] text-text-muted">{timeAgo(g.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Log Gate Entry">
        <form onSubmit={logEntry} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['guest', 'package', 'delivery', 'vehicle'].map(t => (
                <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={['flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all',
                    form.type === t ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-border text-text-secondary hover:bg-surface-2'].join(' ')}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{TYPE_ICON[t]}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="E.g. Guest: John Smith" required />
          <Input label="Unit" value={form.unit_number} onChange={e => setForm(f => ({ ...f, unit_number: e.target.value }))} placeholder="4B" />
          <Input label="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="E.g. Left at front desk" />
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth loading={saving}>Log entry</Button>
            <Button type="button" fullWidth variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
