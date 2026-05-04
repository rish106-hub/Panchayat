import { useNavigate }   from 'react-router-dom'
import { useAuth }       from '../../../context/AuthContext'
import { useComplaints } from '../../../hooks/useComplaints'
import { StatCard }      from '../../../components/ui/StatCard'
import { ComplaintBadge } from '../../../components/ui/Badge'
import { Button }        from '../../../components/ui/Button'
import { EmptyState }    from '../../../components/ui/EmptyState'
import { GATE_LOG }      from '../../../data/gateLogData'
import { timeAgo }       from '../../../utils/timeAgo'

export default function ResidentHome() {
  const navigate = useNavigate()
  const { user }   = useAuth()
  const { complaints } = useComplaints()

  const myComplaints = complaints
    .filter(c => c.unit === (user?.unit_number ?? user?.unit) || c.unit_number === (user?.unit_number ?? user?.unit))
    .slice(0, 3)

  const open     = complaints.filter(c => c.status === 'Pending' || c.status === 'In Progress').length
  const resolved = complaints.filter(c => c.status === 'Resolved').length
  const recentGate = GATE_LOG.filter(g => g.unit === (user?.unit_number ?? user?.unit ?? '4B')).slice(0, 3)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-primary">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {user?.unit_number ?? user?.unit ? `Unit ${user.unit_number ?? user.unit} · ` : ''}
            {user?.societies?.name ?? 'Maple Heights HOA'}
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/voice')}>
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>keyboard_voice</span>
          File complaint
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Open issues"   value={open}     icon="pending"       iconColor="#D97706" />
        <StatCard label="Resolved"      value={resolved} icon="check_circle"  iconColor="#059669" />
        <StatCard
          label="Dues status"
          value={user?.dues_status === 'paid' ? 'Paid' : 'Due'}
          icon="account_balance_wallet"
          iconColor={user?.dues_status === 'paid' ? '#059669' : '#DC2626'}
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {/* Voice CTA card */}
      <div className="bg-brand-600 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-white mb-1">Have an issue to report?</h2>
          <p className="text-sm text-brand-200">Tap the mic, speak naturally — AI classifies it in seconds.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/voice')}
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/40 flex items-center justify-center transition-colors shrink-0"
        >
          <span className="material-symbols-rounded text-white" style={{ fontSize: 24 }}>mic</span>
        </button>
      </div>

      {/* My complaints */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-primary">My complaints</h2>
          <button onClick={() => navigate('/dashboard/complaints')} className="text-xs text-brand-600 hover:underline">View all</button>
        </div>
        {myComplaints.length === 0 ? (
          <EmptyState icon="inbox" title="No complaints yet" description="File your first complaint using the voice button above." />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {myComplaints.map((c, i) => (
              <div key={c.id} className={['px-4 py-3.5 flex items-center gap-3', i < myComplaints.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{c.category}</p>
                  <p className="text-xs text-text-muted truncate">{c.transcript?.slice(0, 60)}…</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <ComplaintBadge status={c.status} />
                  <span className="text-2xs text-text-muted">{timeAgo(c.createdAt ?? c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Gate activity */}
      {recentGate.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Recent gate activity</h2>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {recentGate.map((g, i) => (
              <div key={g.id} className={['px-4 py-3 flex items-center gap-3', i < recentGate.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 15 }}>
                    {g.type === 'package' || g.type === 'Package' ? 'inventory_2' :
                     g.type === 'guest'   || g.type === 'Guest'   ? 'person'       : 'local_shipping'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{g.description}</p>
                  <p className="text-xs text-text-muted">{g.status}</p>
                </div>
                <span className="text-2xs text-text-muted shrink-0">{timeAgo(g.createdAt ?? g.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
