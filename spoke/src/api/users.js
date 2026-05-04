import { supabase, IS_DEMO } from '../lib/supabase'
import { RESIDENTS }         from '../data/residentsData'

// ── Profile ────────────────────────────────────────────────────────────────

export async function fetchProfile(userId) {
  if (IS_DEMO) return { data: null, error: null }

  const { data, error } = await supabase
    .from('users')
    .select('*, societies(name, address, city)')
    .eq('id', userId)
    .single()

  return { data, error }
}

export async function updateProfile(userId, updates) {
  if (IS_DEMO) return { data: updates, error: null }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}

// ── Society members (board view) ───────────────────────────────────────────

export async function fetchResidents(societyId) {
  if (IS_DEMO) return { data: RESIDENTS, error: null }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('society_id', societyId)
    .order('unit_number', { ascending: true })

  return { data: data ?? [], error }
}

// ── Join society (first-time setup) ───────────────────────────────────────

export async function joinSociety(userId, societyId, unitNumber, role = 'resident', name) {
  if (IS_DEMO) return { data: null, error: null }

  const updates = {
    society_id:  societyId,
    unit_number: unitNumber,
    role,
    onboarded:   true,
  }
  if (name) updates.name = name

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  return { data, error }
}
