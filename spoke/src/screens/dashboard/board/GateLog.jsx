import { useState } from 'react'
import { GATE_LOG }  from '../../../data/gateLogData'
import { Button }    from '../../../components/ui/Button'
import { Modal }     from '../../../components/ui/Modal'
import { Input }     from '../../../components/ui/Input'
import { useApp }    from '../../../context/AppContext'
import { timeAgo, formatTimestamp } from '../../../utils/timeAgo'

const TYPE_ICON  = { package: 'inventory_2', guest: 'person', delivery: 'local_shipping', vehicle: 'directions_car' }
const TYPE_COLOR = { package: '#6366F1', guest: '#0891B2', delivery: '#D97706', vehicle: '#059669' }

function TypeBadge({ type }) {
  const icon  = TYPE_ICON[type]  ?? 'info'
  const color = TYPE_COLOR[type] ?? '#94A3B8'
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium capitalize" style={{ background: color + '15', color }}>
      <span className="material-symbols-rounded" style={{ fontSize: 11 }}>{icon}</span>
      {type}
    </span>
  )
}

export default function GateLog() {
  const [logs, setLogs]       = useState(GATE_LOG)
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm]       = useState({ type: 'guest', description: '', unit: '', note: '' })
  const { dispatch }          = useApp()

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', payload: msg })
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
  }

  const filtered = logs.filter(g => {
    if (typeFilter !== 'all' && g.type !== typeFilter) return false
    if (search && !g.description.toLowerCase().includes(search.toLowerCase()) &&
                  !g.unit.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleLog(e) {
    e.preventDefault()
    if (!form.description.trim()) return
    const entry = {
      id:          `g-${Date.now()}`,
      type:        form.type,
      description: form.description.trim(),
      unit:        form.unit.trim() || 'MGMT',
      status:      form.type === 'guest' ? 'Signed in' : form.type === 'package' ? 'Arrived' : 'Logged',
      note:        form.note.trim(),
      createdAt:   new Date().toISOString(),
    }
    setLogs(ls => [entry, ...ls])
    setForm({ type: 'guest', description: '', unit: '', note: '' })
    setModalOpen(false)
    showToast('Gate entry logged')
  }

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Gate Log</h1>
            <p className="text-sm text-text-muted mt-0.5">{logs.length} entries today</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            Log entry
          </Button>
        </div>

        {/* Search + filter */}
        <div className="flex gap-2 mb-5">
          <div className="relative flex-1">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setType(e.target.value)}
            className="h-10 px-3 pr-8 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
          >
            <option value="all">All types</option>
            <option value="guest">Guest</option>
            <option value="package">Package</option>
            <option value="delivery">Delivery</option>
            <option value="vehicle">Vehicle</option>
          </select>
        </div>

        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {filtered.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <span className="material-symbols-rounded text-text-muted block mb-2" style={{ fontSize: 28 }}>door_front</span>
              <p className="text-sm text-text-muted">No entries match your filter.</p>
            </div>
          ) : (
            filtered.map((g, i) => (
              <div key={g.id} className={['px-4 py-3.5 flex items-center gap-3', i < filtered.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: (TYPE_COLOR[g.type] ?? '#94A3B8') + '15' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: TYPE_COLOR[g.type] ?? '#94A3B8' }}>{TYPE_ICON[g.type] ?? 'info'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{g.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TypeBadge type={g.type} />
                    <span className="text-2xs text-text-muted">Unit {g.unit}</span>
                    {g.note && <span className="text-2xs text-text-muted truncate">· {g.note}</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-medium text-text-secondary">{g.status}</span>
                  <span className="text-2xs text-text-muted">{timeAgo(g.createdAt ?? g.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Gate Entry">
        <form onSubmit={handleLog} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['guest', 'package', 'delivery', 'vehicle'].map(t => (
                <button
                  key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={[
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all',
                    form.type === t ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-border text-text-secondary hover:bg-surface-2',
                  ].join(' ')}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{TYPE_ICON[t]}</span>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="E.g. Guest: John Smith" required />
          <Input label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="4B" />
          <Input label="Note (optional)" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="E.g. Left at front desk" />
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth>Log entry</Button>
            <Button type="button" fullWidth variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
