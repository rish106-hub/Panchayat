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

export async function POST(request) {
  const cookieStore = await cookies()
  const supabase = createSupabaseClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { invite_code } = await request.json()
  if (!invite_code?.trim()) return Response.json({ error: 'Invite code is required' }, { status: 400 })

  // Find invitation — must match code AND email AND be pending
  const { data: invitation, error: invErr } = await supabase
    .from('invitations')
    .select('*')
    .eq('invite_code', invite_code.trim().toUpperCase())
    .eq('status', 'pending')
    .single()

  if (invErr || !invitation) {
    return Response.json({ error: 'Invalid or already used invite code.' }, { status: 404 })
  }

  // Email must match the logged-in user
  if (invitation.email !== user.email?.toLowerCase()) {
    return Response.json({
      error: 'This invite code is for a different email address. Sign in with the email your admin used.',
    }, { status: 403 })
  }

  // Create public.users record
  const { error: userErr } = await supabase.from('users').upsert({
    id:          user.id,
    society_id:  invitation.society_id,
    name:        invitation.name,
    unit_number: invitation.unit_number,
    phone:       invitation.phone,
    role:        'resident',
    onboarded:   true,
  })

  if (userErr) return Response.json({ error: userErr.message }, { status: 500 })

  // Mark invitation as accepted
  const { error: updateErr } = await supabase
    .from('invitations')
    .update({ status: 'accepted', user_id: user.id })
    .eq('id', invitation.id)

  if (updateErr) return Response.json({ error: updateErr.message }, { status: 500 })

  return Response.json({ success: true, name: invitation.name })
}
