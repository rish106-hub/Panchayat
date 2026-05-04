'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function DuesBadge({ status }) {
  const map = {
    paid:    'bg-success/10 text-success-text',
    overdue: 'bg-danger/10 text-danger',
    pending: 'bg-warning/10 text-warning-text',
    due:     'bg-warning/10 text-warning-text',
  }
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${map[status] ?? map.pending}`}>
      {status ?? 'pending'}
    </span>
  )
}

export default function ResidentsPage() {
  const supabase = createClient()
  const [residents,  setResidents]  = useState([])
  const [complaints, setComplaints] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) return
      const [{ data: r }, { data: c }] = await Promise.all([
        supabase.from('users').select('id, name, unit_number, role, onboarded, phone').eq('society_id', p.society_id).eq('role', 'resident').order('unit_number'),
        supabase.from('complaints').select('id, unit_number').eq('society_id', p.society_id),
      ])
      const { data: dues } = await supabase.from('dues').select('user_id, status').eq('society_id', p.society_id).order('due_date', { ascending: false })
      const duesMap = {}
      dues?.forEach(d => { if (!duesMap[d.user_id]) duesMap[d.user_id] = d.status })
      setResidents((r ?? []).map(res => ({ ...res, dues_status: duesMap[res.id] ?? 'pending' })))
      setComplaints(c ?? [])
      setLoading(false)
    })
  }, [supabase])

  const filtered = residents.filter(r => {
    if (search && !r.name?.toLowerCase().includes(search.toLowerCase()) && !r.unit_number?.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'overdue' && r.dues_status !== 'overdue') return false
    if (filter === 'not-onboarded' && r.onboarded !== false) return false
    return true
  })

  const overdueCount = residents.filter(r => r.dues_status === 'overdue').length

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Residents</h1>
        <p className="text-sm text-text-muted mt-0.5">{residents.length} units · {overdueCount} with overdue dues</p>
      </div>

      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" style={{ fontSize: 18 }}>search</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or unit…"
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-surface text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition-colors" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="h-10 px-3 pr-8 rounded-xl border border-border bg-surface text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer">
          <option value="all">All residents</option>
          <option value="overdue">Dues overdue</option>
          <option value="not-onboarded">Not onboarded</option>
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-text-muted text-center py-16">Loading residents…</div>
      ) : filtered.length === 0 ? (
        <div className="text-sm text-text-muted text-center py-16">No residents match your filter.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
          {filtered.map((r, i) => {
            const cCount = complaints.filter(c => c.unit_number === r.unit_number).length
            return (
              <div key={r.id} className={['px-4 py-3.5 flex items-center gap-3', i < filtered.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-brand-600">{r.name?.slice(0, 2).toUpperCase() ?? '??'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary truncate">{r.name}</p>
                    {!r.onboarded && <span className="text-[10px] text-text-muted border border-border rounded-full px-1.5 py-0.5">Not onboarded</span>}
                  </div>
                  <p className="text-xs text-text-muted">Unit {r.unit_number} · {cCount} complaint{cCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <DuesBadge status={r.dues_status} />
                  {r.phone && <span className="text-[10px] text-text-muted">{r.phone}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
