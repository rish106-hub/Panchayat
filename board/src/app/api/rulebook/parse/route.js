import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'
import pdf from 'pdf-parse/lib/pdf-parse.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PARSE_PROMPT = `You are parsing a housing society rulebook PDF into structured data.

Extract all rules from the text and organize them into logical sections/categories.

Return ONLY valid JSON with this exact structure:
{
  "sections": [
    {
      "title": "Section title (e.g. Parking, Noise, Common Areas)",
      "rules": [
        {
          "text": "The exact rule text, cleaned up for clarity",
          "rule_number": "Original rule number if present, else null",
          "flagged": true/false,
          "flag_reason": "If flagged=true: specific reason why this rule is ambiguous, contradictory, or unclear. If flagged=false: null"
        }
      ]
    }
  ]
}

Flag a rule as confusing/ambiguous if it:
- Uses vague language ("reasonable", "appropriate") without defining it
- Contradicts another rule
- Has unclear enforcement or exceptions
- Is legally questionable
- Has missing specifics (no defined times, amounts, etc.)

Be thorough — extract every rule you can find.`

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

  const { data: profile } = await supabase.from('users').select('society_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'board') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { storage_path, pdf_id, file_name } = body

  if (!storage_path || !pdf_id) {
    return Response.json({ error: 'Missing storage_path or pdf_id' }, { status: 400 })
  }

  try {
    // Download PDF from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('rulebooks')
      .download(storage_path)

    if (downloadError) throw new Error(`Storage download failed: ${downloadError.message}`)

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const { text } = await pdf(buffer)

    if (!text || text.trim().length < 50) {
      throw new Error('PDF appears to be empty or unreadable. Please check the file.')
    }

    // Claude API parse
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: `${PARSE_PROMPT}\n\nRulebook text:\n\n${text.slice(0, 100000)}`,
        },
      ],
    })

    const rawJson = message.content[0].text.trim()
    const jsonMatch = rawJson.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Claude returned invalid JSON')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      throw new Error('Unexpected response structure from Claude')
    }

    // Save sections + rules to DB
    let totalRules = 0
    let flaggedCount = 0

    for (const section of parsed.sections) {
      const { data: sec, error: secErr } = await supabase
        .from('rulebook_sections')
        .insert({
          pdf_id,
          society_id: profile.society_id,
          title: section.title,
        })
        .select()
        .single()

      if (secErr) throw new Error(`Section insert failed: ${secErr.message}`)

      const rules = (section.rules ?? []).map(r => ({
        section_id: sec.id,
        society_id: profile.society_id,
        text:        r.text,
        rule_number: r.rule_number ?? null,
        flagged:     r.flagged ?? false,
        flag_reason: r.flag_reason ?? null,
        status:      r.flagged ? 'needs_review' : 'approved',
      }))

      if (rules.length > 0) {
        const { error: rulesErr } = await supabase.from('rulebook_rules').insert(rules)
        if (rulesErr) throw new Error(`Rules insert failed: ${rulesErr.message}`)
      }

      totalRules += rules.length
      flaggedCount += rules.filter(r => r.flagged).length
    }

    // Mark PDF as parsed
    await supabase.from('rulebook_pdfs').update({
      status:        'parsed',
      parsed_at:     new Date().toISOString(),
      total_rules:   totalRules,
      flagged_count: flaggedCount,
    }).eq('id', pdf_id)

    return Response.json({ success: true, totalRules, flaggedCount, sections: parsed.sections.length })

  } catch (err) {
    await supabase.from('rulebook_pdfs').update({ status: 'failed', error_message: err.message }).eq('id', pdf_id)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
