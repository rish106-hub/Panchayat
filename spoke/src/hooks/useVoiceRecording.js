import { useState, useRef, useEffect, useCallback } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

const SUPPORTED = !!SpeechRecognition

const SIM_PHRASES = [
  'There is a water leak under the kitchen sink.',
  'Water has been dripping steadily for the past two days.',
  'I am worried about the cabinet floor getting damaged.',
  'Please send maintenance as soon as possible.',
]

export function useVoiceRecording() {
  const [isRecording, setIsRecording]   = useState(false)
  const [transcript, setTranscript]     = useState('')
  const [interimText, setInterimText]   = useState('')
  const [timerSeconds, setTimerSeconds] = useState(0)

  const recognitionRef   = useRef(null)
  const shouldRestartRef = useRef(false)
  const autoStopRef      = useRef(null)
  const timerIntervalRef = useRef(null)
  const simIntervalRef   = useRef(null)
  const simWordIdxRef    = useRef(0)

  const stopTimer = () => {
    clearInterval(timerIntervalRef.current)
  }

  const startTimer = () => {
    setTimerSeconds(0)
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(s => s + 1)
    }, 1000)
  }

  // Real Web Speech API path
  function startReal() {
    const r = new SpeechRecognition()
    r.continuous     = true
    r.interimResults = true
    r.lang           = 'en-US'

    r.onresult = (e) => {
      let finalChunk = '', interimChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const seg = e.results[i]
        if (seg.isFinal) finalChunk  += seg[0].transcript + ' '
        else             interimChunk += seg[0].transcript
      }
      if (finalChunk) setTranscript(prev => prev + finalChunk)
      setInterimText(interimChunk)
    }

    r.onend = () => {
      // Only restart if user hasn't pressed stop
      if (shouldRestartRef.current) {
        try { r.start() } catch { /* already starting */ }
      } else {
        setIsRecording(false)
        setInterimText('')
      }
    }

    r.onerror = (e) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return
      console.warn('SpeechRecognition error:', e.error)
    }

    recognitionRef.current = r
    shouldRestartRef.current = true
    r.start()
  }

  // Fallback simulation
  const SIM_WORDS = SIM_PHRASES.join(' ').split(' ')

  function startSim() {
    simWordIdxRef.current = 0
    simIntervalRef.current = setInterval(() => {
      const idx = simWordIdxRef.current
      if (idx >= SIM_WORDS.length) {
        stop()
        return
      }
      const word = SIM_WORDS[idx]
      setTranscript(prev => prev + (idx === 0 ? '' : ' ') + word)
      simWordIdxRef.current++
    }, 500)
  }

  const start = useCallback(() => {
    setTranscript('')
    setInterimText('')
    setTimerSeconds(0)
    startTimer()

    if (SUPPORTED) startReal()
    else           startSim()

    setIsRecording(true)

    // Auto-stop at 30s
    autoStopRef.current = setTimeout(() => stop(), 30000)
  }, [])

  const stop = useCallback(() => {
    clearTimeout(autoStopRef.current)
    clearInterval(simIntervalRef.current)
    stopTimer()

    if (recognitionRef.current) {
      shouldRestartRef.current = false  // gate: prevent onend restart
      try { recognitionRef.current.stop() } catch { /* fine */ }
      recognitionRef.current = null
    }

    setIsRecording(false)
    setInterimText('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(autoStopRef.current)
      clearInterval(simIntervalRef.current)
      clearInterval(timerIntervalRef.current)
      if (recognitionRef.current) {
        shouldRestartRef.current = false
        try { recognitionRef.current.abort() } catch { /* fine */ }
      }
    }
  }, [])

  return {
    isRecording,
    transcript,
    interimText,
    timerSeconds,
    start,
    stop,
    supported: SUPPORTED,
    MAX_SECONDS: 30,
  }
}
