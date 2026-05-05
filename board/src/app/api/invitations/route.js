import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function createSupabaseClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => { try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {} },
      },
    }
  )
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request) {
  const cookieStore = await cookies()
  const supabase = createSupabaseClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('society_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'board') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { name, email, unit_number, phone } = await request.json()
  if (!name?.trim() || !email?.trim() || !unit_number?.trim()) {
    return Response.json({ error: 'Name, email and unit number are required' }, { status: 400 })
  }

  // Check no pending invite already exists for this email in this society
  const { data: existing } = await supabase
    .from('invitations')
    .select('id, status')
    .eq('society_id', profile.society_id)
    .eq('email', email.trim().toLowerCase())
    .eq('status', 'pending')
    .single()

  if (existing) {
    return Response.json({ error: 'A pending invitation already exists for this email' }, { status: 409 })
  }

  // Generate unique code (retry on collision)
  let invite_code
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateInviteCode()
    const { data: clash } = await supabase.from('invitations').select('id').eq('invite_code', candidate).single()
    if (!clash) { invite_code = candidate; break }
  }
  if (!invite_code) return Response.json({ error: 'Could not generate invite code, try again' }, { status: 500 })

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      society_id:  profile.society_id,
      created_by:  user.id,
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      unit_number: unit_number.trim().toUpperCase(),
      phone:       phone?.trim() || null,
      invite_code,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ invitation: data })
}

export async function GET(request) {
  const cookieStore = await cookies()
  const supabase = createSupabaseClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('society_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'board') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('society_id', profile.society_id)
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ invitations: data })
}

export async function DELETE(request) {
  const cookieStore = await cookies()
  const supabase = createSupabaseClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('society_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'board') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await request.json()
  if (!id) return Response.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', id)
    .eq('society_id', profile.society_id)
    .eq('status', 'pending')

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
