import { useState } from 'react'
import { RESIDENTS, DUES_AMOUNT } from '../../../data/residentsData'
import { useComplaints } from '../../../hooks/useComplaints'
import { EmptyState }    from '../../../components/ui/EmptyState'

function DuesBadge({ status }) {
  const map = {
    paid:    { bg: 'bg-success/10 text-success-text', label: 'Paid' },
    overdue: { bg: 'bg-danger/10 text-danger',        label: 'Overdue' },
    pending: { bg: 'bg-warning/10 text-warning-text', label: 'Pending' },
  }
  const s = map[status] ?? map.pending
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-medium ${s.bg}`}>{s.label}</span>
  )
}

export default function BoardResidents() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const { complaints }      = useComplaints()

  const filtered = RESIDENTS.filter(r => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
                  !r.unit.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'overdue' && r.dues !== 'overdue') return false
    if (filter === 'not-onboarded' && r.onboarded) return false
    return true
  })

  const totalOwed = RESIDENTS.filter(r => r.dues === 'overdue').length * DUES_AMOUNT

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Residents</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {RESIDENTS.length} units · ${totalOwed.toLocaleString()} outstanding dues
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or unit…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
        >
          <option value="all">All residents</option>
          <option value="overdue">Dues overdue</option>
          <option value="not-onboarded">Not onboarded</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="group" title="No residents found" description="Try adjusting your search or filter." />
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {filtered.map((r, i) => {
            const cCount = complaints.filter(c => c.unit === r.unit).length
            return (
              <div key={r.id} className={['px-4 py-3.5 flex items-center gap-3', i < filtered.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-600">{r.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
                    {!r.onboarded && (
                      <span className="text-2xs text-text-muted border border-border rounded-full px-1.5 py-0.5">Not onboarded</span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">Unit {r.unit} · {cCount} complaint{cCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <DuesBadge status={r.dues} />
                  <span className="text-2xs text-text-muted">{r.phone}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
