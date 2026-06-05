import { useEffect, useRef } from 'react'

export function useSpeechRecognition({ isListening, onPhrase, onCaliente, onSuperElegante }) {
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)
  const onPhraseRef = useRef(onPhrase)
  const onCalienteRef = useRef(onCaliente)
  const onSuperEleganteRef = useRef(onSuperElegante)

  useEffect(() => {
    onPhraseRef.current = onPhrase
    onCalienteRef.current = onCaliente
    onSuperEleganteRef.current = onSuperElegante
  })

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
          const text = event.results[i][0].transcript
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
          if (text.includes('chisme potente')) onPhraseRef.current?.()
          if (text.includes('caliente'))       onCalienteRef.current?.()
          if (text.includes('super elegante')) onSuperEleganteRef.current?.()
        }
      }
    }

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

  useEffect(() => {
    isListeningRef.current = isListening
    const recognition = recognitionRef.current
    if (!recognition) return
    if (isListening) {
      try { recognition.start() } catch (e) { /* may already be running */ }
    } else {
      try { recognition.abort() } catch (e) { /* ignore */ }
    }
  }, [isListening])
}
