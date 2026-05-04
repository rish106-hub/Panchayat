const STATUS_MAP = {
  Pending:     'bg-warning/10 text-warning-text',
  'In Progress': 'bg-brand-50 text-brand-700',
  Resolved:    'bg-success/10 text-success-text',
}

const PRIORITY_MAP = {
  High:   'bg-danger/10 text-danger',
  Medium: 'bg-warning/10 text-warning-text',
  Low:    'bg-success/10 text-success-text',
}

export function ComplaintBadge({ status }) {
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_MAP[status] ?? STATUS_MAP.Pending}`}>{status}</span>
}

export function PriorityBadge({ priority }) {
  if (!priority) return null
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${PRIORITY_MAP[priority] ?? ''}`}>{priority}</span>
}

export function DuesBadge({ status }) {
  const map = {
    paid:    'bg-success/10 text-success-text',
    overdue: 'bg-danger/10 text-danger',
    pending: 'bg-warning/10 text-warning-text',
    due:     'bg-warning/10 text-warning-text',
  }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${map[status] ?? map.pending}`}>{status ?? 'pending'}</span>
}
