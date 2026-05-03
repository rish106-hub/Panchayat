import { statusClasses, priorityClasses } from '../../utils/formatters'

export function StatusBadge({ status }) {
  const { label, bg, text, border } = statusClasses(status)
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${bg} ${text} ${border}`}
    >
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const { label, dotClass, textClass } = priorityClasses(priority)
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  )
}

export function PriorityDot({ priority }) {
  const { dotClass } = priorityClasses(priority)
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`} />
}
