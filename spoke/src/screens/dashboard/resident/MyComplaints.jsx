import { useState } from 'react'
import { useComplaints } from '../../../hooks/useComplaints'
import { useAuth }       from '../../../context/AuthContext'
import { ComplaintBadge, PriorityBadge } from '../../../components/ui/Badge'
import { EmptyState }    from '../../../components/ui/EmptyState'
import { timeAgo }       from '../../../utils/timeAgo'

const STATUS_TABS = ['All', 'Pending', 'In Progress', 'Resolved']

export default function MyComplaints() {
  const { user }       = useAuth()
  const { complaints } = useComplaints()
  const [tab, setTab]  = useState('All')
  const [search, setSearch] = useState('')

  const mine = complaints.filter(c =>
    c.unit === (user?.unit_number ?? user?.unit) ||
    c.unit_number === (user?.unit_number ?? user?.unit)
  )

  const filtered = mine.filter(c => {
    if (tab !== 'All' && c.status !== tab) return false
    if (search && !c.transcript?.toLowerCase().includes(search.toLowerCase()) &&
                  !c.category?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">My Complaints</h1>
        <p className="text-sm text-text-muted mt-0.5">Track all complaints filed from your unit.</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search complaints…"
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
            {t}
            {t !== 'All' && (
              <span className="ml-1.5 opacity-60">{mine.filter(c => c.status === t).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="inbox"
          title="No complaints found"
          description={search || tab !== 'All' ? 'Try adjusting your filters.' : 'File your first complaint using the voice button.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="bg-surface border border-border rounded-xl p-4 shadow-card hover:shadow-card-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">{c.category}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{c.transcript}</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <ComplaintBadge status={c.status} />
                    <span className="text-2xs text-text-muted font-mono">{timeAgo(c.createdAt ?? c.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
