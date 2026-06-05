import { useEffect, useRef } from 'react'

export function useSpeechRecognition({ isListening, onPhrase, onCaliente }) {
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const onPhraseRef = useRef(onPhrase)
  const onCalienteRef = useRef(onCaliente)

  // Keep callback refs current without re-running effects
  useEffect(() => {
    onPhraseRef.current = onPhrase
    onCalienteRef.current = onCaliente
  })

  // Create recognition instance once
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn('🚫 Web Speech API no disponible en este navegador')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const raw = event.results[i][0].transcript
          // Normalize: lowercase + strip accents for robust matching
          const text = raw
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
          console.log('🗣️ Heard:', raw)
          if (text.includes('chisme potente')) {
            window.__chismeT0 = performance.now()
            console.log(`[CHISME] T0 speech detected — "${raw}"`)
            onPhraseRef.current?.()
          }
          if (text.includes('caliente')) {
            console.log(`[CALIENTE] Detected — "${raw}"`)
            onCalienteRef.current?.()
          }
        }
      }
    }

    // Auto-restart while still listening (browser stops after silence)
    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start() } catch (e) { /* already starting */ }
      }
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error)
      }
    }

    recognitionRef.current = recognition

    return () => {
      isListeningRef.current = false
      try { recognition.abort() } catch (e) { /* ignore */ }
    }
  }, [])

  // Start/stop based on isListening prop
  useEffect(() => {
    isListeningRef.current = isListening
    const recognition = recognitionRef.current
    if (!recognition) return

    if (isListening) {
      try {
        recognition.start()
        console.log('🎤 Escucha activada — di "chisme potente"')
      } catch (e) { /* may already be running */ }
    } else {
      try {
        recognition.abort()
        console.log('🔇 Escucha desactivada')
      } catch (e) { /* ignore */ }
    }
  }, [isListening])
}
