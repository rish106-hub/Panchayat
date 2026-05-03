import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeUp } from '../../utils/motion'
import { RULEBOOK } from '../../data/rulebookData'

function searchRulebook(query) {
  const q = query.toLowerCase()
  for (const section of RULEBOOK) {
    const inTitle = section.title.toLowerCase().includes(q)
    const inKeywords = section.keywords.some(k => k.toLowerCase().includes(q))
    const matchingRule = section.rules.find(r => r.toLowerCase().includes(q))
    if (inTitle || inKeywords || matchingRule) {
      return {
        section: section.title,
        icon: section.icon,
        answer: matchingRule ?? section.rules[0],
        source: `Parkview HOA Rulebook — ${section.title}`,
      }
    }
  }
  return null
}

export function AIAnswer({ query }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  useEffect(() => {
    if (!query) { setResult(null); return }
    setLoading(true)
    setResult(null)
    const t = setTimeout(() => {
      setResult(searchRulebook(query))
      setLoading(false)
    }, 160)
    return () => clearTimeout(t)
  }, [query])

  if (!query) return null

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="skeleton"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="bg-primary/8 border border-primary/20 rounded-2xl p-4"
          style={{ background: 'rgba(99,102,241,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>auto_awesome</span>
            <span className="text-xs font-medium text-primary">Panchayat AI</span>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-primary/10 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-primary/10 rounded animate-pulse w-3/5" />
          </div>
        </motion.div>
      )}

      {!loading && result && (
        <motion.div
          key="answer"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="rounded-2xl p-4"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.22)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>auto_awesome</span>
            <span className="text-xs font-medium text-primary">Panchayat AI</span>
            <span className="ml-auto text-xs text-tm">{result.section}</span>
          </div>
          <p className="text-sm text-tp leading-relaxed">{result.answer}</p>
          <p className="text-xs text-tm mt-2 italic">{result.source}</p>
        </motion.div>
      )}

      {!loading && !result && query && (
        <motion.div
          key="noresult"
          variants={fadeUp}
          initial="initial"
          animate="animate"
          exit="exit"
          className="rounded-2xl p-4"
          style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.22)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>auto_awesome</span>
            <span className="text-xs font-medium text-primary">Panchayat AI</span>
          </div>
          <p className="text-sm text-ts">No matching rule found for "{query}". Try different keywords.</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
