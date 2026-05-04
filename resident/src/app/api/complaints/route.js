import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const CATEGORIES = [
  { name: 'Plumbing',        icon: 'plumbing',          color: '#0284C7' },
  { name: 'Electrical',      icon: 'bolt',              color: '#D97706' },
  { name: 'Elevator',        icon: 'elevator',          color: '#6366F1' },
  { name: 'Parking',         icon: 'directions_car',    color: '#059669' },
  { name: 'Noise',           icon: 'volume_up',         color: '#DC2626' },
  { name: 'Cleanliness',     icon: 'cleaning_services', color: '#0891B2' },
  { name: 'Security',        icon: 'security',          color: '#4338CA' },
  { name: 'Common Areas',    icon: 'deck',              color: '#7C3AED' },
  { name: 'Internet / WiFi', icon: 'wifi',              color: '#0284C7' },
  { name: 'Pest Control',    icon: 'pest_control',      color: '#65A30D' },
  { name: 'Other',           icon: 'report_problem',    color: '#94A3B8' },
]

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

  const body = await request.json()
  const { text, society_id, unit_number } = body

  if (!text?.trim() || text.trim().length < 20) {
    return Response.json({ error: 'Description too short (min 20 chars)' }, { status: 400 })
  }

  const categoryList = CATEGORIES.map(c => c.name).join(', ')

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: `Classify this housing society complaint and return JSON only.

Complaint: "${text.trim()}"

Available categories: ${categoryList}

Return JSON:
{
  "category": "<one of the available categories>",
  "priority": "<High|Medium|Low>",
  "summary": "<1-2 sentence clear summary of the issue>"
}

Priority rules:
- High: safety hazard, no water/power, broken elevator, security breach
- Medium: recurring issue, affects daily life significantly
- Low: aesthetic, minor inconvenience

Return only valid JSON, no other text.`,
      },
    ],
  })

  let parsed
  try {
    const raw = message.content[0].text.trim()
    const match = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(match?.[0] ?? raw)
  } catch {
    parsed = { category: 'Other', priority: 'Medium', summary: text.trim().slice(0, 150) }
  }

  const catMeta = CATEGORIES.find(c => c.name === parsed.category) ?? CATEGORIES.at(-1)

  const { data: complaint, error } = await supabase.from('complaints').insert({
    society_id,
    unit_number,
    transcript:  text.trim(),
    category:    catMeta.name,
    icon:        catMeta.icon,
    color:       catMeta.color,
    priority:    parsed.priority ?? 'Medium',
    status:      'Pending',
  }).select().single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({
    id:       complaint.id,
    category: catMeta.name,
    icon:     catMeta.icon,
    color:    catMeta.color,
    priority: complaint.priority,
    summary:  parsed.summary ?? text.trim().slice(0, 150),
  })
}
