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
  const { isRecording, transcript, interimText, timerSeconds, start, stop, MAX_SECONDS } = useVoiceRecording()
  const { addComplaint } = useComplaints()

  const detected = transcript ? classify(transcript) : null

  function formatTimer(s) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  function handleToggle() {
    if (isRecording) stop()
    else start()
  }

  function handleSubmit() {
    if (!transcript.trim()) return
    addComplaint(transcript.trim())
    navigate('/confirmation')
  }

  const hasTranscript = transcript.trim().length > 0

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
            {isRecording ? 'Listening…' : hasTranscript ? 'Tap to re-record' : 'Tap to start recording'}
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
            className={`font-mono text-sm text-ts transition-opacity duration-300 ${isRecording || hasTranscript ? 'opacity-100' : 'opacity-0'}`}
          >
            {formatTimer(timerSeconds)} / {formatTimer(MAX_SECONDS)}
          </p>
        </div>

        {/* Live transcript card */}
        <div className="bg-surface-raised border border-bdr rounded-2xl p-4">
          <p className="text-xs font-medium text-tm uppercase tracking-wider mb-2">Live Transcript</p>
          <div className="min-h-[80px]" role="status" aria-live="polite">
            {hasTranscript || interimText ? (
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
              <p className="text-sm text-tm italic">Your words will appear here…</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            fullWidth
            variant={isRecording ? 'danger' : 'primary'}
            size="lg"
            onClick={isRecording ? () => stop() : (hasTranscript ? handleSubmit : handleToggle)}
            disabled={!isRecording && !hasTranscript && false}
          >
            {isRecording ? (
              <>
                <span className="material-symbols-outlined icon-filled" style={{ fontSize: 18 }}>stop_circle</span>
                Stop & Submit
              </>
            ) : hasTranscript ? (
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

          <Button fullWidth variant="ghost" onClick={() => navigate('/home')}>
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
