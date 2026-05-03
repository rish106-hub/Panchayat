import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'spoke_demo_guide_seen'

const STEPS = [
  {
    title: 'Start with voice',
    body: 'Tap Report and speak a complaint. Spoke transcribes it and detects the category.',
    cta: 'Open mic',
    path: '/voice',
    icon: 'mic',
  },
  {
    title: 'See operations update',
    body: 'The board dashboard updates with live stats, status controls, dues, and gate activity.',
    cta: 'View board',
    path: '/board',
    icon: 'dashboard',
  },
  {
    title: 'Search the rulebook',
    body: 'Residents can ask plain-English rule questions without digging through a PDF.',
    cta: 'Open rules',
    path: '/rulebook',
    icon: 'menu_book',
  },
]

export function DemoGuide() {
  const navigate = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(null)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const timer = setTimeout(() => setStep(0), 450)
    return () => clearTimeout(timer)
  }, [])

  if (step === null || location.pathname === '/') return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function close() {
    localStorage.setItem(STORAGE_KEY, '1')
    setStep(null)
  }

  return (
    <aside className="fixed left-4 right-4 bottom-20 md:left-auto md:right-6 md:bottom-6 md:w-96 z-50 bg-surface border border-primary/30 rounded-2xl p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 19 }}>{current.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-display font-semibold text-tp">{current.title}</p>
            <span className="text-[11px] text-tm ml-auto">{step + 1}/3</span>
          </div>
          <p className="text-sm text-ts mt-1 leading-relaxed">{current.body}</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => navigate(current.path)}
              className="px-3 py-2 rounded-lg bg-primary hover:bg-primary-h text-white text-xs font-semibold transition-colors"
            >
              {current.cta}
            </button>
            <button
              onClick={() => (isLast ? close() : setStep(s => s + 1))}
              className="px-3 py-2 rounded-lg bg-surface-raised border border-bdr text-ts hover:text-tp text-xs font-semibold transition-colors"
            >
              {isLast ? 'Done' : 'Next'}
            </button>
            <button onClick={close} className="ml-auto px-2 py-2 text-tm hover:text-ts transition-colors" aria-label="Dismiss guide">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
