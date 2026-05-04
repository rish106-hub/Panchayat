'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button }   from '@/components/ui/Button'
import { Modal }    from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

const STATUS_META = {
  approved:     { label: 'Approved',     color: '#059669' },
  needs_review: { label: 'Needs Review', color: '#D97706' },
  rejected:     { label: 'Rejected',     color: '#DC2626' },
}

function RuleCard({ rule, onApprove, onReject, saving }) {
  const meta = STATUS_META[rule.status] ?? STATUS_META.approved
  return (
    <div className={['rounded-xl border p-4 transition-all', rule.flagged ? 'border-warning/40 bg-warning/5' : 'border-border bg-surface'].join(' ')}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          {rule.rule_number && <p className="text-[10px] font-mono text-text-muted mb-1">Rule {rule.rule_number}</p>}
          <p className="text-sm text-text-primary leading-relaxed">{rule.text}</p>
          {rule.flagged && rule.flag_reason && (
            <div className="mt-2 flex items-start gap-1.5">
              <span className="material-symbols-rounded text-warning shrink-0" style={{ fontSize: 14 }}>warning</span>
              <p className="text-xs text-warning-text leading-snug">{rule.flag_reason}</p>
            </div>
          )}
        </div>
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ml-2" style={{ background: meta.color + '18', color: meta.color }}>
          {meta.label}
        </span>
      </div>
      {rule.status === 'needs_review' && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <Button size="sm" variant="success" onClick={() => onApprove(rule.id)} loading={saving === rule.id}>Approve</Button>
          <Button size="sm" variant="danger-ghost" onClick={() => onReject(rule.id)} loading={saving === rule.id}>Reject</Button>
        </div>
      )}
    </div>
  )
}

