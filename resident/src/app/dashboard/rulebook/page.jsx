'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function RulebookPage() {
  const supabase = createClient()
  const [sections, setSections] = useState([])
  const [openSec, setOpenSec]   = useState(null)
  const [search, setSearch]     = useState('')
  const [loading, setLoad]      = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) { setLoad(false); return }

      const { data: latestPdf } = await supabase.from('rulebook_pdfs').select('id').eq('society_id', p.society_id).eq('status', 'parsed').order('created_at', { ascending: false }).limit(1).single()
      if (!latestPdf) { setLoad(false); return }

      const { data: secs } = await supabase.from('rulebook_sections').select('id, title').eq('pdf_id', latestPdf.id).order('id')
      if (!secs) { setLoad(false); return }

      const secIds = secs.map(s => s.id)
      const { data: rules } = await supabase.from('rulebook_rules').select('id, text, rule_number, section_id').eq('status', 'approved').in('section_id', secIds).order('id')

      const map = {}
      secs.forEach(s => { map[s.id] = { ...s, rules: [] } })
      rules?.forEach(r => { if (map[r.section_id]) map[r.section_id].rules.push(r) })
      const populated = Object.values(map).filter(s => s.rules.length > 0)
      setSections(populated)
      if (populated[0]) setOpenSec(populated[0].id)
      setLoad(false)
    })
  }, [supabase])

  const filteredSections = sections.map(s => ({
    ...s,
    rules: s.rules.filter(r => !search || r.text.toLowerCase().includes(search.toLowerCase())),
  })).filter(s => s.rules.length > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Rulebook</h1>
        <p className="text-sm text-text-muted mt-0.5">{sections.reduce((s, c) => s + c.rules.length, 0)} approved rules</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-text-muted">Loading rules…</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 32 }}>menu_book</span>
          </div>
          <p className="text-base font-semibold text-text-primary mb-1">No rulebook yet</p>
          <p className="text-sm text-text-muted">Your board hasn't uploaded the rulebook yet.</p>
        </div>
      ) : (
        <>
          <div className="relative mb-5">
            <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
          </div>

          {filteredSections.length === 0 ? (
            <p className="text-center py-12 text-sm text-text-muted">No rules match your search.</p>
          ) : (
            <div className="space-y-2">
              {filteredSections.map(sec => (
                <div key={sec.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenSec(o => o === sec.id ? null : sec.id)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left">
                    <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 18 }}>
                      {openSec === sec.id ? 'expand_less' : 'expand_more'}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-text-primary">{sec.title}</span>
                    <span className="text-xs text-text-muted">{sec.rules.length}</span>
                  </button>
                  {openSec === sec.id && (
                    <div className="border-t border-border divide-y divide-border">
                      {sec.rules.map(rule => (
                        <div key={rule.id} className="px-4 py-3">
                          {rule.rule_number && <p className="text-[10px] font-mono text-text-muted mb-0.5">Rule {rule.rule_number}</p>}
                          <p className="text-sm text-text-primary leading-relaxed">{rule.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
