import { useState } from 'react'
import { RULEBOOK } from '../../../data/rulebookData'

export default function Rulebook() {
  const [search, setSearch] = useState('')
  const [open,   setOpen]   = useState(null)

  const query = search.toLowerCase()
  const filtered = RULEBOOK.filter(s =>
    !query ||
    s.title.toLowerCase().includes(query) ||
    s.keywords.some(k => k.includes(query)) ||
    s.rules.some(r => r.toLowerCase().includes(query))
  )

  function toggle(id) { setOpen(o => o === id ? null : id) }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Rulebook</h1>
        <p className="text-sm text-text-muted mt-0.5">Community rules &amp; policies for Maple Heights HOA.</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search rules…"
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 transition-colors"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="material-symbols-rounded text-text-muted block mb-2" style={{ fontSize: 32 }}>search_off</span>
          <p className="text-sm text-text-muted">No rules match &ldquo;{search}&rdquo;</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(section => (
          <div key={section.id} className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <span className="material-symbols-rounded text-brand-600" style={{ fontSize: 17 }}>{section.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-text-primary">{section.title}</span>
                <span className="text-xs text-text-muted ml-2">{section.count} rules</span>
              </div>
              <span className="material-symbols-rounded text-text-muted transition-transform duration-200" style={{ fontSize: 18, transform: open === section.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
            </button>

            {open === section.id && (
              <div className="border-t border-border px-4 py-3 space-y-2">
                {section.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center shrink-0 text-2xs font-bold text-brand-600">{i + 1}</span>
                    <p className="text-sm text-text-secondary leading-relaxed">{rule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-text-muted mt-8">
        Last updated January 2025 · Full bylaws available from your board
      </p>
    </div>
  )
}
