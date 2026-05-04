import { useNavigate } from 'react-router-dom'
import { useApp }      from '../../../context/AppContext'
import { Button }      from '../../../components/ui/Button'
import { ComplaintBadge, PriorityBadge } from '../../../components/ui/Badge'

export default function Confirmation() {
  const navigate  = useNavigate()
  const { state } = useApp()
  const c         = state.currentComplaint

  if (!c) { navigate('/dashboard', { replace: true }); return null }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-10 flex flex-col items-center text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-full bg-success/12 flex items-center justify-center mb-5">
        <span className="material-symbols-rounded text-success" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>

      <h1 className="text-xl font-bold text-text-primary mb-1">Complaint submitted!</h1>
      <p className="text-sm text-text-secondary mb-6 max-w-xs">
        Your complaint has been logged and the board has been notified. You'll see updates in your complaints feed.
      </p>

      {/* Complaint card */}
      <div className="w-full bg-surface border border-border rounded-xl p-4 text-left mb-6 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: (c.color ?? '#94A3B8') + '18' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16, color: c.color ?? '#94A3B8' }}>{c.icon ?? 'report_problem'}</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">{c.category}</span>
          </div>
          <PriorityBadge priority={c.priority} />
        </div>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{c.transcript}</p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <ComplaintBadge status={c.status ?? 'Pending'} />
          <span className="text-xs text-text-muted font-mono">{c.id}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full">
        <Button fullWidth onClick={() => navigate('/dashboard/complaints')}>
          View my complaints
        </Button>
        <Button fullWidth variant="secondary" onClick={() => navigate('/dashboard/voice')}>
          File another
        </Button>
        <Button fullWidth variant="ghost" onClick={() => navigate('/dashboard')}>
          Back to home
        </Button>
      </div>
    </div>
  )
}
