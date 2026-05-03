import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

export function TopBar({ title, backTo, rightContent }) {
  const navigate = useNavigate()
  const { state } = useApp()

  return (
    <header className="sticky top-0 z-30 flex items-center h-14 px-4 bg-surface/90 backdrop-blur border-b border-bdr">
      {backTo ? (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-raised transition-colors mr-2"
          aria-label="Go back"
        >
          <span className="material-symbols-outlined text-ts" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
      ) : (
        <div className="w-10" />
      )}

      <span className="flex-1 text-center font-display font-semibold text-sm text-tp">
        {title}
      </span>

      <div className="flex items-center gap-2">
        {rightContent ?? (
          <div
            className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold"
            title={state.user.name}
          >
            {state.user.avatar}
          </div>
        )}
      </div>
    </header>
  )
}
