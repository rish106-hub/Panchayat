import { supabase, IS_DEMO } from '../lib/supabase'
import { GATE_LOG }          from '../data/gateLogData'

// Normalise demo entries to match DB shape
function normaliseDemoEntry(e) {
  return {
    id:          e.id,
    society_id:  'demo',
    type:        e.type.charAt(0).toUpperCase() + e.type.slice(1), // capitalise
    description: e.description,
    unit_number: e.unit,
    status:      e.status,
    note:        e.note ?? '',
    created_at:  e.createdAt,
  }
}

// ── Fetch ──────────────────────────────────────────────────────────────────

export async function fetchGateLogs(societyId) {
  if (IS_DEMO) return { data: GATE_LOG.map(normaliseDemoEntry), error: null }

  const { data, error } = await supabase
    .from('gate_logs')
    .select('*, users!approved_by(name, avatar)')
    .eq('society_id', societyId)
    .order('created_at', { ascending: false })
    .limit(100)

  return { data: data ?? [], error }
}

// ── Create ─────────────────────────────────────────────────────────────────

export async function createGateLog(societyId, payload, approvedBy) {
  if (IS_DEMO) {
    return {
      data: {
        id:         `g-${Date.now()}`,
        society_id: 'demo',
        ...payload,
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  const { data, error } = await supabase
    .from('gate_logs')
    .insert({ society_id: societyId, approved_by: approvedBy ?? null, ...payload })
    .select()
    .single()

  return { data, error }
}

// ── Realtime ───────────────────────────────────────────────────────────────

export function subscribeToGateLogs(societyId, onInsert) {
  if (IS_DEMO || !supabase) return () => {}

  const channel = supabase
    .channel(`gate_logs:${societyId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'gate_logs',
        filter: `society_id=eq.${societyId}`,
      },
      payload => onInsert?.(payload.new)
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}
