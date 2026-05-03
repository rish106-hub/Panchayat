import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { toastVariants } from '../../utils/motion'

export function Toast() {
  const { state, dispatch } = useApp()
  const { message, visible } = state.toast

  useEffect(() => {
    if (!visible) return
    const id = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 3500)
    return () => clearTimeout(id)
  }, [visible, message, dispatch])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={message}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex items-center gap-2.5 bg-surface-raised border border-bdr rounded-xl px-4 py-3 shadow-2xl text-sm text-tp pointer-events-auto whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-ok icon-filled" style={{ fontSize: 16 }}>
              check_circle
            </span>
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
