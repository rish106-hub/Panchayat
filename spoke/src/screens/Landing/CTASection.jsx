import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'

export function CTASection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl mx-auto bg-surface border border-bdr rounded-3xl p-10 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 28 }}>
            spatial_audio
          </span>
        </div>
        <h2 className="font-display font-bold text-3xl text-tp mb-3">
          Ready to give your community a voice?
        </h2>
        <p className="text-ts mb-8 leading-relaxed">
          No credit card. No setup fees. Start in under a minute.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate('/home')}>
            Try as Resident
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/board')}>
            View Board Dashboard
          </Button>
        </div>
      </motion.div>

      <footer className="mt-16 text-center text-xs text-tm space-x-4">
        <span>© 2026 Panchayat</span>
        <a href="#" className="hover:text-ts transition-colors">Privacy</a>
        <a href="#" className="hover:text-ts transition-colors">Terms</a>
        <a href="#" className="hover:text-ts transition-colors">Contact</a>
      </footer>
    </section>
  )
}
