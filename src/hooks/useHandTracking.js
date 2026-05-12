import { useEffect, useRef, useContext } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'
import { snapDetector } from '../gestures/snapDetector.js'
import { clapDetector } from '../gestures/clapDetector.js'
import { verticalHandDetector } from '../gestures/verticalHandDetector.js'

export function useHandTracking(video) {
  const handLandmarkerRef = useRef(null)
  const { handLandmarksRef, setSnapActive, setChismeListening,
          setCurrentGestureLabel, addHistoryEvent, 
          setVerticalHandActive } = useContext(AppContext)
  const isInitializingRef = useRef(false)
  const chismeListeningRef = useRef(false)

  useEffect(() => {
    if (!video || isInitializingRef.current) return

    isInitializingRef.current = true

    const initializeHandLandmarker = async () => {
      try {
        const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        const filesetResolver = await FilesetResolver.forVisionTasks(wasmPath)

        const handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        })

        handLandmarkerRef.current = handLandmarker
        console.log('✅ HandLandmarker initialized')

        // Start detection loop
        const detectionLoop = () => {
          if (handLandmarkerRef.current && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
            try {
              const results = handLandmarkerRef.current.detectForVideo(video, Date.now())
              handLandmarksRef.current = results.landmarks

              // Detect gestures
              if (results.landmarks && results.landmarks.length > 0) {

                // Triangle gesture detection (two hands)
                const triangleDetected = triangleDetector.detect(results.landmarks)
                if (triangleDetected) {
                  setSnapActive((prev) => {
                    const newState = !prev
                    console.log('🔺 TRIANGLE detected! New state:', newState)
                    return newState
                  })
                  addHistoryEvent({ label: 'Tercer Ojo activado', icon: '🔺' })
                }

                // L-gesture (right hand) → activates voice listening
                const { isHeld } = lGestureDetector.detect(results.landmarks, results.handedness)
                if (isHeld !== chismeListeningRef.current) {
                  chismeListeningRef.current = isHeld
                  setChismeListening(isHeld)
                  if (isHeld) {
                    setCurrentGestureLabel('gesto L')
                    addHistoryEvent({ label: 'Escucha de voz activada', icon: '🤙' })
                  } else {
                    setCurrentGestureLabel(null)
                  }
                  console.log(isHeld ? '🤙 Gesto L — escucha activada' : '🤙 Gesto L soltado')
                }
              } else {
                // No hands visible — ensure listening stops
                if (chismeListeningRef.current) {
                  chismeListeningRef.current = false
                  setChismeListening(false)
                  setCurrentGestureLabel(null)
                }

                // Vertical Hand detection
                const verticalDetected = verticalHandDetector.detect(results.landmarks)
                setVerticalHandActive(verticalDetected)
              }
            } catch (error) {
              console.error('Hand detection error:', error)
            }
          }
          requestAnimationFrame(detectionLoop)
        }
        detectionLoop()
      } catch (error) {
        console.error('❌ Failed to initialize HandLandmarker:', error)
      }
    }

    initializeHandLandmarker()

    return () => {
      console.log('🧹 Cleaning up HandLandmarker')
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close()
        handLandmarkerRef.current = null
      }
      isInitializingRef.current = false  // Reset para permitir reinicialización
    }
  }, [video, handLandmarksRef, setSnapActive, setChismeListening,
      setCurrentGestureLabel, addHistoryEvent])

  return handLandmarkerRef
}
