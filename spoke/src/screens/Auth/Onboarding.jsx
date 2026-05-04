import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageVariants } from '../../utils/motion'
import { useAuth } from '../../context/AuthContext'
import { joinSociety } from '../../api/users'
import { searchSocieties } from '../../api/societies'
import { Button } from '../../components/ui/Button'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()

  const [name,        setName]        = useState(user?.name ?? '')
  const [unit,        setUnit]        = useState('')
  const [role,        setRole]        = useState('resident')
  const [societyId,   setSocietyId]   = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [results,     setResults]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [err,         setErr]         = useState('')

  async function handleSearch(q) {
    setSearchQuery(q)
    if (q.length < 2) { setResults([]); return }
    const { data } = await searchSocieties(q)
    setResults(data ?? [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!societyId) { setErr('Select a society first.'); return }
    if (!unit.trim()) { setErr('Enter your unit number.'); return }
    setErr('')
    setLoading(true)

    const { error } = await joinSociety(user.id, societyId, unit.trim(), role)
    setLoading(false)
    if (error) { setErr(error.message); return }

    await refreshProfile()
    navigate('/home', { replace: true })
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg flex flex-col"
    >
      <header className="flex items-center gap-2 px-6 h-16">
        <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 22 }}>spatial_audio</span>
        <span className="font-display font-bold text-tp text-lg">Spoke</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display font-bold text-2xl text-tp mb-2">Set up your profile</h2>
          <p className="text-sm text-ts mb-8">Find your society and enter your unit to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-1.5">Your name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Rivera"
                required
                className="w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Society search */}
            <div>
              <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-1.5">Society / HOA</label>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search by society name…"
                className="w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {results.length > 0 && (
                <div className="mt-1 bg-surface border border-bdr rounded-xl overflow-hidden">
                  {results.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setSocietyId(s.id); setSearchQuery(s.name); setResults([]) }}
                      className="w-full text-left px-4 py-3 text-sm text-tp hover:bg-surface-raised transition-colors"
                    >
                      <span className="font-medium">{s.name}</span>
                      {s.city && <span className="text-ts ml-2 text-xs">{s.city}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-1.5">Unit number</label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="4B"
                required
                className="w-full bg-bg border border-bdr rounded-xl px-4 py-3 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-xs font-medium text-tm uppercase tracking-wider block mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'resident', label: 'Resident',  icon: 'home' },
                  { value: 'board',    label: 'Board member', icon: 'dashboard' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={[
                      'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all text-sm font-medium',
                      role === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-bdr bg-surface text-ts hover:text-tp',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{opt.icon}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {err && <p className="text-xs text-err">{err}</p>}

            <Button type="submit" fullWidth size="lg" disabled={loading || !societyId}>
              {loading ? 'Setting up…' : 'Join society'}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
