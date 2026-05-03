import { useEffect, useRef, useContext } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'
import { snapDetector } from '../gestures/snapDetector.js'

export function useHandTracking(video) {
  const handLandmarkerRef = useRef(null)
  const { handLandmarksRef, snapActive, setSnapActive } = useContext(AppContext)
  const isInitializingRef = useRef(false)

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

              // Detect gestures from the primary hand (first hand if available)
              if (results.landmarks && results.landmarks.length > 0) {
                const primaryHand = results.landmarks[0]

                // Snap detection
                const snapDetected = snapDetector.detect(primaryHand)
                if (snapDetected) {
                  setSnapActive((prev) => {
                    const newState = !prev
                    console.log('🤏 SNAP detected! New state:', newState)
                    return newState
                  })
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
        isInitializingRef.current = false
      }
    }

    initializeHandLandmarker()

    return () => {
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close()
        handLandmarkerRef.current = null
      }
    }
  }, [video, handLandmarksRef])

  return handLandmarkerRef
}
