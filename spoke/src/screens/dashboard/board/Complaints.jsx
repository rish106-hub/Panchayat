import { useState }    from 'react'
import { useComplaints } from '../../../hooks/useComplaints'
import { ComplaintBadge, PriorityBadge } from '../../../components/ui/Badge'
import { EmptyState }    from '../../../components/ui/EmptyState'
import { Modal }         from '../../../components/ui/Modal'
import { Button }        from '../../../components/ui/Button'
import { useApp }        from '../../../context/AppContext'
import { timeAgo, formatTimestamp } from '../../../utils/timeAgo'

const STATUS_TABS  = ['All', 'Pending', 'In Progress', 'Resolved']
const NEXT_STATUS  = { 'Pending': 'In Progress', 'In Progress': 'Resolved', 'Resolved': 'Resolved' }
const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 }

export default function BoardComplaints() {
  const { complaints, updateStatus } = useComplaints()
  const { dispatch }   = useApp()
  const [tab,    setTab]    = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', payload: msg })
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
  }

  const filtered = complaints
    .filter(c => {
      if (tab !== 'All' && c.status !== tab) return false
      if (search && !c.transcript?.toLowerCase().includes(search.toLowerCase()) &&
                    !c.category?.toLowerCase().includes(search.toLowerCase()) &&
                    !c.unit?.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const pd = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
      if (pd !== 0) return pd
      return new Date(b.createdAt ?? b.created_at) - new Date(a.createdAt ?? a.created_at)
    })

  async function handleAdvance() {
    if (!selected || updating) return
    const next = NEXT_STATUS[selected.status]
    if (next === selected.status) { setSelected(null); return }
    setUpdating(true)
    await updateStatus(selected.id, next)
    setUpdating(false)
    setSelected(s => s ? { ...s, status: next } : null)
    showToast(`Complaint marked as ${next}`)
  }

  const counts = { Pending: 0, 'In Progress': 0, Resolved: 0 }
  complaints.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++ })

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-text-primary">Complaints</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {counts.Pending} pending · {counts['In Progress']} in progress · {counts.Resolved} resolved
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by category, unit, or description…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto scrollbar-none">
          {STATUS_TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                tab === t
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface border border-border text-text-secondary hover:bg-surface-2',
              ].join(' ')}
            >
              {t} {t !== 'All' && <span className="opacity-60 ml-1">{counts[t] ?? 0}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState icon="inbox" title="No complaints" description="Nothing matches your filter." />
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className="w-full bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-card-md hover:border-border-strong transition-all text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center mt-0.5" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-text-primary">{c.category}</span>
                      <span className="text-xs text-text-muted">· Unit {c.unit}</span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{c.transcript}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ComplaintBadge status={c.status} />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-2xs text-text-muted ml-auto">{timeAgo(c.createdAt ?? c.created_at)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Complaint Detail"
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: (selected.color ?? '#94A3B8') + '18' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: selected.color ?? '#94A3B8' }}>{selected.icon ?? 'report_problem'}</span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">{selected.category}</h3>
                <p className="text-xs text-text-muted">Unit {selected.unit} · {formatTimestamp(selected.createdAt ?? selected.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ComplaintBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            <div className="bg-surface-2 rounded-xl p-3">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">Transcript</p>
              <p className="text-sm text-text-primary leading-relaxed">{selected.transcript}</p>
            </div>

            <p className="text-xs text-text-muted font-mono">ID: {selected.id}</p>

            <div className="flex gap-2 pt-2">
              {selected.status !== 'Resolved' && (
                <Button fullWidth loading={updating} onClick={handleAdvance}>
                  Mark as {NEXT_STATUS[selected.status]}
                </Button>
              )}
              <Button fullWidth variant="secondary" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
