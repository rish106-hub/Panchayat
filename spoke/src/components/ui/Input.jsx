export function Input({
  label, hint, error, icon, trailing,
  className = '', ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted select-none"
            style={{ fontSize: 18 }}>
            {icon}
          </span>
        )}
        <input
          {...props}
          className={[
            'w-full h-9 rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-muted',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-0 focus:border-brand-600',
            error ? 'border-danger focus:ring-danger' : 'border-border hover:border-border-strong',
            icon     ? 'pl-9'  : 'pl-3',
            trailing ? 'pr-10' : 'pr-3',
            className,
          ].join(' ')}
        />
        {trailing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>
        )}
      </div>
      {error  && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, hint, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <textarea
        {...props}
        className={[
          'w-full rounded-lg border bg-surface text-sm text-text-primary placeholder:text-text-muted resize-none',
          'px-3 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600',
          error ? 'border-danger' : 'border-border hover:border-border-strong',
          className,
        ].join(' ')}
      />
      {error  && <p className="text-xs text-danger">{error}</p>}
      {!error && hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
