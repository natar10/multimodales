import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AppProvider, AppContext } from './context/AppContext.jsx'
import { CanvasOverlay } from './components/CanvasOverlay.jsx'
import { useThreeScene } from './hooks/useThreeScene.js'
import { useHandTracking } from './hooks/useHandTracking.js'
import { useFaceTracking } from './hooks/useFaceTracking.js'
import { useSpeechRecognition } from './hooks/useSpeechRecognition.js'

function AppContent() {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const { snapActive, clapActive, chismeListening, setChismeActive } = React.useContext(AppContext)
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
  useThreeScene(canvasRef, videoReady ? videoRef.current : null)

  // Only initialize hand tracking AFTER video is ready
  useHandTracking(videoReady ? videoRef.current : null)

  // Initialize face tracking (always active for expression detection, but runs at 30fps)
  useFaceTracking(videoReady ? videoRef.current : null, true)

  const onChismePhrase = useCallback(() => setChismeActive(true), [setChismeActive])
  useSpeechRecognition({ isListening: chismeListening, onPhrase: onChismePhrase })

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <CanvasOverlay ref={canvasRef} />

      {/* Video element */}
      <video
        ref={videoRef}
        style={{
          display: 'none',
        }}
        playsInline
        autoPlay
        muted
      />

      {/* Status text */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          color: '#00ff88',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <div>Status: {videoReady ? '✅ Ready' : '⏳ Loading'}</div>
        <div>Snap: {snapActive ? '🟢' : '⚪'}</div>
        <div>Clap: {clapActive ? '🟢' : '⚪'}</div>
      </div>

      {/* Mic listening indicator */}
      {chismeListening && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            color: 'white',
            background: 'rgba(0,0,0,0.65)',
            padding: '5px 12px',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'monospace',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          🎤 escuchando...
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
