import { createClient } from '@/lib/supabase/server'
import { StatCard }     from '@/components/ui/StatCard'
import { ComplaintBadge, PriorityBadge } from '@/components/ui/Badge'

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('users').select('*, societies(name)').eq('id', user.id).single()
  const societyId = profile?.society_id

  const [
    { count: pending },
    { count: inProgress },
    { count: resolved },
    { data: recent },
    { data: gate },
    { count: totalResidents },
    { count: overdueCount },
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('status', 'Pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('status', 'In Progress'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('status', 'Resolved'),
    supabase.from('complaints').select('id, category, unit_number, status, priority, icon, color, transcript, created_at').eq('society_id', societyId).order('created_at', { ascending: false }).limit(6),
    supabase.from('gate_logs').select('id, type, description, unit_number, status, created_at').eq('society_id', societyId).order('created_at', { ascending: false }).limit(5),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('society_id', societyId),
    supabase.from('dues').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('status', 'overdue'),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{greeting}, {profile?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-text-muted mt-0.5">Board overview · {profile?.societies?.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Pending"      value={pending ?? 0}    icon="pending"              iconColor="#D97706" />
        <StatCard label="In Progress"  value={inProgress ?? 0} icon="autorenew"            iconColor="#6366F1" />
        <StatCard label="Resolved"     value={resolved ?? 0}   icon="check_circle"         iconColor="#059669" />
        <StatCard label="Dues overdue" value={overdueCount ?? 0} icon="account_balance_wallet" iconColor="#DC2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent complaints */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Recent complaints</h2>
            <a href="/dashboard/complaints" className="text-xs text-brand-600 hover:underline">View all</a>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {(recent ?? []).length === 0 ? (
              <p className="px-4 py-8 text-sm text-text-muted text-center">No complaints yet.</p>
            ) : (recent ?? []).map((c, i) => (
              <div key={c.id} className={['px-4 py-3 flex items-center gap-3', i < (recent?.length ?? 0) - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-text-primary truncate">{c.category}</span>
                    <span className="text-[10px] text-text-muted">· Unit {c.unit_number}</span>
                  </div>
                  <p className="text-[10px] text-text-muted truncate">{c.transcript?.slice(0, 50)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <ComplaintBadge status={c.status} />
                  <span className="text-[10px] text-text-muted">{timeAgo(c.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gate activity */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary">Gate activity</h2>
            <a href="/dashboard/gate" className="text-xs text-brand-600 hover:underline">View all</a>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {(gate ?? []).length === 0 ? (
              <p className="px-4 py-8 text-sm text-text-muted text-center">No gate activity.</p>
            ) : (gate ?? []).map((g, i) => (
              <div key={g.id} className={['px-4 py-3 flex items-center gap-3', i < (gate?.length ?? 0) - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center shrink-0">
                  <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 14 }}>
                    {g.type === 'package' ? 'inventory_2' : g.type === 'guest' ? 'person' : g.type === 'vehicle' ? 'directions_car' : 'local_shipping'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{g.description}</p>
                  <p className="text-[10px] text-text-muted">Unit {g.unit_number} · {g.status}</p>
                </div>
                <span className="text-[10px] text-text-muted shrink-0">{timeAgo(g.created_at)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
