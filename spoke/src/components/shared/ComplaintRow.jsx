import { motion } from 'framer-motion'
import { listItem } from '../../utils/motion'
import { StatusBadge, PriorityDot } from '../ui/Badge'
import { statusClasses } from '../../utils/formatters'
import { timeAgo } from '../../utils/timeAgo'

export function ComplaintRow({ complaint, showStatusSelect = false, onStatusChange }) {
  const { label: _l, selectBg, selectText, selectBorder } = statusClasses(complaint.status)

  return (
    <motion.div
      variants={listItem}
      className="flex items-start gap-3 p-4 rounded-xl hover:bg-surface-raised transition-colors duration-150"
    >
      {/* Category icon circle */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: complaint.color + '1A', border: `1px solid ${complaint.color}33` }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 16, color: complaint.color }}
        >
          {complaint.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-tp truncate">{complaint.category}</p>
            <p className="text-xs text-tm mt-0.5 truncate">{complaint.resident} · Unit {complaint.unit}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {showStatusSelect ? (
              <select
                value={complaint.status}
                onChange={e => onStatusChange?.(complaint.id, e.target.value)}
                aria-label="Update complaint status"
                style={{
                  background: selectBg,
                  color: selectText,
                  borderColor: selectBorder,
                }}
                className="text-xs rounded-lg px-2 py-1 border font-medium cursor-pointer outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            ) : (
              <StatusBadge status={complaint.status} />
            )}
            <span className="text-xs text-tm">{timeAgo(complaint.createdAt)}</span>
          </div>
        </div>

        <p className="text-xs text-ts mt-1.5 line-clamp-2">{complaint.transcript}</p>

        <div className="flex items-center gap-2 mt-2">
          <PriorityDot priority={complaint.priority} />
          <span className="text-xs text-tm">{complaint.priority} priority</span>
        </div>
      </div>
    </motion.div>
  )
}
