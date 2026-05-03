// Full Tailwind class strings — must be complete to survive purge
export const STATUS_META = {
  'Pending': {
    label: 'Pending',
    bg: 'bg-warn/10',
    text: 'text-warn',
    border: 'border-warn/30',
    selectBg: '#F59E0B1A',
    selectText: '#F59E0B',
    selectBorder: '#F59E0B4D',
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-primary/10',
    text: 'text-primary',
    border: 'border-primary/30',
    selectBg: '#6366F11A',
    selectText: '#6366F1',
    selectBorder: '#6366F14D',
  },
  'Resolved': {
    label: 'Resolved',
    bg: 'bg-ok/10',
    text: 'text-ok',
    border: 'border-ok/30',
    selectBg: '#10B9811A',
    selectText: '#10B981',
    selectBorder: '#10B9814D',
  },
}

export const PRIORITY_META = {
  'High':   { label: 'High',   dotClass: 'bg-err',  textClass: 'text-err'  },
  'Medium': { label: 'Medium', dotClass: 'bg-warn', textClass: 'text-warn' },
  'Low':    { label: 'Low',    dotClass: 'bg-ok',   textClass: 'text-ok'   },
}

export function statusClasses(status) {
  return STATUS_META[status] ?? STATUS_META['Pending']
}

export function priorityClasses(priority) {
  return PRIORITY_META[priority] ?? PRIORITY_META['Medium']
}

export function generateId() {
  const num = Math.floor(Math.random() * 9000000) + 1000000
  return `SPK-${num}`
}
