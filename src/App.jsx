import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AppProvider, AppContext } from './context/AppContext.jsx'
import { LandingPage } from './components/LandingPage.jsx'
import { StreamLayout } from './components/StreamLayout.jsx'
import { useThreeScene } from './hooks/useThreeScene.js'
import { useHandTracking } from './hooks/useHandTracking.js'
import { useFaceTracking } from './hooks/useFaceTracking.js'
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js'

function AppContent() {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const { chismeListening, setChismeActive, setCalienteActive, setActiveMeme, addHistoryEvent } = React.useContext(AppContext)
  const CALIENTE_DISPLAY_MS = parseInt(import.meta.env.VITE_CALIENTE_DISPLAY_MS) || 4000
  const MEME_DISPLAY_MS = parseInt(import.meta.env.VITE_MEME_DISPLAY_MS) || 2500
  const [videoReady, setVideoReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        })
        video.srcObject = stream
        video.play().catch(() => {})

        await new Promise((resolve) => {
          const checkReady = () => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              setTimeout(() => { setVideoReady(true); resolve() }, 100)
            } else {
              requestAnimationFrame(checkReady)
            }
          }
          checkReady()
        })
      } catch (error) {
        console.error('❌ Camera error:', error)
        alert('Camera access denied. Please allow camera access.')
      }
    })()
  }, [])

  const sceneManagerRef = useThreeScene(canvasRef, videoReady ? videoRef.current : null)
  useHandTracking(videoReady ? videoRef.current : null)
  useFaceTracking(videoReady ? videoRef.current : null, true)

  // Call SceneManager directly — skip React state to avoid ~37ms batching delay
  const onChismePhrase = useCallback(() => {
    sceneManagerRef.current?.setChismeActive(true)
    setChismeActive(true)
    addHistoryEvent({ label: '¡Chisme Potente!', icon: '📯' })
    setTimeout(() => setChismeActive(false), 3500)
  }, [sceneManagerRef, setChismeActive, addHistoryEvent])

  const onCalientePhrase = useCallback(() => {
    setCalienteActive(true)
    addHistoryEvent({ label: '¡Caliente!', icon: '🔥' })
    setTimeout(() => setCalienteActive(false), CALIENTE_DISPLAY_MS)
  }, [setCalienteActive, addHistoryEvent, CALIENTE_DISPLAY_MS])

  const onSuperElegantePhrase = useCallback(() => {
    setActiveMeme('ariel')
    addHistoryEvent({ label: '¡Super Elegante!', icon: '🎩' })
    setTimeout(() => setActiveMeme(null), MEME_DISPLAY_MS)
  }, [setActiveMeme, addHistoryEvent, MEME_DISPLAY_MS])

  useSpeechRecognition({ isListening: chismeListening, onPhrase: onChismePhrase, onCaliente: onCalientePhrase, onSuperElegante: onSuperElegantePhrase })

  return (
    <>
      <StreamLayout canvasRef={canvasRef} />
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        autoPlay
        muted
      />
    </>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)

  if (!started) return <LandingPage onStart={() => setStarted(true)} />

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
