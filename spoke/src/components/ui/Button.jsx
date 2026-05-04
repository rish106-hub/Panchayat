const VARIANTS = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-2 active:bg-border shadow-sm',
  ghost: 'text-text-secondary hover:bg-surface-2 hover:text-text-primary active:bg-border',
  danger: 'bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  'danger-ghost': 'text-danger hover:bg-danger/8 active:bg-danger/15',
}
const SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
}

export function Button({
  children, variant = 'primary', size = 'md',
  fullWidth, disabled, loading, type = 'button',
  onClick, className = '',
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 select-none',
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size]    ?? SIZES.md,
        fullWidth  ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
