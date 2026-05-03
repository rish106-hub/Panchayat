const VARIANT_CLASSES = {
  primary: 'bg-primary hover:bg-primary-h text-white border border-transparent',
  ghost:   'bg-transparent hover:bg-surface-raised text-ts border border-bdr',
  danger:  'bg-err/10 hover:bg-err/20 text-err border border-err/30',
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...rest
}) {
  return (
    <button
      className={[
        'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-xl',
        'transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary,
        SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
