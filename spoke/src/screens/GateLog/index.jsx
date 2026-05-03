import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, listContainer, listItem, toastVariants } from '../../utils/motion'
import { GATE_LOG } from '../../data/gateLogData'
import { useApp } from '../../context/AppContext'
import { Sidebar } from '../../components/layout/Sidebar'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { timeAgo, formatTimestamp } from '../../utils/timeAgo'

const TYPE_META = {
  package:  { icon: 'inventory_2',   color: '#6366F1', label: 'Package'  },
  guest:    { icon: 'person',         color: '#10B981', label: 'Guest'    },
  delivery: { icon: 'local_shipping', color: '#F59E0B', label: 'Delivery' },
  vehicle:  { icon: 'directions_car', color: '#14B8A6', label: 'Vehicle'  },
}

const STATUS_COLOR = {
  'Arrived':    'text-ok',
  'Signed in':  'text-primary',
  'Signed out': 'text-ts',
  'Picked up':  'text-ts',
  'Logged':     'text-warn',
}

const EMPTY_FORM = { type: 'package', description: '', unit: '', note: '' }

export default function GateLog() {
  const { dispatch } = useApp()
  const [filter, setFilter]     = useState('All')
  const [entries, setEntries]   = useState(GATE_LOG)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)

  function showToast(msg) { dispatch({ type: 'SHOW_TOAST', payload: msg }) }

  function handleAdd(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.unit.trim()) return
    const entry = {
      id: `g${Date.now()}`,
      type: form.type,
      description: form.description,
      unit: form.unit,
      note: form.note,
      createdAt: new Date().toISOString(),
      status: form.type === 'guest' ? 'Signed in' : form.type === 'vehicle' ? 'Logged' : 'Arrived',
    }
    setEntries(prev => [entry, ...prev])
    setForm(EMPTY_FORM)
    setShowForm(false)
    showToast('Gate entry logged')
  }

  const FILTERS = ['All', 'Package', 'Guest', 'Delivery', 'Vehicle']

  const filtered = entries.filter(e =>
    filter === 'All' ? true : e.type === filter.toLowerCase()
  )

  const todayCount   = entries.filter(e => Date.now() - new Date(e.createdAt).getTime() < 86400000).length
  const guestCount   = entries.filter(e => e.type === 'guest').length
  const packageCount = entries.filter(e => e.type === 'package').length

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="min-h-screen bg-bg">
      <Sidebar />
      <div className="md:hidden"><TopBar title="Gate Log" backTo="/board" /></div>

      <main className="md:ml-60 pb-20 md:pb-8">
        <div className="px-4 md:px-8 py-5 md:py-8 max-w-3xl">
          {/* Header */}
          <div className="hidden md:flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display font-bold text-2xl text-tp">Gate Log</h1>
              <p className="text-sm text-ts mt-1">{todayCount} entries today</p>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Log Entry
            </button>
          </div>

          {/* Mobile add button */}
          <div className="flex md:hidden justify-end mb-4">
            <button
              onClick={() => setShowForm(v => !v)}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-sm font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
              Log Entry
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Today's Entries", value: todayCount,   color: '#6366F1', icon: 'today'      },
              { label: 'Guests',          value: guestCount,   color: '#10B981', icon: 'person'     },
              { label: 'Packages',        value: packageCount, color: '#F59E0B', icon: 'inventory_2' },
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

          {/* Add entry form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                onSubmit={handleAdd}
                className="bg-surface border border-primary/30 rounded-2xl p-4 mb-5 overflow-hidden"
              >
                <p className="text-sm font-semibold text-tp mb-3">Log new entry</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-tm mb-1 block">Type</label>
                    <select
                      value={form.type}
                      onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-bg border border-bdr rounded-xl px-3 py-2 text-sm text-tp focus:outline-none focus:border-primary"
                    >
                      <option value="package">Package</option>
                      <option value="guest">Guest</option>
                      <option value="delivery">Delivery</option>
                      <option value="vehicle">Vehicle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-tm mb-1 block">Unit</label>
                    <input
                      value={form.unit}
                      onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                      placeholder="e.g. 4B"
                      required
                      className="w-full bg-bg border border-bdr rounded-xl px-3 py-2 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-tm mb-1 block">Description</label>
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Amazon package, Guest: John Smith"
                    required
                    className="w-full bg-bg border border-bdr rounded-xl px-3 py-2 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="text-xs text-tm mb-1 block">Note (optional)</label>
                  <input
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="e.g. Left at front desk"
                    className="w-full bg-bg border border-bdr rounded-xl px-3 py-2 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors">
                    Log Entry
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-surface-raised border border-bdr text-ts rounded-xl text-sm hover:text-tp transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filters */}
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  filter === f ? 'bg-primary text-white' : 'bg-surface border border-bdr text-ts hover:text-tp',
                ].join(' ')}
              >
                {f !== 'All' && (
                  <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                    {TYPE_META[f.toLowerCase()]?.icon}
                  </span>
                )}
                {f}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <motion.div
            key={filter}
            variants={listContainer}
            initial="initial"
            animate="animate"
            className="bg-surface border border-bdr rounded-2xl divide-y divide-bdr"
          >
            {filtered.map(entry => {
              const meta = TYPE_META[entry.type] ?? TYPE_META.package
              const statusColor = STATUS_COLOR[entry.status] ?? 'text-ts'
              return (
                <motion.div key={entry.id} variants={listItem} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: meta.color + '1A' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: meta.color }}>{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tp">{entry.description}</p>
                    <p className="text-xs text-tm mt-0.5">
                      Unit {entry.unit}
                      {entry.note ? ` · ${entry.note}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-medium ${statusColor}`}>{entry.status}</p>
                    <p className="text-xs text-tm mt-0.5">{timeAgo(entry.createdAt)}</p>
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
