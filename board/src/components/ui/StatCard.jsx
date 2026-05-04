export function StatCard({ label, value, icon, iconColor = '#4F46E5', sub, className = '' }) {
  return (
    <div className={['bg-surface border border-border rounded-xl p-5 shadow-card', className].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
          <p className="mt-1.5 text-2xl font-semibold text-text-primary">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-text-muted">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconColor + '15' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: iconColor }}>{icon}</span>
          </div>
        )}
      </div>
    </div>
  )
}
