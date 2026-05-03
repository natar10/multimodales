import { useEffect, useRef, useContext } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { AppContext } from '../context/AppContext.jsx'

export function useFaceTracking(video, shouldInitialize) {
  const faceLandmarkerRef = useRef(null)
  const { faceLandmarksRef } = useContext(AppContext)
  const isInitializingRef = useRef(false)
  const frameCountRef = useRef(0)

  useEffect(() => {
    if (!video || !shouldInitialize) {
      // Cleanup when shouldInitialize becomes false
      if (faceLandmarkerRef.current && !shouldInitialize) {
        faceLandmarkerRef.current.close()
        faceLandmarkerRef.current = null
        faceLandmarksRef.current = null
      }
      return
    }

    if (isInitializingRef.current) return
    isInitializingRef.current = true

    const initializeFaceLandmarker = async () => {
      try {
        const wasmPath = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        const filesetResolver = await FilesetResolver.forVisionTasks(wasmPath)

        const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 2,
        })

        faceLandmarkerRef.current = faceLandmarker
        console.log('✅ FaceLandmarker initialized')

        // Start detection loop (every 3 frames)
        const detectionLoop = () => {
          if (faceLandmarkerRef.current && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
            frameCountRef.current++
            // Detect every 3 frames for performance
            if (frameCountRef.current % 3 === 0) {
              try {
                const results = faceLandmarkerRef.current.detectForVideo(video, Date.now())
                faceLandmarksRef.current = results.landmarks
              } catch (error) {
                console.error('Face detection error:', error)
              }
            }
          }
          requestAnimationFrame(detectionLoop)
        }
        detectionLoop()
      } catch (error) {
        console.error('❌ Failed to initialize FaceLandmarker:', error)
        isInitializingRef.current = false
      }
    }

    initializeFaceLandmarker()

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close()
        faceLandmarkerRef.current = null
        faceLandmarksRef.current = null
      }
    }
  }, [video, shouldInitialize, faceLandmarksRef])

  return faceLandmarkerRef
}
