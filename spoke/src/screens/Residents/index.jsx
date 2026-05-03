import { useState } from 'react'
import { motion } from 'framer-motion'
import { pageVariants, listContainer, listItem } from '../../utils/motion'
import { RESIDENTS, DUES_AMOUNT } from '../../data/residentsData'
import { useApp } from '../../context/AppContext'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { Button } from '../../components/ui/Button'

const FILTERS = ['All', 'Onboarded', 'Pending', 'Overdue']

const DUES_META = {
  paid:    { label: 'Paid',    bg: 'bg-ok/10',      text: 'text-ok',      border: 'border-ok/30'      },
  overdue: { label: 'Overdue', bg: 'bg-err/10',     text: 'text-err',     border: 'border-err/30'     },
  pending: { label: 'Pending', bg: 'bg-warn/10',    text: 'text-warn',    border: 'border-warn/30'    },
}

export default function Residents() {
  const { dispatch } = useApp()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [nudged, setNudged] = useState(new Set())

  function showToast(msg) {
    dispatch({ type: 'SHOW_TOAST', payload: msg })
  }

  function handleNudge(resident) {
    setNudged(prev => new Set([...prev, resident.id]))
    showToast(`Reminder sent to Unit ${resident.unit}`)
  }

  const filtered = RESIDENTS.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        r.unit.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'All'
      ? true
      : filter === 'Onboarded' ? r.onboarded
      : filter === 'Pending'   ? !r.onboarded
      : filter === 'Overdue'   ? r.dues === 'overdue'
      : true
    return matchSearch && matchFilter
  })

  const onboarded = RESIDENTS.filter(r => r.onboarded).length
  const overdue   = RESIDENTS.filter(r => r.dues === 'overdue').length

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:hidden"><TopBar title="Residents" backTo="/board" /></div>

      <main className="md:ml-60 pb-20 md:pb-8">
        <div className="px-4 md:px-8 py-5 md:py-8 max-w-4xl">
          {/* Header */}
          <div className="hidden md:block mb-6">
            <h1 className="font-display font-bold text-2xl text-tp">Residents</h1>
            <p className="text-sm text-ts mt-1">{RESIDENTS.length} units registered</p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total Units',  value: RESIDENTS.length, color: '#6366F1', icon: 'people'              },
              { label: 'Onboarded',    value: onboarded,         color: '#10B981', icon: 'how_to_reg'          },
              { label: 'Dues Overdue', value: overdue,           color: '#EF4444', icon: 'account_balance_wallet' },
            ].map(s => (
              <div key={s.label} className="bg-surface border border-bdr rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-tm uppercase tracking-wide">{s.label}</p>
                    <p className="text-2xl font-display font-bold text-tp mt-1">{s.value}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.color + '1A' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: s.color }}>{s.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tm" style={{ fontSize: 16 }}>search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or unit…"
                className="w-full bg-bg border border-bdr rounded-xl pl-9 pr-4 py-2.5 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-1.5">
              {FILTERS.map(f => (
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
          </div>

          {/* Resident list */}
          <motion.div
            key={filter + search}
            variants={listContainer}
            initial="initial"
            animate="animate"
            className="bg-surface border border-bdr rounded-2xl divide-y divide-bdr"
          >
            {filtered.length === 0 ? (
              <div className="py-10 text-center">
                <span className="material-symbols-outlined text-tm" style={{ fontSize: 32 }}>search_off</span>
                <p className="text-sm text-ts mt-2">No residents match</p>
              </div>
            ) : (
              filtered.map(r => {
                const dues = DUES_META[r.dues]
                return (
                  <motion.div key={r.id} variants={listItem} className="flex items-center gap-3 px-4 py-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                      {r.avatar}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-tp">{r.name}</p>
                      <p className="text-xs text-tm">Unit {r.unit} · {r.phone}</p>
                    </div>
                    {/* Status badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${dues.bg} ${dues.text} ${dues.border}`}>
                        {dues.label}
                      </span>
                      {!r.onboarded && (
                        <span className="text-xs px-2 py-0.5 rounded-md border bg-tm/10 text-tm border-tm/20">
                          Not onboarded
                        </span>
                      )}
                    </div>
                    {/* Action */}
                    {(r.dues === 'overdue' || !r.onboarded) && (
                      <button
                        onClick={() => handleNudge(r)}
                        disabled={nudged.has(r.id)}
                        className={[
                          'flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors',
                          nudged.has(r.id)
                            ? 'text-ok border-ok/30 bg-ok/10'
                            : 'text-ts border-bdr hover:text-tp hover:bg-surface-raised',
                        ].join(' ')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                          {nudged.has(r.id) ? 'check' : 'notifications_active'}
                        </span>
                        {nudged.has(r.id) ? 'Sent' : 'Nudge'}
                      </button>
                    )}
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </div>
      </main>

      <div className="md:hidden"><BottomNav /></div>
    </motion.div>
  )
}
