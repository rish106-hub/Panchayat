import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const RULEBOOK_PARSE_PROMPT = `You are an HOA document analyst. Extract and categorize rules from the provided HOA rulebook text.

Return ONLY valid JSON (no markdown fences, no explanation) in this exact structure:
{
  "sections": [
    {
      "title": "Section title",
      "icon": "material_symbol_icon_name",
      "rules": [
        {
          "text": "Full verbatim text of the rule",
          "is_confusing": false,
          "flag_reason": null
        }
      ]
    }
  ]
}

Choose icon from: local_parking, volume_up, fitness_center, pool, pets, group, elevator, build, deck, delete, menu_book, security, home, gavel, payments, door_front, campaign

Flag a rule as confusing (is_confusing: true, flag_reason: explanation) if it:
- Uses undefined vague terms like "reasonable", "excessive", "appropriate", "adequate" without defining them
- Contains no specific timeframe, amount, or measurable quantity where one is needed
- References external documents not included in this rulebook
- Contains legal jargon without plain-language explanation
- Appears to contradict another rule in the same rulebook
- Is incomplete — missing who enforces it, what the penalty is, or when it applies

Extract every individual rule. Do not summarize. Keep original rule text verbatim. Group related rules into logical sections.`
