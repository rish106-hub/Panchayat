export function Card({ children, className = '', hoverable = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-surface border border-bdr rounded-2xl',
        hoverable ? 'hover:border-primary/40 transition-colors duration-150 cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
