import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AppProvider, AppContext } from './context/AppContext.jsx'
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

  // Initialize video stream
  useEffect(() => {
    console.log('🎬 Starting video initialization...')

    const video = videoRef.current
    if (!video) {
      console.error('❌ Video element not found')
      return
    }

    ;(async () => {
      try {
        console.log('📹 Requesting camera access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        })
        console.log('✅ Camera stream obtained:', stream.getTracks().length, 'tracks')

        video.srcObject = stream
        console.log('✅ srcObject set')

        // Ensure video is playing
        video.play().catch((e) => console.warn('Play warning:', e))

        // Wait for metadata AND ensure video is playing
        await new Promise((resolve) => {
          const checkReady = () => {
            if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
              console.log('✅ Video is ready:', video.videoWidth, 'x', video.videoHeight, 'playing:', !video.paused)
              // Give it one more frame to be sure
              setTimeout(() => {
                console.log('✅ Video ready confirmed')
                setVideoReady(true)
                resolve()
              }, 100)
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

  // Only initialize Three.js AFTER video is ready
  const sceneManagerRef = useThreeScene(canvasRef, videoReady ? videoRef.current : null)

  // Only initialize hand tracking AFTER video is ready
  useHandTracking(videoReady ? videoRef.current : null)

  // Initialize face tracking (always active for expression detection, but runs at 30fps)
  useFaceTracking(videoReady ? videoRef.current : null, true)

  // Call SceneManager directly — skip React state to avoid ~37ms batching delay
  // Also update React state for UI feedback (no perf concern for UI)
  const onChismePhrase = useCallback(() => {
    const t0 = window.__chismeT0 ?? 0
    console.log(`[CHISME] T1 callback → sceneManager directo  +${(performance.now() - t0).toFixed(1)}ms desde T0`)
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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
