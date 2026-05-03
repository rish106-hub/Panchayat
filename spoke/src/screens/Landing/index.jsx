import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants } from '../../utils/motion'
import { Button } from '../../components/ui/Button'
import { Hero } from './Hero'
import { Features } from './Features'
import { HowItWorks } from './HowItWorks'
import { CTASection } from './CTASection'

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg"
    >
      {/* Header */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 transition-all duration-200',
          scrolled ? 'bg-surface/90 backdrop-blur border-b border-bdr' : 'bg-transparent',
        ].join(' ')}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 22 }}>
            spatial_audio
          </span>
          <span className="font-display font-bold text-tp text-lg">Spoke</span>
        </div>

        {/* Desktop center nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-ts">
          <a href="#features" className="hover:text-tp transition-colors">Features</a>
          <a href="#howitworks" className="hover:text-tp transition-colors">How it works</a>
        </nav>

        {/* Right CTAs */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/board')}>
            Board login
          </Button>
          <Button size="sm" onClick={() => navigate('/home')}>
            Try as Resident
          </Button>
        </div>
      </header>

      {/* Screens */}
      <main>
        <div id="hero"><Hero /></div>
        <div id="features"><Features /></div>
        <div id="howitworks"><HowItWorks /></div>
        <CTASection />
      </main>
    </motion.div>
  )
}
