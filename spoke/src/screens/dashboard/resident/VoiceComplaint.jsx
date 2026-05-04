import { useMemo, useState } from 'react'
import { useNavigate }       from 'react-router-dom'
import { useVoiceRecording } from '../../../hooks/useVoiceRecording'
import { useComplaints }     from '../../../hooks/useComplaints'
import { classify }          from '../../../utils/classify'
import { Button }            from '../../../components/ui/Button'

export default function VoiceComplaint() {
  const navigate = useNavigate()
  const { isRecording, transcript, interimText, timerSeconds, start, stop, supported, error } = useVoiceRecording()
  const { addComplaint } = useComplaints()
  const [typed,   setTyped]   = useState('')
  const [loading, setLoading] = useState(false)

  const text     = (transcript || typed).trim()
  const detected = text ? classify(text) : null

  function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }

  function toggle() { isRecording ? stop() : start() }

  async function handleSubmit() {
    if (!text || loading) return
    setLoading(true)
    await addComplaint(text)
    setLoading(false)
    navigate('/dashboard/confirmation', { replace: true })
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
        </button>
        <div>
          <h1 className="text-base font-semibold text-text-primary">File a Complaint</h1>
          <p className="text-xs text-text-muted">Speak or type — AI classifies automatically</p>
        </div>
      </div>

      {/* Detected category */}
      {detected ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl mb-4 animate-fade-in">
          <span className="material-symbols-rounded" style={{ fontSize: 16, color: detected.color }}>{detected.icon}</span>
          <span className="text-sm font-medium" style={{ color: detected.color }}>Detected: {detected.category}</span>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: detected.color + '15', color: detected.color }}>
            {detected.priority}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 bg-surface-2 border border-border rounded-xl mb-4">
          <span className="material-symbols-rounded text-text-muted" style={{ fontSize: 16 }}>auto_awesome</span>
          <span className="text-sm text-text-muted">AI will auto-detect category from your words</span>
        </div>
      )}

      {/* Mic area */}
      <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col items-center gap-5 mb-4">
        {/* Mic button */}
        <button
          onClick={toggle}
          className={[
            'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/30',
            isRecording
              ? 'bg-danger text-white shadow-lg animate-mic-pulse'
              : 'bg-brand-600 text-white hover:bg-brand-700 shadow-card-md hover:shadow-lg',
          ].join(' ')}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 32, fontVariationSettings: "'FILL' 1" }}>
            {isRecording ? 'stop_circle' : 'mic'}
          </span>
        </button>

        {/* Status */}
        <p className="text-sm text-text-secondary font-medium">
          {isRecording
            ? `Listening… ${fmt(timerSeconds)} / 0:30`
            : text
            ? 'Recording complete — review below'
            : 'Tap the mic to start speaking'}
        </p>

        {/* Waveform */}
        {isRecording && (
          <div className="flex items-end gap-1 h-8">
            {[0.4, 0.7, 1, 0.5, 0.9, 0.4, 0.75, 0.55].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-brand-600 animate-wavebar"
                style={{ height: `${h * 28}px`, animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fallback / transcript */}
      {(!supported || !!error) && (
        <div className="flex items-start gap-2.5 p-3 bg-warning/8 border border-warning/30 rounded-xl mb-4">
          <span className="material-symbols-rounded text-warning shrink-0 mt-0.5" style={{ fontSize: 16 }}>info</span>
          <p className="text-xs text-warning-text leading-relaxed">
            {error || 'Voice recording not available in this browser. Type your complaint below.'}
          </p>
        </div>
      )}

      {/* Transcript */}
      <div className="bg-surface border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Transcript</p>
        {transcript || interimText ? (
          <p className="text-sm text-text-primary leading-relaxed" role="status" aria-live="polite">
            {transcript}
            {interimText && <span className="text-text-muted italic"> {interimText}</span>}
          </p>
        ) : (
          <p className="text-sm text-text-muted italic">Your words will appear here as you speak.</p>
        )}
      </div>

      {/* Text fallback */}
      <div className="mb-5">
        <label className="text-sm font-medium text-text-primary block mb-1.5">
          {transcript ? 'Add more detail (optional)' : 'Or type your complaint'}
        </label>
        <textarea
          value={typed}
          onChange={e => setTyped(e.target.value)}
          rows={3}
          placeholder={transcript ? 'Add context here…' : 'E.g. The elevator in Tower B has been out of service since Monday morning…'}
          className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 resize-none transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          fullWidth
          size="lg"
          variant={isRecording ? 'danger' : 'primary'}
          onClick={isRecording ? stop : (text ? handleSubmit : toggle)}
          loading={loading}
          disabled={!isRecording && !text}
        >
          {isRecording ? (
            <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>stop_circle</span>Stop &amp; Submit</>
          ) : text ? (
            <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>send</span>Submit Complaint</>
          ) : (
            <><span className="material-symbols-rounded" style={{ fontSize: 18 }}>keyboard_voice</span>Start Recording</>
          )}
        </Button>
        <Button fullWidth variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
      </div>

      <p className="text-xs text-center text-text-muted mt-3">
        AI auto-categorises and routes your complaint to the right team
      </p>
    </div>
  )
}
