'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DuesBadge } from '@/components/ui/Badge'

export default function DuesPage() {
  const supabase = createClient()
  const [dues, setDues]   = useState([])
  const [loading, setLoad] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      const { data: p } = await supabase.from('users').select('society_id').eq('id', user.id).single()
      if (!p?.society_id) return
      const { data } = await supabase.from('dues').select('*').eq('society_id', p.society_id).eq('user_id', user.id).order('due_date', { ascending: false })
      if (data) setDues(data)
      setLoad(false)
    })
  }, [supabase])

  const latest   = dues[0]
  const paid     = dues.filter(d => d.status === 'paid').length
  const overdue  = dues.filter(d => d.status === 'overdue').length
  const total    = dues.reduce((s, d) => s + (d.amount ?? 0), 0)
  const paidAmt  = dues.filter(d => d.status === 'paid').reduce((s, d) => s + (d.amount ?? 0), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">Dues</h1>
        <p className="text-sm text-text-muted mt-0.5">{dues.length} entries</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-text-muted">Loading…</div>
      ) : dues.length === 0 ? (
        <div className="text-center py-16 text-sm text-text-muted">No dues records found.</div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
              <p className="text-xs text-text-muted mb-1">Current status</p>
              <DuesBadge status={latest?.status} />
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4 shadow-card">
              <p className="text-xs text-text-muted mb-1">Paid</p>
              <p className="text-xl font-bold text-success">{paid}</p>
            </div>
            {overdue > 0 && (
              <div className="bg-danger/5 border border-danger/20 rounded-2xl p-4 shadow-card">
                <p className="text-xs text-danger/70 mb-1">Overdue</p>
                <p className="text-xl font-bold text-danger">{overdue}</p>
              </div>
            )}
          </div>

          {/* History */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-card">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold text-text-primary">Payment history</p>
            </div>
            {dues.map((d, i) => (
              <div key={d.id} className={['px-4 py-3.5 flex items-center gap-3', i < dues.length - 1 ? 'border-b border-border' : ''].join(' ')}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-surface-2">
                  <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 16 }}>receipt_long</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary capitalize">{d.description ?? d.type ?? 'Maintenance dues'}</p>
                  <p className="text-xs text-text-muted">{d.due_date ? new Date(d.due_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  {d.amount && <p className="text-sm font-semibold text-text-primary">₹{d.amount.toLocaleString('en-IN')}</p>}
                  <DuesBadge status={d.status} />
                </div>
              </div>
            ))}
          </div>

          {total > 0 && (
            <div className="mt-3 px-4 py-3 bg-surface-2 rounded-xl flex items-center justify-between">
              <span className="text-xs text-text-muted">Total collected</span>
              <span className="text-sm font-semibold text-text-primary">₹{paidAmt.toLocaleString('en-IN')} / ₹{total.toLocaleString('en-IN')}</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
