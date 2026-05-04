import { useState } from 'react'
import { Button }     from '../../../components/ui/Button'
import { Modal }      from '../../../components/ui/Modal'
import { Input }      from '../../../components/ui/Input'
import { useApp }     from '../../../context/AppContext'

const INITIAL_TICKETS = [
  { id: 'mt-1', title: 'Lobby floor wax & buff',    area: 'Common Area', priority: 'Low',    status: 'Scheduled', date: '2025-05-10', vendor: 'CleanPro Inc.' },
  { id: 'mt-2', title: 'HVAC filter replacement',   area: 'Mechanical',  priority: 'Medium', status: 'In Progress', date: '2025-05-06', vendor: 'AirTech HVAC' },
  { id: 'mt-3', title: 'Pool pump inspection',      area: 'Pool',        priority: 'High',   status: 'Open',      date: '2025-05-04', vendor: '' },
  { id: 'mt-4', title: 'Fire extinguisher check',   area: 'Safety',      priority: 'High',   status: 'Completed', date: '2025-04-28', vendor: 'SafeGuard Co.' },
  { id: 'mt-5', title: 'Parking lot restriping',    area: 'Exterior',    priority: 'Low',    status: 'Completed', date: '2025-04-20', vendor: 'LineRight LLC' },
]

const STATUS_COLOR = {
  Open:        'bg-danger/10 text-danger',
  'In Progress':'bg-brand-50 text-brand-600',
  Scheduled:   'bg-warning/10 text-warning-text',
  Completed:   'bg-success/10 text-success-text',
}

const PRIORITY_COLOR = { High: '#DC2626', Medium: '#D97706', Low: '#6B7280' }

function StatusBadge({ status }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-medium ${STATUS_COLOR[status] ?? 'bg-surface-2 text-text-muted'}`}>{status}</span>
}

export default function Maintenance() {
  const [tickets, setTickets] = useState(INITIAL_TICKETS)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle]  = useState('')
  const [area,  setArea]   = useState('')
  const [priority, setPriority] = useState('Medium')
  const [filter, setFilter] = useState('all')
  const { dispatch } = useApp()

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', payload: msg })
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
  }

  function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) return
    const t = {
      id:       `mt-${Date.now()}`,
      title:    title.trim(),
      area:     area.trim() || 'General',
      priority,
      status:   'Open',
      date:     new Date().toISOString().slice(0, 10),
      vendor:   '',
    }
    setTickets(ts => [t, ...ts])
    setTitle(''); setArea(''); setPriority('Medium')
    setModalOpen(false)
    showToast('Maintenance ticket created')
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter || t.priority === filter)

  const open     = tickets.filter(t => t.status === 'Open').length
  const active   = tickets.filter(t => t.status === 'In Progress' || t.status === 'Scheduled').length
  const done     = tickets.filter(t => t.status === 'Completed').length

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Maintenance</h1>
            <p className="text-sm text-text-muted mt-0.5">{open} open · {active} active · {done} completed</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>add</span>
            New ticket
          </Button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-none">
          {['all', 'Open', 'In Progress', 'Scheduled', 'Completed', 'High'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-all',
                filter === f ? 'bg-brand-600 text-white' : 'bg-surface border border-border text-text-secondary hover:bg-surface-2',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map(t => (
            <div key={t.id} className="bg-surface border border-border rounded-xl p-4 shadow-card">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 16 }}>build</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary">{t.title}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{t.area}{t.vendor ? ` · ${t.vendor}` : ''}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-medium" style={{ color: PRIORITY_COLOR[t.priority] }}>{t.priority} priority</span>
                    <span className="text-2xs text-text-muted">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Maintenance Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g. Lobby light replacement" required />
          <Input label="Area / Location" value={area} onChange={e => setArea(e.target.value)} placeholder="E.g. Common Area, Pool, Unit 3A" />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map(p => (
                <button
                  key={p} type="button" onClick={() => setPriority(p)}
                  className={[
                    'py-2 rounded-xl border text-sm font-medium transition-all',
                    priority === p ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-border text-text-secondary hover:bg-surface-2',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" fullWidth>Create ticket</Button>
            <Button type="button" fullWidth variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
