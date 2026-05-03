import { motion } from 'framer-motion'
import { listContainer, listItem } from '../../utils/motion'

const STEPS = [
  {
    n: '1',
    icon: 'upload_file',
    title: 'Upload your rulebook',
    body: 'Board uploads the HOA rulebook PDF. Spoke indexes it so residents can search by voice.',
  },
  {
    n: '2',
    icon: 'group_add',
    title: 'Residents join',
    body: 'Each resident gets a unit profile. No passwords — just scan the QR code in the lobby.',
  },
  {
    n: '3',
    icon: 'spatial_audio',
    title: 'Everyone speaks',
    body: 'Issues get filed, rules get answered, and the board sees everything in real time.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
        className="text-center mb-14"
      >
        <p className="text-xs font-medium text-ts uppercase tracking-widest mb-3">How it works</p>
        <h2 className="font-display font-bold text-3xl md:text-4xl text-tp">Up and running in 3 steps</h2>
      </motion.div>

      <motion.div
        variants={listContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0"
      >
        {/* Dashed connector (desktop) */}
        <div className="hidden md:block absolute top-9 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-bdr" />

        {STEPS.map((step) => (
          <motion.div
            key={step.n}
            variants={listItem}
            className="relative flex-1 flex flex-col items-center text-center px-4"
          >
            <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-4 shadow-lg">
              <span className="material-symbols-outlined text-white icon-filled" style={{ fontSize: 24 }}>
                {step.icon}
              </span>
            </div>
            <span className="absolute top-0 right-1/2 translate-x-8 -translate-y-1 text-xs font-mono font-bold text-primary/60">
              0{step.n}
            </span>
            <h3 className="font-display font-semibold text-tp text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-ts leading-relaxed max-w-[200px]">{step.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
