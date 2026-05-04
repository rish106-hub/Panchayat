import { useAuth }  from '../../../context/AuthContext'
import { StatCard }  from '../../../components/ui/StatCard'
import { Button }    from '../../../components/ui/Button'
import { useApp }    from '../../../context/AppContext'

const HISTORY = [
  { id: 'p1', month: 'April 2025',   amount: 320, paid: true,  date: '2025-04-01' },
  { id: 'p2', month: 'March 2025',   amount: 320, paid: true,  date: '2025-03-01' },
  { id: 'p3', month: 'February 2025',amount: 320, paid: true,  date: '2025-02-02' },
  { id: 'p4', month: 'January 2025', amount: 320, paid: false, date: null },
]

function StatusChip({ paid }) {
  return (
    <span className={[
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-medium',
      paid ? 'bg-success/10 text-success-text' : 'bg-danger/10 text-danger',
    ].join(' ')}>
      <span className="material-symbols-rounded" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>
        {paid ? 'check_circle' : 'cancel'}
      </span>
      {paid ? 'Paid' : 'Unpaid'}
    </span>
  )
}

export default function Dues() {
  const { user }       = useAuth()
  const { dispatch }   = useApp()
  const isPaid         = user?.dues_status === 'paid'

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', payload: msg })
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dues &amp; Payments</h1>
        <p className="text-sm text-text-muted mt-0.5">Monthly HOA maintenance fee: <span className="font-medium text-text-primary">$320 / month</span></p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          label="Current status"
          value={isPaid ? 'Paid' : 'Due'}
          icon="account_balance_wallet"
          iconColor={isPaid ? '#059669' : '#DC2626'}
        />
        <StatCard label="Monthly fee"  value="$320"    icon="payments"       iconColor="#6366F1" />
        <StatCard label="YTD paid"     value="$960"    icon="trending_up"    iconColor="#0891B2" className="col-span-2 sm:col-span-1" />
      </div>

      {/* Current month */}
      <div className={[
        'rounded-xl border p-5 flex items-center justify-between gap-4',
        isPaid ? 'bg-success/5 border-success/30' : 'bg-danger/5 border-danger/30',
      ].join(' ')}>
        <div>
          <p className="text-sm font-semibold text-text-primary mb-0.5">May 2025</p>
          <p className="text-xs text-text-muted">Due by May 5, 2025</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-text-primary">$320</span>
          {isPaid ? (
            <span className="flex items-center gap-1.5 text-sm font-medium text-success">
              <span className="material-symbols-rounded" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Paid
            </span>
          ) : (
            <Button size="sm" onClick={() => showToast('Payment integration coming soon — contact your board to arrange payment.')}>
              Pay now
            </Button>
          )}
        </div>
      </div>

      {/* Payment history */}
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Payment history</h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {HISTORY.map((h, i) => (
            <div key={h.id} className={['px-4 py-3.5 flex items-center justify-between gap-3', i < HISTORY.length - 1 ? 'border-b border-border' : ''].join(' ')}>
              <div className="flex items-center gap-3">
                <div className={['w-8 h-8 rounded-lg flex items-center justify-center shrink-0', h.paid ? 'bg-success/10' : 'bg-danger/10'].join(' ')}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: h.paid ? '#059669' : '#DC2626', fontVariationSettings: "'FILL' 1" }}>
                    {h.paid ? 'receipt_long' : 'pending_actions'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{h.month}</p>
                  {h.date && <p className="text-xs text-text-muted">Paid {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">${h.amount}</span>
                <StatusChip paid={h.paid} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-center text-text-muted">Questions about dues? Contact your board at board@maplehoa.com</p>
    </div>
  )
}
