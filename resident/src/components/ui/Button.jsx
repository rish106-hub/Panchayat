'use client'

const VARIANTS = {
  primary:      'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary:    'bg-surface border border-border text-text-primary hover:bg-surface-2',
  ghost:        'text-text-secondary hover:bg-surface-2',
  danger:       'bg-danger text-white hover:bg-danger/90',
  'danger-ghost': 'text-danger hover:bg-danger/10',
  success:      'bg-success text-white hover:bg-success/90',
}

export function Button({ children, variant = 'primary', fullWidth, loading, size, className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  const sz   = size === 'sm' ? 'h-8 px-3 text-xs' : 'h-10 px-4 text-sm'
  return (
    <button
      className={[base, sz, VARIANTS[variant] ?? VARIANTS.primary, fullWidth ? 'w-full' : '', className].join(' ')}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />}
      {children}
    </button>
  )
}
