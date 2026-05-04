import { supabase, IS_DEMO } from '../lib/supabase'
import { DEMO_COMPLAINTS }   from '../data/demoComplaints'
import { COMPLAINT_ACTIONS } from '../lib/constants'

// ── Fetch ──────────────────────────────────────────────────────────────────

export async function fetchComplaints(societyId) {
  if (IS_DEMO) return { data: DEMO_COMPLAINTS, error: null }

  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('society_id', societyId)
    .order('created_at', { ascending: false })

  return { data: data ?? [], error }
}

export async function fetchComplaintById(id) {
  if (IS_DEMO) return { data: DEMO_COMPLAINTS.find(c => c.id === id) ?? null, error: null }

  const { data, error } = await supabase
    .from('complaints')
    .select('*, complaint_logs(*)')
    .eq('id', id)
    .single()

  return { data, error }
}

export async function fetchComplaintLogs(complaintId) {
  if (IS_DEMO) return { data: [], error: null }

  const { data, error } = await supabase
    .from('complaint_logs')
    .select('*, users(name, avatar)')
    .eq('complaint_id', complaintId)
    .order('created_at', { ascending: true })

  return { data: data ?? [], error }
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createComplaint(payload) {
  if (IS_DEMO) {
    // Demo: return constructed object, caller writes to AppContext
    return { data: payload, error: null }
  }

  const { data, error } = await supabase
    .from('complaints')
    .insert(payload)
    .select()
    .single()

  if (!error && data) {
    // Write creation log
    await supabase.from('complaint_logs').insert({
      complaint_id: data.id,
      action:       COMPLAINT_ACTIONS.CREATED,
      performed_by: payload.created_by,
      note:         'Complaint received via voice',
    })
  }

  return { data, error }
}

// ── Update status ──────────────────────────────────────────────────────────

export async function updateComplaintStatus(id, status, performedBy) {
  if (IS_DEMO) return { data: { id, status }, error: null }

  const { data: prev } = await supabase
    .from('complaints')
    .select('status')
    .eq('id', id)
    .single()

  const { data, error } = await supabase
    .from('complaints')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (!error) {
    const action = status === 'Resolved'
      ? COMPLAINT_ACTIONS.RESOLVED
      : COMPLAINT_ACTIONS.STATUS_CHANGED

    await supabase.from('complaint_logs').insert({
      complaint_id: id,
      action,
      performed_by: performedBy ?? null,
      old_value:    prev?.status ?? null,
      new_value:    status,
    })
  }

  return { data, error }
}

// ── Realtime subscription ──────────────────────────────────────────────────

export function subscribeToComplaints(societyId, onInsert, onUpdate) {
  if (IS_DEMO || !supabase) return () => {}

  const channel = supabase
    .channel(`complaints:${societyId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'complaints',
        filter: `society_id=eq.${societyId}`,
      },
      payload => onInsert?.(payload.new)
    )
    .on(
      'postgres_changes',
      {
        event:  'UPDATE',
        schema: 'public',
        table:  'complaints',
        filter: `society_id=eq.${societyId}`,
      },
      payload => onUpdate?.(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
