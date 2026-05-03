import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { pageVariants, listContainer, listItem } from '../../utils/motion'
import { RULEBOOK } from '../../data/rulebookData'
import { useVoiceRecording } from '../../hooks/useVoiceRecording'
import { useComplaints } from '../../hooks/useComplaints'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { SearchInput } from '../../components/ui/Input'
import { RuleCard } from '../../components/shared/RuleCard'
import { AIAnswer } from './AIAnswer'

const CATEGORY_CHIPS = ['All', 'Parking', 'Noise', 'Gym', 'Pool', 'Pets', 'Elevator', 'Trash']

export default function Rulebook() {
  const [query, setQuery]           = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const { showToast }               = useComplaints()
  const { isRecording, transcript, start, stop } = useVoiceRecording()

  function handleVoiceSearch() {
    if (isRecording) {
      stop()
      if (transcript) setQuery(transcript)
    } else {
      start()
    }
  }

  // When voice transcript updates while recording, preview it
  const searchQuery = isRecording ? transcript : query

  const filtered = useMemo(() => {
    let list = RULEBOOK
    if (activeChip !== 'All') {
      list = list.filter(s => s.title.toLowerCase() === activeChip.toLowerCase())
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.keywords.some(k => k.toLowerCase().includes(q)) ||
        s.rules.some(r => r.toLowerCase().includes(q))
      )
    }
    return list
  }, [searchQuery, activeChip])

  function handleChipClick(chip) {
    setActiveChip(chip)
    setQuery('')
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg pb-20 md:pb-8"
    >
      <TopBar
        title="Rules"
        backTo="/home"
        rightContent={
          <label className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-raised transition-colors cursor-pointer" title="Upload rulebook PDF">
            <span className="material-symbols-outlined text-ts" style={{ fontSize: 18 }}>upload_file</span>
            <input
              type="file"
              accept=".pdf,.txt,.docx"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) showToast(`Uploaded: ${file.name}`)
                e.target.value = ''
              }}
            />
          </label>
        }
      />

      <div className="max-w-[430px] md:max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Search */}
        <SearchInput
          placeholder="Search rules…"
          value={isRecording ? transcript : query}
          onChange={e => { setQuery(e.target.value); setActiveChip('All') }}
          icon="search"
          rightIcon={isRecording ? 'stop_circle' : 'mic'}
          onRightIconClick={handleVoiceSearch}
        />

        <p className="text-xs text-tm">
          Powered by Parkview HOA Rulebook v2.4 · {RULEBOOK.length} sections
        </p>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORY_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150',
                activeChip === chip
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-bdr text-ts hover:text-tp',
              ].join(' ')}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* AI Answer */}
        <AIAnswer query={searchQuery.trim() || (activeChip !== 'All' ? activeChip : '')} />

        {/* Rules list */}
        <motion.div
          key={activeChip + searchQuery}
          variants={listContainer}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {filtered.length === 0 ? (
            <div className="py-10 text-center">
              <span className="material-symbols-outlined text-tm" style={{ fontSize: 36 }}>search_off</span>
              <p className="text-sm text-ts mt-2">No rules match your search</p>
            </div>
          ) : (
            filtered.map(section => (
              <motion.div key={section.id} variants={listItem}>
                <RuleCard section={section} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
