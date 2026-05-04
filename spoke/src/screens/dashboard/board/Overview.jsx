import { useNavigate }   from 'react-router-dom'
import { useComplaints } from '../../../hooks/useComplaints'
import { useAuth }       from '../../../context/AuthContext'
import { StatCard }      from '../../../components/ui/StatCard'
import { ComplaintBadge, PriorityBadge } from '../../../components/ui/Badge'
import { Button }        from '../../../components/ui/Button'
import { EmptyState }    from '../../../components/ui/EmptyState'
import { RESIDENTS }     from '../../../data/residentsData'
import { GATE_LOG }      from '../../../data/gateLogData'
import { timeAgo }       from '../../../utils/timeAgo'

export default function BoardOverview() {
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const { complaints } = useComplaints()

  const pending    = complaints.filter(c => c.status === 'Pending').length
  const inProgress = complaints.filter(c => c.status === 'In Progress').length
  const resolved   = complaints.filter(c => c.status === 'Resolved').length
  const overdue    = RESIDENTS.filter(r => r.dues === 'overdue').length
  const paid       = RESIDENTS.filter(r => r.dues === 'paid').length
  const recentComplaints = complaints.slice(0, 5)
  const recentGate       = GATE_LOG.slice(0, 4)

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-text-muted mt-0.5">Board overview · Maple Heights HOA</p>
        </div>
        <Button onClick={() => navigate('/dashboard/complaints')}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>inbox</span>
          Review queue
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending"     value={pending}    icon="pending"       iconColor="#D97706" />
        <StatCard label="In Progress" value={inProgress} icon="autorenew"     iconColor="#6366F1" />
        <StatCard label="Resolved"    value={resolved}   icon="check_circle"  iconColor="#059669" />
        <StatCard label="Dues overdue" value={overdue}   icon="payments"      iconColor="#DC2626" />
      </div>

      {/* Dues collection bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-text-primary">May dues collection</span>
          <span className="text-sm font-bold text-text-primary">{Math.round((paid / RESIDENTS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${(paid / RESIDENTS.length) * 100}%` }} />
        </div>
        <p className="text-xs text-text-muted mt-1.5">{paid} of {RESIDENTS.length} units paid · {overdue} overdue</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent complaints */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Recent complaints</h2>
            <button onClick={() => navigate('/dashboard/complaints')} className="text-xs text-brand-600 hover:underline">View all</button>
          </div>
          {recentComplaints.length === 0 ? (
            <EmptyState icon="inbox" title="No complaints" description="All clear!" />
          ) : (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
              {recentComplaints.map((c, i) => (
                <div key={c.id} className={['px-4 py-3 flex items-center gap-3', i < recentComplaints.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 14, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-text-primary truncate">{c.category}</span>
                      <span className="text-2xs text-text-muted">· Unit {c.unit}</span>
                    </div>
                    <p className="text-2xs text-text-muted truncate">{c.transcript?.slice(0, 50)}…</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <ComplaintBadge status={c.status} />
                    <PriorityBadge priority={c.priority} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Gate activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Gate activity</h2>
            <button onClick={() => navigate('/dashboard/gate')} className="text-xs text-brand-600 hover:underline">View all</button>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {recentGate.map((g, i) => (
              <div key={g.id} className={['px-4 py-3 flex items-center gap-3', i < recentGate.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 14 }}>
                    {g.type === 'package' ? 'inventory_2' : g.type === 'guest' ? 'person' : g.type === 'vehicle' ? 'directions_car' : 'local_shipping'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{g.description}</p>
                  <p className="text-2xs text-text-muted">Unit {g.unit} · {g.status}</p>
                </div>
                <span className="text-2xs text-text-muted shrink-0">{timeAgo(g.createdAt ?? g.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
