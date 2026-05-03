import { motion } from 'framer-motion'
import { listContainer, listItem } from '../../utils/motion'

const FEATURES = [
  {
    icon: 'record_voice_over',
    color: '#FF6B6B',
    title: 'Voice-first complaints',
    body: 'Speak your issue and Panchayat transcribes, classifies, and routes it automatically. No typing, no forms.',
  },
  {
    icon: 'auto_awesome',
    color: '#6366F1',
    title: 'Smart rulebook search',
    body: 'Ask questions in plain English. Panchayat finds the relevant HOA rule and surfaces the answer instantly.',
  },
  {
    icon: 'dashboard',
    color: '#10B981',
    title: 'Board command center',
    body: 'Live complaint feed, real-time status updates, gate activity, and maintenance dues — all in one place.',
  },
]

export function Features() {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="text-center mb-12"
      >
        <p className="text-xs font-medium text-ts uppercase tracking-widest mb-3">Features</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-tp">Built for how people actually live</h2>
      </motion.div>

      <motion.div
        variants={listContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={listItem}
            className="bg-surface border border-bdr rounded-2xl p-6 hover:border-primary/30 transition-colors duration-200"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: f.color + '1A' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: f.color }}>{f.icon}</span>
            </div>
            <h3 className="font-display font-semibold text-tp text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-ts leading-relaxed">{f.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
