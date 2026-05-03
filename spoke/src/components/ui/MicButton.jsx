import { motion } from 'framer-motion'

const SIZE_CONFIG = {
  sm: { outer: 100, middle: 78,  core: 52 },
  md: { outer: 120, middle: 92,  core: 64 },
  lg: { outer: 160, middle: 122, core: 78 },
}

export function MicButton({ isRecording = false, onClick, size = 'lg', disabled = false }) {
  const cfg = SIZE_CONFIG[size] ?? SIZE_CONFIG.lg

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
      whileTap={{ scale: 0.93 }}
      className="relative flex items-center justify-center cursor-pointer flex-shrink-0 bg-transparent border-none p-0"
      style={{ width: cfg.outer, height: cfg.outer }}
    >
      {/* Outer ring */}
      <span
        className={isRecording ? 'animate-ring-recording' : 'animate-ring-idle'}
        style={{
          position: 'absolute',
          width: cfg.outer,
          height: cfg.outer,
          borderRadius: '50%',
          background: 'rgba(255,107,107,0.15)',
          border: '2px solid rgba(255,107,107,0.20)',
        }}
      />
      {/* Middle ring */}
      <span
        className={isRecording ? 'animate-ring-recording' : 'animate-ring-idle'}
        style={{
          position: 'absolute',
          width: cfg.middle,
          height: cfg.middle,
          borderRadius: '50%',
          background: 'rgba(255,107,107,0.22)',
          border: '2px solid rgba(255,107,107,0.35)',
          animationDelay: '0.15s',
        }}
      />
      {/* Core button */}
      <span
        className={[
          'absolute flex items-center justify-center rounded-full',
          isRecording ? 'animate-mic-pulse-recording' : 'animate-mic-pulse-idle',
        ].join(' ')}
        style={{
          width: cfg.core,
          height: cfg.core,
          background: '#FF6B6B',
          boxShadow: isRecording
            ? '0 0 0 8px rgba(255,107,107,0.18), 0 0 24px rgba(255,107,107,0.3)'
            : '0 0 0 0 transparent',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <span
          className="material-symbols-outlined text-white icon-filled"
          style={{ fontSize: cfg.core * 0.40 }}
        >
          {isRecording ? 'stop' : 'mic'}
        </span>
      </span>
    </motion.button>
  )
}
