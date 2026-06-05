import { useEffect, useRef, useContext } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'
import { snapDetector } from '../gestures/snapDetector.js'
import { verticalHandDetector } from '../gestures/verticalHandDetector.js'
import { triangleDetector } from '../gestures/triangleDetector.js'
import { lGestureDetector } from '../gestures/lGestureDetector.js'

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

        const detectionLoop = () => {
          if (handLandmarkerRef.current && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
            try {
              const results = handLandmarkerRef.current.detectForVideo(video, Date.now())
              handLandmarksRef.current = results.landmarks

              // Portal trigger: left fist + right hand all fingers up
              const verticalDetected = verticalHandDetector.detect(results.landmarks, results.handedness)
              setVerticalHandActive(verticalDetected)

              if (results.landmarks && results.landmarks.length > 0) {
                const triangleDetected = triangleDetector.detect(results.landmarks)
                if (triangleDetected) {
                  setSnapActive((prev) => !prev)
                  addHistoryEvent({ label: 'Tercer Ojo activado', icon: '🔺' })
                }

                // Peace sign → activates voice listening
                const { isHeld } = lGestureDetector.detect(results.landmarks, results.handedness)
                if (isHeld !== chismeListeningRef.current) {
                  chismeListeningRef.current = isHeld
                  setChismeListening(isHeld)
                  if (isHeld) {
                    setCurrentGestureLabel('símbolo de paz')
                    addHistoryEvent({ label: 'Escucha de voz activada', icon: '✌️' })
                  } else {
                    setCurrentGestureLabel(null)
                  }
                }
              } else {
                if (chismeListeningRef.current) {
                  chismeListeningRef.current = false
                  setChismeListening(false)
                  setCurrentGestureLabel(null)
                }
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
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close()
        handLandmarkerRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [video, handLandmarksRef, setSnapActive, setChismeListening,
      setCurrentGestureLabel, addHistoryEvent])

  return handLandmarkerRef
}
