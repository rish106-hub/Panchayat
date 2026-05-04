import { useNavigate } from 'react-router-dom'
import { useAuth }     from '../../context/AuthContext'
import { Button }      from '../../components/ui/Button'

const FEATURES = [
  {
    icon: 'keyboard_voice',
    title: 'Voice-powered complaints',
    desc: 'Tap, speak, done. AI classifies your issue and routes it to the right team — no forms needed.',
    color: '#4F46E5',
  },
  {
    icon: 'dashboard',
    title: 'Live board dashboard',
    desc: 'Real-time complaint tracking, dues management, gate log, and resident directory in one view.',
    color: '#0284C7',
  },
  {
    icon: 'account_balance_wallet',
    title: 'Dues & payment tracking',
    desc: 'Track monthly HOA dues, send reminders, mark payments, and generate receipts automatically.',
    color: '#059669',
  },
  {
    icon: 'door_front',
    title: 'Gate activity log',
    desc: 'Log visitors, packages, and deliveries. Residents see their own activity in real time.',
    color: '#D97706',
  },
  {
    icon: 'menu_book',
    title: 'Smart rulebook search',
    desc: 'Ask HOA rules in plain English. AI finds the exact section — no more PDF hunting.',
    color: '#7C3AED',
  },
  {
    icon: 'campaign',
    title: 'Instant notices',
    desc: "Board members can blast notices to all residents or specific units in seconds.",
    color: '#DC2626',
  },
]