export default function RulebookPage() {
  const supabase  = createClient()
  const toast     = useToast()
  const fileRef   = useRef()

  const [societyId, setSocietyId] = useState(null)
  const [userId, setUserId]       = useState(null)
  const [pdfs, setPdfs]           = useState([])
  const [activePdf, setActivePdf] = useState(null)
  const [sections, setSections]   = useState([])
  const [openSec, setOpenSec]     = useState(null)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')

  const [uploading, setUploading] = useState(false)
  const [parsing, setParsing]     = useState(false)
  const [saving, setSaving]       = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) return
      setSocietyId(p.society_id)
      setUserId(user.id)
      const { data } = await supabase.from('rulebook_pdfs').select('*').eq('society_id', p.society_id).order('created_at', { ascending: false })
      if (data) {
        setPdfs(data)
        const latest = data.find(d => d.status === 'parsed')
        if (latest) loadSections(latest)
      }
    })
  }, [supabase])

  async function loadSections(pdf) {
    setActivePdf(pdf)
    setSections([])
    const { data: secs } = await supabase.from('rulebook_sections').select('id, title').eq('pdf_id', pdf.id).order('id')
    if (!secs) return
    const secIds = secs.map(s => s.id)
    const { data: rules } = await supabase.from('rulebook_rules').select('*').in('section_id', secIds).order('id')
    const map = {}
    secs.forEach(s => { map[s.id] = { ...s, rules: [] } })
    rules?.forEach(r => { if (map[r.section_id]) map[r.section_id].rules.push(r) })
    setSections(Object.values(map))
    setOpenSec(secs[0]?.id ?? null)
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0]
    if (!file || !societyId) return
    if (file.type !== 'application/pdf') { toast('Please upload a PDF file', 'error'); return }
    if (file.size > 20 * 1024 * 1024) { toast('File too large (max 20 MB)', 'error'); return }

    setUploading(true)
    const path = `${societyId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`

    const { error: storageErr } = await supabase.storage.from('rulebooks').upload(path, file)
    if (storageErr) { toast(storageErr.message, 'error'); setUploading(false); return }

    const { data: pdfRow, error: dbErr } = await supabase.from('rulebook_pdfs').insert({
      society_id:   societyId,
      uploaded_by:  userId,
      file_name:    file.name,
      storage_path: path,
      status:       'uploaded',
    }).select().single()

    setUploading(false)
    if (dbErr) { toast(dbErr.message, 'error'); return }

    setPdfs(ps => [pdfRow, ...ps])
    toast('PDF uploaded — parsing now…')
    parsePdf(pdfRow)
  }

  async function parsePdf(pdfRow) {
    setParsing(true)
    setPdfs(ps => ps.map(p => p.id === pdfRow.id ? { ...p, status: 'parsing' } : p))

    try {
      const res = await fetch('/api/rulebook/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ storage_path: pdfRow.storage_path, pdf_id: pdfRow.id, file_name: pdfRow.file_name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Parse failed')

      toast(`Parsed ${json.totalRules} rules · ${json.flaggedCount} flagged for review`)
      const { data: updated } = await supabase.from('rulebook_pdfs').select('*').eq('id', pdfRow.id).single()
      if (updated) {
        setPdfs(ps => ps.map(p => p.id === pdfRow.id ? updated : p))
        loadSections(updated)
      }
    } catch (err) {
      toast(err.message, 'error')
      setPdfs(ps => ps.map(p => p.id === pdfRow.id ? { ...p, status: 'failed' } : p))
    } finally {
      setParsing(false)
    }
  }

  async function updateRuleStatus(ruleId, status) {
    setSaving(ruleId)
    const { error } = await supabase.from('rulebook_rules').update({ status }).eq('id', ruleId)
    setSaving(null)
    if (error) { toast(error.message, 'error'); return }
    setSections(secs => secs.map(s => ({
      ...s,
      rules: s.rules.map(r => r.id === ruleId ? { ...r, status } : r),
    })))
    toast(status === 'approved' ? 'Rule approved' : 'Rule rejected')
  }

  async function deletePdf() {
    if (!deleteModal) return
    const { error } = await supabase.from('rulebook_pdfs').delete().eq('id', deleteModal.id)
    if (error) { toast(error.message, 'error'); return }
    setPdfs(ps => ps.filter(p => p.id !== deleteModal.id))
    if (activePdf?.id === deleteModal.id) { setActivePdf(null); setSections([]) }
    setDeleteModal(null)
    toast('Rulebook deleted')
  }

  const needsReviewCount = sections.reduce((sum, s) => sum + s.rules.filter(r => r.status === 'needs_review').length, 0)

  const filteredSections = sections.map(s => ({
    ...s,
    rules: s.rules.filter(r => {
      if (filter === 'flagged' && !r.flagged) return false
      if (filter === 'needs_review' && r.status !== 'needs_review') return false
      if (search && !r.text.toLowerCase().includes(search.toLowerCase())) return false
      return true
    }),
  })).filter(s => s.rules.length > 0)

  return (
    <>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Rulebook</h1>
            <p className="text-sm text-text-muted mt-0.5">
              {activePdf ? `${sections.reduce((s, c) => s + c.rules.length, 0)} rules · ${needsReviewCount} need review` : 'No rulebook uploaded yet'}
            </p>
          </div>
          <div className="flex gap-2">
            {needsReviewCount > 0 && (
              <button onClick={() => setFilter(f => f === 'needs_review' ? 'all' : 'needs_review')}
                className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-warning/10 text-warning-text text-xs font-medium border border-warning/20 hover:bg-warning/20 transition-colors">
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>warning</span>
                {needsReviewCount} to review
              </button>
            )}
            <Button onClick={() => fileRef.current?.click()} loading={uploading || parsing}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>upload_file</span>
              {uploading ? 'Uploading…' : parsing ? 'Parsing…' : 'Upload PDF'}
            </Button>
            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {/* PDF history */}
        {pdfs.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Uploaded rulebooks</p>
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              {pdfs.map((p, i) => {
                const isActive = activePdf?.id === p.id
                const statusColor = p.status === 'parsed' ? '#059669' : p.status === 'failed' ? '#DC2626' : '#D97706'
                return (
                  <div key={p.id} className={['px-4 py-3 flex items-center gap-3', i < pdfs.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                    <span className="material-symbols-rounded text-text-muted shrink-0" style={{ fontSize: 20 }}>picture_as_pdf</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{p.file_name}</p>
                      <p className="text-xs text-text-muted">
                        {p.total_rules ? `${p.total_rules} rules · ${p.flagged_count ?? 0} flagged · ` : ''}
                        {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: statusColor + '18', color: statusColor }}>
                      {p.status === 'parsed' ? 'Parsed' : p.status === 'failed' ? 'Failed' : p.status === 'parsing' ? 'Parsing…' : 'Uploaded'}
                    </span>
                    {p.status === 'parsed' && !isActive && (
                      <button onClick={() => loadSections(p)} className="text-xs text-brand-600 hover:underline shrink-0 ml-1">View</button>
                    )}
                    {p.status === 'failed' && (
                      <button onClick={() => parsePdf(p)} className="text-xs text-brand-600 hover:underline shrink-0 ml-1">Retry</button>
                    )}
                    <button onClick={() => setDeleteModal(p)} className="ml-1 p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-danger transition-colors">
                      <span className="material-symbols-rounded" style={{ fontSize: 16 }}>delete</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Rules browser */}
        {sections.length > 0 && (
          <>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rules…"
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
              </div>
              <select value={filter} onChange={e => setFilter(e.target.value)}
                className="h-10 px-3 pr-8 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer">
                <option value="all">All rules</option>
                <option value="flagged">Flagged</option>
                <option value="needs_review">Needs review</option>
              </select>
            </div>

            {filteredSections.length === 0 ? (
              <div className="text-center py-16 text-sm text-text-muted">No rules match your filter.</div>
            ) : (
              <div className="space-y-3">
                {filteredSections.map(sec => (
                  <div key={sec.id} className="bg-surface border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenSec(o => o === sec.id ? null : sec.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-surface-2 transition-colors text-left">
                      <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 18 }}>
                        {openSec === sec.id ? 'expand_less' : 'expand_more'}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-text-primary">{sec.title}</span>
                      <span className="text-xs text-text-muted">{sec.rules.length} rule{sec.rules.length !== 1 ? 's' : ''}</span>
                      {sec.rules.some(r => r.status === 'needs_review') && (
                        <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                      )}
                    </button>
                    {openSec === sec.id && (
                      <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                        {sec.rules.map(rule => (
                          <RuleCard
                            key={rule.id}
                            rule={rule}
                            onApprove={id => updateRuleStatus(id, 'approved')}
                            onReject={id => updateRuleStatus(id, 'rejected')}
                            saving={saving}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {pdfs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-2 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 32 }}>upload_file</span>
            </div>
            <p className="text-base font-semibold text-text-primary mb-1">No rulebook yet</p>
            <p className="text-sm text-text-muted mb-5">Upload your housing society rulebook PDF.<br />Claude will auto-categorize rules and flag ambiguous ones.</p>
            <Button onClick={() => fileRef.current?.click()}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>upload_file</span>
              Upload rulebook PDF
            </Button>
          </div>
        )}
      </div>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Rulebook">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">This will permanently delete <span className="font-medium text-text-primary">{deleteModal?.file_name}</span> and all extracted rules. This cannot be undone.</p>
          <div className="flex gap-2">
            <Button fullWidth variant="danger" onClick={deletePdf}>Delete</Button>
            <Button fullWidth variant="secondary" onClick={() => setDeleteModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
