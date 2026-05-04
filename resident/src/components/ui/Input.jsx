'use client'

const BASE = 'w-full rounded-xl border border-border bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors disabled:opacity-50'

export function Input({ label, as: Tag = 'input', className = '', rows, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-primary">{label}</label>}
      <Tag className={[BASE, Tag === 'textarea' ? 'py-2.5 resize-none' : 'h-10', className].join(' ')} rows={rows} {...props} />
    </div>
  )
}
