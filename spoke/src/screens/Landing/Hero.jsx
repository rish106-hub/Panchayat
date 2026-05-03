import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeUp, listContainer, listItem } from '../../utils/motion'
import { MicButton } from '../../components/ui/MicButton'
import { Button } from '../../components/ui/Button'

export function Hero() {
  const navigate = useNavigate()

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%), #080D1A',
      }}
    >
      {/* Background glow blob */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)' }}
      />

      <motion.div
        variants={listContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        {/* Badge chip */}
        <motion.div variants={listItem} className="inline-flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-bdr text-xs text-ts font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-ok animate-pulse-dot" />
            Live demo — no signup needed
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          variants={listItem}
          className="font-display font-bold text-4xl md:text-6xl text-tp leading-tight tracking-tight mb-6"
        >
          Your voice runs the{' '}
          <span className="text-primary">building</span> now.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={listItem}
          className="text-base md:text-lg text-ts leading-relaxed mb-10 max-w-xl mx-auto"
        >
          File complaints, search HOA rules, and manage your community — all by speaking.
          No forms. No emails. Just your voice.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={listItem} className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Button size="lg" onClick={() => navigate('/home')}>
            Try as Resident
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/board')}>
            View Board Dashboard
          </Button>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          variants={listItem}
          className="relative mx-auto max-w-xs"
        >
          {/* Purple glow behind card */}
          <div
            className="absolute inset-0 rounded-3xl blur-3xl"
            style={{ background: 'rgba(99,102,241,0.18)', transform: 'scale(0.85) translateY(8%)' }}
          />
          <div className="relative bg-surface border border-bdr rounded-3xl p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-voice animate-pulse-dot" />
              <span className="text-xs text-voice font-medium font-mono">Live Recording</span>
            </div>
            <div className="flex justify-center mb-4">
              <MicButton isRecording={true} size="sm" onClick={() => {}} />
            </div>
            <p className="text-xs text-ts italic text-center mb-4">
              "The hot water has been out since Tuesday morning in unit 4B…"
            </p>
            {/* Waveform bars */}
            <div className="flex items-end justify-center gap-1 h-8">
              {[0.3, 0.7, 1, 0.5, 0.9, 0.4, 0.8, 0.6].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-primary/60 rounded-full animate-wavebar"
                  style={{
                    height: `${h * 28}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Floating badges (desktop only) */}
          <div className="hidden md:block absolute -left-32 top-8">
            <div className="flex items-center gap-2 bg-surface border border-bdr rounded-xl px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-voice animate-pulse-dot" />
              <span className="text-xs text-ts">Transcribing…</span>
            </div>
          </div>
          <div className="hidden md:block absolute -right-36 top-16">
            <div className="flex items-center gap-2 bg-surface border border-ok/40 rounded-xl px-3 py-2">
              <span className="material-symbols-outlined text-ok icon-filled" style={{ fontSize: 14 }}>
                check_circle
              </span>
              <span className="text-xs text-ok font-medium">Complaint Created</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
