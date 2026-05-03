export function Input({ className = '', ...rest }) {
  return (
    <input
      className={[
        'w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-tp text-sm',
        'placeholder:text-tm focus:outline-none focus:border-primary',
        'focus:ring-2 focus:ring-primary/20 transition-colors duration-150',
        className,
      ].join(' ')}
      {...rest}
    />
  )
}

export function SearchInput({ icon = 'search', rightIcon, onRightIconClick, className = '', ...rest }) {
  return (
    <div className="relative flex items-center">
      <span className="material-symbols-outlined absolute left-3 text-tm" style={{ fontSize: 18 }}>
        {icon}
      </span>
      <input
        className={[
          'w-full bg-bg border border-bdr rounded-xl pl-10 pr-10 py-3 text-tp text-sm',
          'placeholder:text-tm focus:outline-none focus:border-primary',
          'focus:ring-2 focus:ring-primary/20 transition-colors duration-150',
          className,
        ].join(' ')}
        {...rest}
      />
      {rightIcon && (
        <button
          onClick={onRightIconClick}
          className="absolute right-3 text-voice hover:opacity-80 transition-opacity"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{rightIcon}</span>
        </button>
      )}
    </div>
  )
}