const TESTIMONIALS = [
  {
    quote: "Spoke cut our complaint resolution time by 60%. Residents love the voice feature — even our older members use it.",
    author: 'Sarah M.',
    role: 'HOA Board President, Sunridge Estates',
    avatar: 'SM',
  },
  {
    quote: "Finally, a tool built for HOAs that doesn't look like it was designed in 2008. Clean, fast, just works.",
    author: 'David K.',
    role: 'Property Manager, The Pines',
    avatar: 'DK',
  },
  {
    quote: "I filed a noise complaint in 30 seconds from my phone while it was happening. Board responded within the hour.",
    author: 'Priya R.',
    role: 'Resident, Harbor View',
    avatar: 'PR',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const { IS_DEMO, switchDemoRole } = useAuth()

  function tryDemo(role) {
    switchDemoRole(role)
    navigate('/dashboard')
  }

  function goToLogin() {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <span className="material-symbols-rounded text-white" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>spatial_audio</span>
            </div>
            <span className="text-sm font-semibold text-text-primary">Spoke</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#features"     className="hover:text-text-primary transition-colors">Features</a>
            <a href="#how"          className="hover:text-text-primary transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-text-primary transition-colors">Reviews</a>
          </nav>

          <div className="flex items-center gap-2">
            {IS_DEMO ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => tryDemo('board')}>Board demo</Button>
                <Button size="sm" onClick={() => tryDemo('resident')}>Resident demo</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={goToLogin}>Sign in</Button>
                <Button size="sm" onClick={goToLogin}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-medium text-brand-700 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Live demo — no signup required
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary leading-tight tracking-tight mb-5">
          HOA management that<br className="hidden sm:block" />
          <span className="text-brand-600"> works for everyone</span>
        </h1>

        <p className="text-lg text-text-secondary leading-relaxed mb-10 max-w-xl mx-auto">
          Residents file complaints by voice. Boards get a real-time ops dashboard.
          No paperwork. No email chains. Just results.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          {IS_DEMO ? (
            <>
              <Button size="lg" onClick={() => tryDemo('resident')}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_voice</span>
                Try as Resident
              </Button>
              <Button variant="secondary" size="lg" onClick={() => tryDemo('board')}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>dashboard</span>
                View Board Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" onClick={goToLogin}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_forward</span>
                Get started free
              </Button>
              <Button variant="secondary" size="lg" onClick={() => { tryDemo('resident') }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_voice</span>
                Live demo
              </Button>
            </>
          )}
        </div>

        {/* Dashboard preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-canvas z-10 bottom-0 h-16 rounded-b-2xl pointer-events-none" />
          <div className="bg-surface border border-border rounded-2xl shadow-card-md overflow-hidden">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
              </div>
              <div className="flex-1 mx-4 h-6 bg-border rounded-md flex items-center px-3">
                <span className="text-xs text-text-muted">spoke.app/dashboard</span>
              </div>
            </div>
            {/* Mini dashboard preview */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {[
                { label: 'Open Complaints', val: '7', icon: 'inbox', color: '#4F46E5' },
                { label: 'Resolved Today',  val: '3', icon: 'check_circle', color: '#059669' },
                { label: 'Dues Collected',  val: '$3,840', icon: 'account_balance_wallet', color: '#0284C7' },
                { label: 'Gate Activity',   val: '12', icon: 'door_front', color: '#D97706' },
              ].map(s => (
                <div key={s.label} className="bg-canvas border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xs text-text-muted uppercase tracking-wide">{s.label}</span>
                    <span className="material-symbols-rounded" style={{ fontSize: 14, color: s.color }}>{s.icon}</span>
                  </div>
                  <p className="text-lg font-semibold text-text-primary">{s.val}</p>
                </div>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="bg-canvas border border-border rounded-xl overflow-hidden">
                <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-medium text-text-secondary">Recent Complaints</span>
                  <span className="text-2xs text-text-muted">7 open</span>
                </div>
                {[
                  { unit: '3A', cat: 'Plumbing',   status: 'In Progress', time: '2h ago',  prio: 'High' },
                  { unit: '7C', cat: 'Elevator',   status: 'Pending',     time: '18h ago', prio: 'High' },
                  { unit: '4B', cat: 'Noise',      status: 'Resolved',    time: '3d ago',  prio: 'Medium' },
                ].map((r, i) => (
                  <div key={i} className="px-3 py-2.5 flex items-center gap-3 text-xs border-b border-border last:border-0">
                    <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 font-medium text-2xs shrink-0">{r.unit}</div>
                    <span className="flex-1 text-text-secondary">{r.cat}</span>
                    <span className={[
                      'px-2 py-0.5 rounded-full text-2xs font-medium',
                      r.status === 'In Progress' ? 'bg-info/10 text-info' :
                      r.status === 'Pending' ? 'bg-warning/10 text-warning-text' :
                      'bg-success/10 text-success-text',
                    ].join(' ')}>{r.status}</span>
                    <span className="text-text-muted">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Everything your HOA needs</h2>
            <p className="text-text-secondary max-w-md mx-auto">Purpose-built for US homeowners associations and residential communities.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-canvas border border-border rounded-xl p-5 hover:border-border-strong hover:shadow-card-md transition-all duration-200">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: f.color + '15' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 20, color: f.color }}>{f.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Up and running in minutes</h2>
          <p className="text-text-secondary mb-12">No lengthy onboarding. No training sessions. Your HOA is live today.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up with email, join your HOA, and you\'re in. Takes under 2 minutes.' },
              { step: '02', title: 'Speak or type', desc: 'AI classifies every complaint in under a second and routes it to the right team.' },
              { step: '03', title: 'Board acts instantly', desc: 'Board sees every update live. Status changes, reminders, exports — all in one place.' },
            ].map(s => (
              <div key={s.step} className="relative">
                <div className="text-4xl font-bold text-border mb-3">{s.step}</div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{s.title}</h3>
                <p className="text-sm text-text-secondary">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-text-primary text-center mb-10">Loved by boards and residents</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.author} className="bg-canvas border border-border rounded-xl p-5">
                <p className="text-sm text-text-secondary leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-brand-700">{t.avatar}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{t.author}</p>
                    <p className="text-2xs text-text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-3">Ready to modernize your HOA?</h2>
          <p className="text-text-secondary mb-8">
            {IS_DEMO ? 'Try the full demo — no account needed. Experience both the resident and board sides.' : 'Get started in 2 minutes. Or try the live demo first — no account needed.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {IS_DEMO ? (
              <>
                <Button size="lg" onClick={() => tryDemo('resident')}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_voice</span>
                  Try as Resident
                </Button>
                <Button variant="secondary" size="lg" onClick={() => tryDemo('board')}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>dashboard</span>
                  View Board Demo
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" onClick={goToLogin}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_forward</span>
                  Get started free
                </Button>
                <Button variant="secondary" size="lg" onClick={() => tryDemo('resident')}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_voice</span>
                  Live demo
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-brand-600 flex items-center justify-center">
              <span className="material-symbols-rounded text-white" style={{ fontSize: 11 }}>spatial_audio</span>
            </div>
            <span className="font-medium text-text-secondary">Spoke</span>
          </div>
          <p>© 2026 Spoke. Built for American HOAs.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-text-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-secondary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
