import { useState } from 'react'
import { motion } from 'framer-motion'
import { listContainer } from '../../utils/motion'
import { useComplaints } from '../../hooks/useComplaints'
import { ComplaintRow } from '../../components/shared/ComplaintRow'

const FILTERS = ['All', 'Pending', 'In Progress', 'Resolved']

export function ComplaintsFeed() {
  const [activeFilter, setActiveFilter] = useState('All')
  const { complaints, updateStatus } = useComplaints()

  const filtered = activeFilter === 'All'
    ? complaints
    : complaints.filter(c => c.status === activeFilter)

  return (
    <div className="bg-surface border border-bdr rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bdr">
        <div>
          <h3 className="font-display font-semibold text-tp text-sm">Live Complaints</h3>
          <p className="text-xs text-tm mt-0.5">Tap status to update</p>
        </div>
        <span className="text-xs font-mono text-ts">{filtered.length} shown</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-bdr overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={[
              'flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150',
              activeFilter === f
                ? 'bg-primary text-white'
                : 'text-ts hover:text-tp hover:bg-surface-raised',
            ].join(' ')}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <motion.div
        key={activeFilter}
        variants={listContainer}
        initial="initial"
        animate="animate"
        className="divide-y divide-bdr max-h-[600px] overflow-y-auto"
      >
        {filtered.length === 0 ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-tm" style={{ fontSize: 32 }}>inbox</span>
            <p className="text-sm text-ts mt-2">No {activeFilter.toLowerCase()} complaints</p>
          </div>
        ) : (
          filtered.map(c => (
            <ComplaintRow
              key={c.id}
              complaint={c}
              showStatusSelect={true}
              onStatusChange={updateStatus}
            />
          ))
        )}
      </motion.div>
    </div>
  )
}
