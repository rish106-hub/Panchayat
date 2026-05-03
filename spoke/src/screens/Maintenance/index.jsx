import { useState } from 'react'
import { motion } from 'framer-motion'
import { pageVariants, listContainer, listItem } from '../../utils/motion'
import { RESIDENTS, DUES_AMOUNT } from '../../data/residentsData'
import { useApp } from '../../context/AppContext'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']

function buildDuesState() {
  return Object.fromEntries(RESIDENTS.map(r => [r.id, r.dues]))
}

export default function Maintenance() {
  const { dispatch } = useApp()
  const [duesState, setDuesState] = useState(buildDuesState)
  const [filter, setFilter] = useState('All')

  function showToast(msg) { dispatch({ type: 'SHOW_TOAST', payload: msg }) }

  function markPaid(resident) {
    setDuesState(prev => ({ ...prev, [resident.id]: 'paid' }))
    showToast(`Unit ${resident.unit} marked as paid`)
  }

  function sendReminder(resident) {
    showToast(`Payment reminder sent to Unit ${resident.unit}`)
  }

  const totalCollected = Object.values(duesState).filter(s => s === 'paid').length * DUES_AMOUNT
  const totalOverdue   = Object.values(duesState).filter(s => s === 'overdue').length * DUES_AMOUNT
  const totalPending   = Object.values(duesState).filter(s => s === 'pending').length * DUES_AMOUNT

  const filtered = RESIDENTS.filter(r => {
    if (filter === 'All') return true
    if (filter === 'Paid')    return duesState[r.id] === 'paid'
    if (filter === 'Overdue') return duesState[r.id] === 'overdue'
    if (filter === 'Pending') return duesState[r.id] === 'pending'
    return true
  })

  const STATUS = {
    paid:    { label: 'Paid',    bg: 'bg-ok/10',   text: 'text-ok',   border: 'border-ok/30'   },
    overdue: { label: 'Overdue', bg: 'bg-err/10',  text: 'text-err',  border: 'border-err/30'  },
    pending: { label: 'Pending', bg: 'bg-warn/10', text: 'text-warn', border: 'border-warn/30' },
  }

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:hidden"><TopBar title="Maintenance" backTo="/board" /></div>

      <main className="md:ml-60 pb-20 md:pb-8">
        <div className="px-4 md:px-8 py-5 md:py-8 max-w-4xl">
          <div className="hidden md:block mb-6">
            <h1 className="font-display font-bold text-2xl text-tp">Maintenance Dues</h1>
            <p className="text-sm text-ts mt-1">May 2025 · ${DUES_AMOUNT}/unit</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Collected',   value: `$${totalCollected.toLocaleString()}`,  color: '#10B981', icon: 'check_circle'          },
              { label: 'Overdue',     value: `$${totalOverdue.toLocaleString()}`,     color: '#EF4444', icon: 'warning'               },
              { label: 'Not Joined',  value: `$${totalPending.toLocaleString()}`,     color: '#F59E0B', icon: 'hourglass_empty'        },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-bdr rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-tm uppercase tracking-wide">{s.label}</p>
                    <p className="text-xl font-display font-bold text-tp mt-1">{s.value}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '1A' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Monthly trend (sparkline-style) */}
          <div className="bg-surface border border-bdr rounded-2xl p-4 mb-5">
            <p className="text-xs text-tm uppercase tracking-wide mb-3">Collection History</p>
            <div className="flex items-end gap-3">
              {[88, 91, 85, 93, 89, Math.round((totalCollected / (RESIDENTS.length * DUES_AMOUNT)) * 100)].map((pct, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-tm">{pct}%</span>
                  <div className="w-full rounded-t-md bg-primary/20" style={{ height: 48 }}>
                    <div className="w-full rounded-t-md bg-primary transition-all" style={{ height: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-tm">{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-4">
            {['All', 'Paid', 'Overdue', 'Pending'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filter === f ? 'bg-primary text-white' : 'bg-surface border border-bdr text-ts hover:text-tp',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Dues table */}
          <motion.div
            key={filter}
            variants={listContainer}
            initial="initial"
            animate="animate"
            className="bg-surface border border-bdr rounded-2xl divide-y divide-bdr"
          >
            {filtered.map(r => {
              const status = duesState[r.id]
              const s = STATUS[status]
              return (
                <motion.div key={r.id} variants={listItem} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tp">{r.name}</p>
                    <p className="text-xs text-tm">Unit {r.unit}</p>
                  </div>
                  <span className="font-mono text-sm text-ts">${DUES_AMOUNT}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${s.bg} ${s.text} ${s.border}`}>
                    {s.label}
                  </span>
                  <div className="flex gap-1.5">
                    {status !== 'paid' && (
                      <button
                        onClick={() => markPaid(r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-ok/10 text-ok border border-ok/30 hover:bg-ok/20 transition-colors"
                      >
                        Mark paid
                      </button>
                    )}
                    {status === 'overdue' && (
                      <button
                        onClick={() => sendReminder(r)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-raised text-ts border border-bdr hover:text-tp transition-colors"
                      >
                        Remind
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </main>

      <div className="md:hidden"><BottomNav /></div>
    </motion.div>
  )
}
