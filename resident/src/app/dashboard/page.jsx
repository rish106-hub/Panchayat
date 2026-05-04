import { createClient } from '@/lib/supabase/server'
import { ComplaintBadge } from '@/components/ui/Badge'
import Link from 'next/link'

function timeAgo(iso) {
  if (!iso) return ''
  const m = Math.floor((Date.now() - new Date(iso)) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StatCard({ label, value, icon, iconColor }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-muted mb-1">{label}</p>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconColor + '18' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 18, color: iconColor }}>{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('users').select('*, societies(name)').eq('id', user.id).single()
  const societyId = profile?.society_id

  const [
    { count: myPending },
    { count: myResolved },
    { data: recentComplaints },
    { data: latestDue },
  ] = await Promise.all([
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('unit_number', profile?.unit_number).eq('status', 'Pending'),
    supabase.from('complaints').select('*', { count: 'exact', head: true }).eq('society_id', societyId).eq('unit_number', profile?.unit_number).eq('status', 'Resolved'),
    supabase.from('complaints').select('id, category, status, priority, icon, color, transcript, created_at').eq('society_id', societyId).eq('unit_number', profile?.unit_number).order('created_at', { ascending: false }).limit(5),
    supabase.from('dues').select('status, due_date, amount').eq('society_id', societyId).eq('user_id', user.id).order('due_date', { ascending: false }).limit(1),
  ])

  const duesStatus = latestDue?.[0]?.status ?? 'pending'
  const duesColor = duesStatus === 'paid' ? '#059669' : duesStatus === 'overdue' ? '#DC2626' : '#D97706'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{greeting}, {profile?.name?.split(' ')[0]}!</h1>
        <p className="text-sm text-text-muted mt-0.5">Unit {profile?.unit_number} · {profile?.societies?.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Pending" value={myPending ?? 0} icon="pending_actions" iconColor="#D97706" />
        <StatCard label="Resolved" value={myResolved ?? 0} icon="check_circle" iconColor="#059669" />
        <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
          <p className="text-xs text-text-muted mb-1">Dues</p>
          <p className="text-2xl font-bold capitalize" style={{ color: duesColor }}>{duesStatus}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/voice" className="bg-brand-600 rounded-2xl p-4 text-white hover:bg-brand-700 transition-colors shadow-sm">
            <span className="material-symbols-rounded mb-2 block" style={{ fontSize: 24 }}>report_problem</span>
            <p className="text-sm font-semibold">Submit complaint</p>
            <p className="text-xs opacity-70 mt-0.5">Describe your issue</p>
          </Link>
          <Link href="/dashboard/dues" className="bg-surface border border-border rounded-2xl p-4 hover:bg-surface-2 transition-colors shadow-card">
            <span className="material-symbols-rounded mb-2 block text-brand-600" style={{ fontSize: 24 }}>account_balance_wallet</span>
            <p className="text-sm font-semibold text-text-primary">View dues</p>
            <p className="text-xs text-text-muted mt-0.5">Payment history</p>
          </Link>
        </div>
      </div>

      {/* Recent complaints */}
      {(recentComplaints ?? []).length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-text-primary">Your complaints</p>
            <Link href="/dashboard/complaints" className="text-xs text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            {recentComplaints.map((c, i) => (
              <div key={c.id} className={['px-4 py-3 flex items-center gap-3', i < recentComplaints.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{c.category}</p>
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
      )}
    </div>
  )
}
