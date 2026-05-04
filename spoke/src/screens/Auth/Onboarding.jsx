import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth }  from '../../context/AuthContext'
import { joinSociety } from '../../api/users'
import { searchSocieties } from '../../api/societies'
import { Button } from '../../components/ui/Button'
import { Input }  from '../../components/ui/Input'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [name,    setName]    = useState(user?.name ?? '')
  const [unit,    setUnit]    = useState('')
  const [role,    setRole]    = useState('resident')
  const [socId,   setSocId]   = useState('')
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSearch(q) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const { data } = await searchSocieties(q)
    setResults(data ?? [])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!socId) { setError('Select your society from the list.'); return }
    if (!unit.trim()) { setError('Enter your unit number.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await joinSociety(user.id, socId, unit.trim(), role, name.trim())
    setLoading(false)
    if (err) { setError(err.message); return }
    await refreshProfile()
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-card-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="material-symbols-rounded text-white" style={{ fontSize: 16 }}>spatial_audio</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">Spoke</span>
        </div>

        <h1 className="text-xl font-bold text-text-primary mb-1">Set up your profile</h1>
        <p className="text-sm text-text-secondary mb-6">Connect to your HOA to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Your name" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Rivera" required />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Society / HOA</label>
            <input
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name…"
              className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
            />
            {results.length > 0 && (
              <div className="border border-border rounded-xl overflow-hidden shadow-card mt-1">
                {results.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { setSocId(s.id); setQuery(s.name); setResults([]) }}
                    className="w-full px-4 py-2.5 text-left text-sm text-text-primary hover:bg-surface-2 transition-colors flex items-center justify-between"
                  >
                    <span>{s.name}</span>
                    {s.city && <span className="text-xs text-text-muted">{s.city}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Input label="Unit number" value={unit} onChange={e => setUnit(e.target.value)} placeholder="4B" required />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">I am a</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { v: 'resident', label: 'Resident',     icon: 'home' },
                { v: 'board',    label: 'Board member', icon: 'dashboard' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRole(opt.v)}
                  className={[
                    'flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                    role === opt.v
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-border text-text-secondary hover:border-border-strong hover:bg-surface-2',
                  ].join(' ')}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
          <Button type="submit" fullWidth loading={loading} disabled={!socId}>Join society</Button>
        </form>
      </div>
    </div>
  )
}
