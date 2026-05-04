import { supabase, IS_DEMO } from '../lib/supabase'

export async function fetchSociety(societyId) {
  if (IS_DEMO) {
    return {
      data: {
        id:      'demo',
        name:    'Maple Heights HOA',
        address: '123 Maple Street',
        city:    'San Francisco',
        plan:    'pro',
      },
      error: null,
    }
  }

  const { data, error } = await supabase
    .from('societies')
    .select('*')
    .eq('id', societyId)
    .single()

  return { data, error }
}

export async function searchSocieties(query) {
  if (IS_DEMO) return { data: [], error: null }

  const { data, error } = await supabase
    .from('societies')
    .select('id, name, address, city')
    .ilike('name', `%${query}%`)
    .limit(10)

  return { data: data ?? [], error }
}

export async function createNotice(societyId, createdBy, payload) {
  if (IS_DEMO) return { data: payload, error: null }

  const { data, error } = await supabase
    .from('notices')
    .insert({ society_id: societyId, created_by: createdBy, ...payload })
    .select()
    .single()

  return { data, error }
}
