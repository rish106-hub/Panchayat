import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants, fadeUp } from '../../utils/motion'
import { useVoiceRecording } from '../../hooks/useVoiceRecording'
import { useComplaints } from '../../hooks/useComplaints'
import { classify } from '../../utils/classify'
import { TopBar } from '../../components/layout/TopBar'
import { BottomNav } from '../../components/layout/BottomNav'
import { MicButton } from '../../components/ui/MicButton'
import { Button } from '../../components/ui/Button'

export default function VoiceRecording() {
  const navigate = useNavigate()
  const { isRecording, transcript, interimText, timerSeconds, start, stop, MAX_SECONDS, supported, error } = useVoiceRecording()
  const { addComplaint } = useComplaints()
  const [typedComplaint, setTypedComplaint] = useState('')

  const complaintText = useMemo(() => (transcript || typedComplaint).trim(), [transcript, typedComplaint])
  const detected = complaintText ? classify(complaintText) : null

  function formatTimer(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  function handleToggle() {
    if (isRecording) stop()
    else start()
  }

  function handleSubmit() {
    if (!complaintText) return
    addComplaint(complaintText)
    navigate('/confirmation', { replace: true })
  }

  const hasComplaintText = complaintText.length > 0
  const showTypedFallback = !supported || !!error || !isRecording

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-bg flex flex-col pb-20 md:pb-8"
    >
      <TopBar title="New Complaint" backTo="/home" />

      <div className="max-w-[430px] mx-auto w-full px-4 flex-1 flex flex-col py-5 gap-5">

        {/* Category hint */}
        <div className="flex items-center gap-2 text-xs text-ts">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 15 }}>auto_awesome</span>
          {detected ? (
            <AnimatePresence mode="wait">
              <motion.span
                key={detected.category}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-medium"
                style={{ color: detected.color }}
              >
                Detected: {detected.category}
              </motion.span>
            </AnimatePresence>
          ) : (
            <span>AI will auto-detect category from your voice</span>
          )}
        </div>

        {/* Recording area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <p className="text-sm text-ts">
            {isRecording ? 'Listening…' : hasComplaintText ? 'Tap to re-record' : 'Tap to start recording'}
          </p>

          <MicButton isRecording={isRecording} onClick={handleToggle} size="lg" />

          {/* Waveform bars */}
          <div className={`flex items-end gap-1 h-8 transition-opacity duration-300 ${isRecording ? 'opacity-100' : 'opacity-0'}`}>
            {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.75, 0.45].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-voice/70 rounded-full animate-wavebar"
                style={{ height: `${h * 28}px`, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>

          {/* Timer */}
          <p
            className={`font-mono text-sm text-ts transition-opacity duration-300 ${isRecording || hasComplaintText ? 'opacity-100' : 'opacity-0'}`}
          >
            {formatTimer(timerSeconds)} / {formatTimer(MAX_SECONDS)}
          </p>
        </div>

        {(!supported || error) && (
          <div className="bg-warn/10 border border-warn/30 rounded-2xl p-3 flex gap-2">
            <span className="material-symbols-outlined text-warn flex-shrink-0" style={{ fontSize: 18 }}>info</span>
            <p className="text-xs text-ts leading-relaxed">
              {error || 'Voice recording is not fully supported here. Use the text box below for the demo.'}
            </p>
          </div>
        )}

        {/* Live transcript card */}
        <div className="bg-surface-raised border border-bdr rounded-2xl p-4">
          <p className="text-xs font-medium text-tm uppercase tracking-wider mb-2">Live Transcript</p>
          <div className="min-h-[80px]" role="status" aria-live="polite">
            {transcript.trim() || interimText ? (
              <p className="text-sm text-tp leading-relaxed">
                {transcript}
                {interimText && (
                  <span className="text-ts italic"> {interimText}</span>
                )}
                {isRecording && (
                  <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-blink align-middle" />
                )}
              </p>
            ) : (
              <p className="text-sm text-tm italic">Your words will appear here. You can also type below.</p>
            )}
          </div>
        </div>

        {showTypedFallback && (
          <div className="bg-surface border border-bdr rounded-2xl p-4">
            <label className="text-xs font-medium text-tm uppercase tracking-wider mb-2 block">Text fallback</label>
            <textarea
              value={typedComplaint}
              onChange={e => setTypedComplaint(e.target.value)}
              placeholder="Type a complaint, e.g. The elevator in Tower B has been stuck for 20 minutes."
              rows={4}
              className="w-full bg-bg border border-bdr rounded-xl px-3 py-2.5 text-sm text-tp placeholder:text-tm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            fullWidth
            variant={isRecording ? 'danger' : 'primary'}
            size="lg"
            onClick={isRecording ? () => stop() : (hasComplaintText ? handleSubmit : handleToggle)}
            disabled={!isRecording && !hasComplaintText && !supported}
          >
            {isRecording ? (
              <>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18 }}>stop_circle</span>
                Stop & Submit
              </>
            ) : hasComplaintText ? (
              <>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18 }}>send</span>
                Submit Complaint
              </>
            ) : (
              <>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18 }}>mic</span>
                Start Recording
              </>
            )}
          </Button>

          <Button fullWidth variant="ghost" onClick={() => navigate('/home', { replace: true })}>
            Cancel
          </Button>

          <p className="text-xs text-center text-tm pt-1">
            AI categorises and routes your complaint automatically
          </p>
        </div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
