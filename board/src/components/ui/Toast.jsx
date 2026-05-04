'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false })

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      {toast.visible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
          <div className={[
            'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-modal text-sm font-medium max-w-sm',
            toast.type === 'error' ? 'bg-danger text-white' : 'bg-text-primary text-white',
          ].join(' ')}>
            <span className="material-symbols-rounded shrink-0" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
            {toast.message}
            <button onClick={() => setToast(t => ({ ...t, visible: false }))} className="ml-1 text-white/60 hover:text-white">
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>close</span>
            </button>
          </div>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be inside ToastProvider')
  return ctx
}
