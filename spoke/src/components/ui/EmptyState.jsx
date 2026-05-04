import { Button } from './Button'

export function EmptyState({ icon = 'inbox', title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
        <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      {action && actionLabel && (
        <div className="mt-5">
          <Button size="sm" onClick={action}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
