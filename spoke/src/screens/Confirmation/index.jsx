import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants, checkSpring, listContainer, listItem } from '../../utils/motion'
import { useApp } from '../../context/AppContext'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { formatTimestamp } from '../../utils/timeAgo'

export default function Confirmation() {
  const navigate = useNavigate()
  const { state } = useApp()
  const complaint = state.currentComplaint

  if (!complaint) {
    return <Navigate to="/home" replace />
  }

  const rows = [
    { label: 'ID',       value: <span className="font-mono text-xs text-tp">{complaint.id}</span> },
    {
      label: 'Category',
      value: (
        <span className="flex items-center gap-1.5 text-sm" style={{ color: complaint.color }}>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{complaint.icon}</span>
          {complaint.category}
        </span>
      ),
    },
    { label: 'Priority', value: <PriorityBadge priority={complaint.priority} /> },
    { label: 'Filed',    value: <span className="text-xs text-ts">{formatTimestamp(complaint.createdAt)}</span> },
    { label: 'Status',   value: <StatusBadge status={complaint.status} /> },
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg flex flex-col pb-20 md:pb-8"
    >
      <TopBar title="Complaint Filed" />

      <div className="max-w-[430px] mx-auto w-full px-4 py-8 flex flex-col items-center gap-6">

        {/* Success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={checkSpring}
          className="w-20 h-20 rounded-full border-2 border-ok/40 bg-ok/10 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-ok icon-filled" style={{ fontSize: 40 }}>
            check_circle
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.25 }}
          className="text-center"
        >
          <h2 className="font-display font-bold text-2xl text-tp">Your complaint is in the queue.</h2>
          <p className="text-sm text-ts mt-2 leading-relaxed">
            The board has been notified. You'll receive updates as your complaint is processed.
          </p>
        </motion.div>

        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.25 }}
          className="w-full bg-surface border border-bdr rounded-2xl divide-y divide-bdr"
        >
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-tm font-medium">{label}</span>
              {value}
            </div>
          ))}
        </motion.div>

        {/* Transcript preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.25 }}
          className="w-full"
        >
          <p className="text-xs font-medium text-tm uppercase tracking-wider mb-2">What you said</p>
          <div className="bg-surface-raised border border-bdr rounded-xl p-4">
            <p className="text-sm text-ts leading-relaxed line-clamp-3">{complaint.transcript}</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full space-y-2"
        >
          <Button fullWidth size="lg" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18 }}>home</span>
            Back to home
          </Button>
          <Button fullWidth variant="ghost" onClick={() => navigate('/board')}>
            View on board dashboard
          </Button>
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
