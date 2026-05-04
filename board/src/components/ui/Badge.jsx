const VARIANTS = {
  default: 'bg-surface-2 text-text-secondary border border-border',
  brand:   'bg-brand-50 text-brand-700 border border-brand-200',
  success: 'bg-success-light text-success-text border border-success/20',
  warning: 'bg-warning-light text-warning-text border border-warning/20',
  danger:  'bg-danger-light text-danger-text border border-danger/20',
  info:    'bg-info-light text-info-text border border-info/20',
}

export function Badge({ children, variant = 'default', dot, className = '' }) {
  return (
    <span className={[
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
      VARIANTS[variant] ?? VARIANTS.default,
      className,
    ].join(' ')}>
      {dot && (
        <span className={[
          'w-1.5 h-1.5 rounded-full shrink-0',
          variant === 'success' ? 'bg-success' :
          variant === 'warning' ? 'bg-warning' :
          variant === 'danger'  ? 'bg-danger'  :
          variant === 'info'    ? 'bg-info'     :
          variant === 'brand'   ? 'bg-brand-600' : 'bg-text-muted',
        ].join(' ')} />
      )}
      {children}
    </span>
  )
}

export function ComplaintBadge({ status }) {
  const map = {
    'Pending':     { variant: 'warning', label: 'Pending' },
    'In Progress': { variant: 'info',    label: 'In Progress' },
    'Resolved':    { variant: 'success', label: 'Resolved' },
    'Dismissed':   { variant: 'default', label: 'Dismissed' },
  }
  const cfg = map[status] ?? { variant: 'default', label: status }
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
}

export function PriorityBadge({ priority }) {
  const map = { High: 'danger', Urgent: 'danger', Medium: 'warning', Low: 'success' }
  return <Badge variant={map[priority] ?? 'default'}>{priority}</Badge>
}
