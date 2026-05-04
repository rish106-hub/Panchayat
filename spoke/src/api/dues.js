import { supabase, IS_DEMO } from '../lib/supabase'
import { RESIDENTS, DUES_AMOUNT } from '../data/residentsData'
import { DUES_PERIOD } from '../lib/constants'

// Build demo dues from residents data
function buildDemoDues() {
  return RESIDENTS.map((r, i) => ({
    id:          `demo-due-${r.id}`,
    society_id:  'demo',
    user_id:     r.id,
    unit_number: r.unit,
    amount:      DUES_AMOUNT,
    period:      DUES_PERIOD,
    due_date:    '2026-05-31',
    status:      r.dues === 'pending' ? 'unpaid' : r.dues,
    paid_at:     r.dues === 'paid' ? new Date(Date.now() - i * 86400000).toISOString() : null,
    created_at:  new Date().toISOString(),
  }))
}

// ── Fetch ──────────────────────────────────────────────────────────────────

export async function fetchDues(societyId) {
  if (IS_DEMO) return { data: buildDemoDues(), error: null }

  const { data, error } = await supabase
    .from('dues')
    .select('*, users(name, unit_number, avatar)')
    .eq('society_id', societyId)
    .order('due_date', { ascending: false })

  return { data: data ?? [], error }
}

export async function fetchUserDues(userId) {
  if (IS_DEMO) {
    const all = buildDemoDues()
    return { data: all.filter(d => d.user_id === userId), error: null }
  }

  const { data, error } = await supabase
    .from('dues')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: false })

  return { data: data ?? [], error }
}

// ── Mark paid ──────────────────────────────────────────────────────────────

export async function markDuePaid(dueId, userId) {
  if (IS_DEMO) return { data: { id: dueId, status: 'paid' }, error: null }

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('dues')
    .update({ status: 'paid', paid_at: now })
    .eq('id', dueId)
    .select()
    .single()

  if (!error && data) {
    // Create payment record
    const receipt = `RCP-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
    await supabase.from('payments').insert({
      due_id:        dueId,
      user_id:       userId,
      amount:        data.amount,
      method:        'manual',
      status:        'completed',
      receipt_number: receipt,
    })
  }

  return { data, error }
}

// ── Payment history ────────────────────────────────────────────────────────

export async function fetchPaymentHistory(userId) {
  if (IS_DEMO) return { data: [], error: null }

  const { data, error } = await supabase
    .from('payments')
    .select('*, dues(period, unit_number)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}
