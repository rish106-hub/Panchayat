import { motion } from 'framer-motion'

export function StatCard({ label, value, icon, color = '#6366F1', subtitle }) {
  return (
    <motion.div
      className="bg-surface border border-bdr rounded-2xl p-4"
      whileHover={{ borderColor: color + '55' }}
      transition={{ duration: 0.15 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-tm font-medium uppercase tracking-wide">{label}</p>
          <motion.p
            key={value}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-display font-bold text-tp mt-1"
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-ts mt-0.5">{subtitle}</p>}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: color + '1A' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
        </div>
      </div>
    </motion.div>
  )
}
