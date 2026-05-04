import { useEffect } from 'react'
import { useApp }  from '../../context/AppContext'

export function Toast() {
  const { state, dispatch } = useApp()
  const { toast } = state

  useEffect(() => {
    if (!toast.visible) return
    const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
    return () => clearTimeout(t)
  }, [toast.visible, dispatch])

  if (!toast.visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-text-primary text-white rounded-xl shadow-modal text-sm font-medium max-w-sm">
        <span className="material-symbols-rounded text-success shrink-0" style={{ fontSize: 18 }}>check_circle</span>
        {toast.message}
        <button
          onClick={() => dispatch({ type: 'HIDE_TOAST' })}
          className="ml-1 text-white/60 hover:text-white transition-colors shrink-0"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
        </button>
      </div>
    </div>
  )
}
